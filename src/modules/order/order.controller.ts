import { Order } from '../../../database/models/order.model.js';
import type { NextFunction, Request, Response } from "express";
import { ProductModel } from "../../../database/models/product.model.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";
import ApiFeatures from '../../utils/ApiFeatures.js';

export const createOrder = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { items, paymentType } = req.body;

    // الميدل وير يضع البيانات في req.user
    const currentUser = (req as any).user;

    let totalAmount = 0;
    const finalItems = [];

    for (const item of items) {
        const product = await ProductModel.findById(item.product);
        
        if (!product) {
            return next(new AppError(`المنتج غير موجود`, 404));
        }

        if (product.stock < item.quantity) {
            return next(new AppError(`المنتج ${product.title} غير متوفر بالكمية المطلوبة`, 400));
        }

        totalAmount += product.price * item.quantity;

        finalItems.push({
            product: product._id,
            quantity: Number(item.quantity), 
            price: product.price,
            costPrice: product.costPrice || 0 
        });

        // تحديث المخزون
        product.stock -= item.quantity;
        await product.save();
    }

    const order = new Order({
        // ملاحظة: الميدل وير عندك بيستخدم userId وليس _id
        user: currentUser.userId, 
        orderItems: finalItems,
        totalAmount,
        paymentType: paymentType || 'cash'
    });

    await order.save();

    res.status(201).json({ message: "تم تسجيل العملية بنجاح", order });
});


export const getDailyReport = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const report = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            }
        },
        {
            $unwind: "$orderItems"
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" }, // إجمالي المبيعات
                totalCost: { $sum: { $multiply: ["$orderItems.costPrice", "$orderItems.quantity"] } }, // إجمالي التكلفة
                totalOrders: { $addToSet: "$_id" } // عدد الطلبات
            }
        },
        {
            $project: {
                _id: 0,
                totalRevenue: 1,
                totalOrders: { $size: "$totalOrders" },
                netProfit: { $subtract: ["$totalRevenue", "$totalCost"] } // صافي الربح
            }
        }
    ]);

    res.status(200).json({ 
        message: "تقرير اليوم", 
        data: report[0] || { totalRevenue: 0, totalOrders: 0, netProfit: 0 } 
    });
});


// الغاء الطلب وليس حذفه 
export const cancelOrder = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return next(new AppError("الطلب غير موجود", 404));

    // 2. التأكد أن الطلب لم يتم إلغاؤه من قبل
    if (order.status === 'cancelled') {
        return next(new AppError("هذا الطلب ملغى بالفعل", 400));
    }

    // 3. إرجاع الكميات للمخزن (Loop على المنتجات داخل الطلب)
    for (const item of order.orderItems) {
        await ProductModel.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity } // زيادة المخزن بالكمية التي كانت محجوزة
        });
    }

    // 4. تغيير حالة الطلب بدلاً من حذفه (للمراجعة المحاسبية)
    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ message: "تم إلغاء الطلب بنجاح وإعادة المنتجات للمخزن", order });
});


// get all orders


export const getAllOrders = catchError(async (req: Request, res: Response, next: NextFunction) => {
    
    // 1. تجهيز الاستعلام مع عمل Populate لبيانات الموظف والمنتجات
    const mongooseQuery = Order.find()
        .populate('user', 'name email') // جلب اسم وايميل الموظف
        .populate('orderItems.product', 'title imageCover'); // جلب اسم وصورة المنتج

    // 2. تطبيق المميزات (بحث، فلترة، ترتيب، ترقيم)
    const apiFeatures = new ApiFeatures(mongooseQuery, req.query)
        .pagination()
        .filter()
        .sort()
        .search()
        .fields();

    // 3. تنفيذ الاستعلام
    const orders = await apiFeatures.mongooseQuery;

    // 4. الرد بالبيانات
    res.status(200).json({
        message: "success",
        metadata: {
            page: Number(req.query.page) || 1,
            results: orders.length
        },
        orders
    });
});
