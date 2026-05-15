
import { Order } from "../../../database/models/order.model.js";
import { ExpenseModel } from "../../../database/models/expense.model.js";
import { ProductModel } from "../../../database/models/product.model.js";
import { catchError } from "../../middleware/catchError.js";
import type { Request, Response, NextFunction } from "express";

export const getDashboardStats = catchError(async (req: Request, res: Response, next: NextFunction) => {
    // 1. استخراج التواريخ من الـ Query Params
    const { from, to } = req.query;

    // الإعدادات الافتراضية (بداية اليوم ونهايته)
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // إذا حدد المستخدم تاريخ مخصص
    if (from) startDate = new Date(from as string);
    if (to) {
        endDate = new Date(to as string);
        endDate.setHours(23, 59, 59, 999);
    }

  // 2. حساب المبيعات وتكلفة المنتجات بدقة (تجنب تكرار totalAmount بسبب الـ unwind)
const salesStatsArray = await Order.aggregate([
    { 
        $match: { 
            createdAt: { $gte: startDate, $lte: endDate }, 
            status: "completed" 
        } 
    },
    {
        $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" }, // يحسب الإجمالي الفعلي للطلبات مرة واحدة
            orderItemsList: { $push: "$orderItems" },
            ordersList: { $addToSet: "$_id" }
        }
    },
    { $unwind: "$orderItemsList" },
    { $unwind: "$orderItemsList" }, // فتح مصفوفة المنتجات لحساب التكلفة
    {
        $group: {
            _id: null,
            totalRevenue: { $first: "$totalRevenue" },
            totalProductCost: { $sum: { $multiply: ["$orderItemsList.costPrice", "$orderItemsList.quantity"] } },
            ordersCount: { $first: { $size: "$ordersList" } }
        }
    }
]);

    // 3. حساب إجمالي المصروفات
    const expenseStatsArray = await ExpenseModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
            $group: {
                _id: null,
                totalExpenses: { $sum: "$amount" }
            }
        }
    ]);

    // 4. جلب أكثر 5 منتجات مبيعاً
    const topSellingProducts = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: "completed" } },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: "$orderItems.product",
                totalSold: { $sum: "$orderItems.quantity" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "products", 
                localField: "_id",
                foreignField: "_id",
                as: "details"
            }
        },
        { $unwind: "$details" },
        {
            $project: {
                _id: 1,
                title: "$details.title",
                totalSold: 1,
                currentStock: "$details.stock"
            }
        }
    ]);

    // 5. جلب تنبيهات المخزن المنخفض
    const lowStockAlerts = await ProductModel.find({ stock: { $lt: 5 } })
        .select('title stock price')
        .limit(10);

    // استخراج القيم من المصفوفات الناتجة
    const salesData = salesStatsArray[0] || { totalRevenue: 0, totalProductCost: 0, ordersList: [] };
    const expenseData = expenseStatsArray[0] || { totalExpenses: 0 };

    const revenue = salesData.totalRevenue;
    const productCost = salesData.totalProductCost;
    const externalExpenses = expenseData.totalExpenses;
    const ordersCount = salesData.ordersList.length;

    // حساب صافي الربح ونسبته
    const netProfit = revenue - (productCost + externalExpenses);
    const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) + "%" : "0%";

    // 6. إرسال الرد بتنسيق تاريخ مقروء ونظيف
    res.status(200).json({
        message: "success",
        reportPeriod: {
            from: startDate.toISOString().split('T')[0],
            to: endDate.toISOString().split('T')[0],
            generatedAt: new Date().toLocaleString('ar-EG') // توقيت استخراج التقرير بالعربية
        },
        data: {
            summary: {
                totalRevenue: revenue,
                totalExpenses: externalExpenses,
                productCost: productCost,
                netProfit: netProfit,
                profitMargin: profitMargin,
                ordersCount: ordersCount
            },
            topSellingProducts,
            lowStockAlerts
        }
    });
});
