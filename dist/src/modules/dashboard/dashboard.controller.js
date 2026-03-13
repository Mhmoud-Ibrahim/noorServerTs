// // import { Order } from "../../../database/models/order.model.js";
// // import { ExpenseModel } from "../../../database/models/expense.model.js";
// // import { ProductModel } from "../../../database/models/product.model.js";
// // import { catchError } from "../../middleware/catchError.js";
// // import type { Request, Response, NextFunction } from "express";
// // export const getDashboardStats = catchError(async (req: Request, res: Response, next: NextFunction) => {
// //     // 1. تحديد بداية ونهاية اليوم الحالي
// //     const start = new Date();
// //     start.setHours(0, 0, 0, 0);
// //     const end = new Date();
// //     end.setHours(23, 59, 59, 999);
// //     // 2. حساب إجمالي المبيعات وتكلفة المنتجات المباعة (فقط الطلبات المكتملة)
// //     const salesStats = await Order.aggregate([
// //         { 
// //             $match: { 
// //                 createdAt: { $gte: start, $lte: end }, 
// //                 status: "completed" 
// //             } 
// //         },
// //         { $unwind: "$orderItems" },
// //         {
// //             $group: {
// //                 _id: null,
// //                 totalRevenue: { $sum: "$totalAmount" },
// //                 totalProductCost: { $sum: { $multiply: ["$orderItems.costPrice", "$orderItems.quantity"] } },
// //                 ordersCount: { $addToSet: "$_id" }
// //             }
// //         }
// //     ]);
// //     // 3. حساب إجمالي المصروفات الخارجية لليوم
// //     const expenseStats = await ExpenseModel.aggregate([
// //         { $match: { createdAt: { $gte: start, $lte: end } } },
// //         {
// //             $group: {
// //                 _id: null,
// //                 totalExpenses: { $sum: "$amount" }
// //             }
// //         }
// //     ]);
// //     // 4. جلب أكثر 5 كتب مبيعاً اليوم
// //     const topSellingProducts = await Order.aggregate([
// //         { 
// //             $match: { 
// //                 createdAt: { $gte: start, $lte: end }, 
// //                 status: "completed" 
// //             } 
// //         },
// //         { $unwind: "$orderItems" },
// //         {
// //             $group: {
// //                 _id: "$orderItems.product",
// //                 totalSold: { $sum: "$orderItems.quantity" }
// //             }
// //         },
// //         { $sort: { totalSold: -1 } },
// //         { $limit: 5 },
// //         {
// //             $lookup: {
// //                 from: "products", // تأكد أن هذا هو اسم الـ collection في MongoDB
// //                 localField: "_id",
// //                 foreignField: "_id",
// //                 as: "details"
// //             }
// //         },
// //         { $unwind: "$details" },
// //         {
// //             $project: {
// //                 _id: 1,
// //                 title: "$details.title",
// //                 totalSold: 1,
// //                 currentStock: "$details.stock"
// //             }
// //         }
// //     ]);
// //     // 5. جلب تنبيهات المخزن (الكتب التي قارب مخزونها على النفاذ - أقل من 5)
// //     const lowStockAlerts = await ProductModel.find({ stock: { $lt: 5 } })
// //         .select('title stock price')
// //         .limit(10);
// //     // تجهيز الأرقام النهائية
// //     const revenue = salesStats[0]?.totalRevenue || 0;
// //     const productCost = salesStats[0]?.totalProductCost || 0;
// //     const externalExpenses = expenseStats[0]?.totalExpenses || 0;
// //     const ordersCount = salesStats[0]?.ordersCount?.length || 0;
// //     // صافي الربح = الإيرادات - (تكلفة البضاعة + المصروفات الخارجية)
// //     const netProfit = revenue - (productCost + externalExpenses);
// //     // إرسال الرد النهائي
// //     res.status(200).json({
// //         message: "success",
// //         data: {
// //             summary: {
// //                 totalRevenue: revenue,
// //                 totalExpenses: externalExpenses,
// //                 productCost: productCost,
// //                 netProfit: netProfit,
// //                 ordersCount: ordersCount
// //             },
// //             topSellingProducts,
// //             lowStockAlerts
// //         }
// //     });
// // });
// import { Order } from "../../../database/models/order.model.js";
// import { ExpenseModel } from "../../../database/models/expense.model.js";
// import { ProductModel } from "../../../database/models/product.model.js";
// import { catchError } from "../../middleware/catchError.js";
// import type { Request, Response, NextFunction } from "express";
// export const getDashboardStats = catchError(async (req: Request, res: Response, next: NextFunction) => {
//     // 1. استخراج التواريخ من الـ Query Params
//     const { from, to } = req.query;
//     // الإعدادات الافتراضية (اليوم الحالي)
//     let startDate = new Date();
//     startDate.setHours(0, 0, 0, 0);
//     let endDate = new Date();
//     endDate.setHours(23, 59, 59, 999);
//     // إذا حدد المستخدم تاريخ بداية ونهاية
//     if (from) startDate = new Date(from as string);
//     if (to) {
//         endDate = new Date(to as string);
//         endDate.setHours(23, 59, 59, 999);
//     }
//     // 2. حساب المبيعات وتكلفة المنتجات في الفترة المحددة
//     const salesStats = await Order.aggregate([
//         { 
//             $match: { 
//                 createdAt: { $gte: startDate, $lte: endDate }, 
//                 status: "completed" 
//             } 
//         },
//         { $unwind: "$orderItems" },
//         {
//             $group: {
//                 _id: null,
//                 totalRevenue: { $sum: "$totalAmount" },
//                 totalProductCost: { $sum: { $multiply: ["$orderItems.costPrice", "$orderItems.quantity"] } },
//                 ordersList: { $addToSet: "$_id" }
//             }
//         }
//     ]);
//     // 3. حساب إجمالي المصروفات في الفترة المحددة
//     const expenseStats = await ExpenseModel.aggregate([
//         { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
//         {
//             $group: {
//                 _id: null,
//                 totalExpenses: { $sum: "$amount" }
//             }
//         }
//     ]);
//     // 4. جلب أكثر 5 منتجات مبيعاً في هذه الفترة
//     const topSellingProducts = await Order.aggregate([
//         { 
//             $match: { 
//                 createdAt: { $gte: startDate, $lte: endDate }, 
//                 status: "completed" 
//             } 
//         },
//         { $unwind: "$orderItems" },
//         {
//             $group: {
//                 _id: "$orderItems.product",
//                 totalSold: { $sum: "$orderItems.quantity" }
//             }
//         },
//         { $sort: { totalSold: -1 } },
//         { $limit: 5 },
//         {
//             $lookup: {
//                 from: "products", // تأكد أن هذا هو اسم الـ Collection في MongoDB
//                 localField: "_id",
//                 foreignField: "_id",
//                 as: "details"
//             }
//         },
//         { $unwind: "$details" },
//         {
//             $project: {
//                 _id: 1,
//                 title: "$details.title",
//                 totalSold: 1,
//                 currentStock: "$details.stock"
//             }
//         }
//     ]);
//     // 5. جلب تنبيهات المخزن المنخفض (أقل من 5 قطع) - عام وليس مرتبط بفترة
//     const lowStockAlerts = await ProductModel.find({ stock: { $lt: 5 } })
//         .select('title stock price')
//         .limit(10);
//     // استخراج القيم من مصفوفات الـ Aggregation (أو وضع 0 إذا كانت فارغة)
//     const salesData = salesStats[0] || { totalRevenue: 0, totalProductCost: 0, ordersList: [] };
//     const expenseData = expenseStats[0] || { totalExpenses: 0 };
//     const revenue = salesData.totalRevenue;
//     const productCost = salesData.totalProductCost;
//     const externalExpenses = expenseData.totalExpenses;
//     const ordersCount = salesData.ordersList.length;
//     // صافي الربح = الإيرادات - (تكلفة البضاعة + المصروفات الخارجية)
//     const netProfit = revenue - (productCost + externalExpenses);
//     res.status(200).json({
//         message: "success",
//         period: {
//             from: startDate,
//             to: endDate
//         },
//         data: {
//             summary: {
//                 totalRevenue: revenue,
//                 totalExpenses: externalExpenses,
//                 productCost: productCost,
//                 netProfit: netProfit,
//                 ordersCount: ordersCount
//             },
//             topSellingProducts,
//             lowStockAlerts
//         }
//     });
// });
import { Order } from "../../../database/models/order.model.js";
import { ExpenseModel } from "../../../database/models/expense.model.js";
import { ProductModel } from "../../../database/models/product.model.js";
import { catchError } from "../../middleware/catchError.js";
export const getDashboardStats = catchError(async (req, res, next) => {
    // 1. استخراج التواريخ من الـ Query Params
    const { from, to } = req.query;
    // الإعدادات الافتراضية (بداية اليوم ونهايته)
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    // إذا حدد المستخدم تاريخ مخصص
    if (from)
        startDate = new Date(from);
    if (to) {
        endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
    }
    // 2. حساب المبيعات وتكلفة المنتجات (Aggregation)
    const salesStatsArray = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: "completed"
            }
        },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                totalProductCost: { $sum: { $multiply: ["$orderItems.costPrice", "$orderItems.quantity"] } },
                ordersList: { $addToSet: "$_id" }
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
//# sourceMappingURL=dashboard.controller.js.map