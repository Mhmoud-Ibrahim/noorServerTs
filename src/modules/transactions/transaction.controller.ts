import { ProductModel } from "../../../database/models/product.model.js";
import { Order } from "../../../database/models/order.model.js";
import { ExpenseModel } from "../../../database/models/expense.model.js";
import { catchError } from "../../middleware/catchError.js";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";

export const createDailyTransaction = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { type, customerName, productId, quantity, amount, notes } = req.body;

    // 1. إذا كانت المعاملة عملية بيع (كاش)
    if (type === "sale") {
        if (!productId) return res.status(400).json({ message: "يجب تحديد المنتج" });
        
        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ message: "المنتج غير موجود بالمخزن" });
        if (product.stock < quantity) return res.status(400).json({ message: "المخزون الحالي لا يكفي لإتمام هذه العملية" });

        const totalAmount = product.price * quantity;
        
        // تحويل المعرّفات برمجياً لتطابق الـ Schema الصارمة وحل مشاكل الـ Typescript
        const productObjectId = new mongoose.Types.ObjectId(productId as string);
        const userObjectId = new mongoose.Types.ObjectId((req as any).user?._id as string);

        // إنشاء الطلب متوافق كلياً مع الحقول الحالية والمحدثة
        const newOrder = await Order.create({
            user: userObjectId, 
            customerName: customerName || "زبون نقدي",
            orderItems: [{
                product: productObjectId,
                quantity: Number(quantity),
                price: product.price,
                costPrice: product.costPrice // لحساب صافي الأرباح بدقة بالداش بورد بالفرق عن سعر البيع
            }],
            totalAmount: totalAmount,
            status: "completed",
            paymentType: "cash", // متوافق مع خيارات الـ enum بالـ Schema
            notes: notes || ""
        });

        // تخصيم الكمية المباعة من مخزن المنتج ومزامنتها فوراً
        product.stock -= Number(quantity);
        await product.save();

        // جلب وثيقة الطلب كاملة ومطوّرة بالبيانات لإرسالها وجعلها جاهزة لطباعة الـ PDF بالفرونت إند
        const populatedOrder = await Order.findById(newOrder._id)
          .populate("orderItems.product", "title price userImage")
          .populate("user", "name");

        return res.status(201).json({ 
            message: "success", 
            invoiceData: populatedOrder 
        });
    }

    // 2. إذا كانت المعاملة مصروفات عامة للمحل (إيجار، كهرباء، إلخ)
    if (type === "expense") {
        if (!amount || amount <= 0) return res.status(400).json({ message: "يجب إدخال مبلغ مصروفات صحيح" });

        // تم حذف حقل createdAt يدوياً هنا ليتم توليده ذاتياً وآلياً بواسطة السيرفر وقاعدة البيانات
        // عبر خاصية الـ timestamps المفعّلة، مما يزيل خطأ الـ known properties نهائياً
        const newExpense = await ExpenseModel.create({
            title: notes || "مصاريف غير مصنفة",
            amount: Number(amount)
        });

        return res.status(201).json({ 
            message: "success", 
            data: newExpense 
        });
    }

    return res.status(400).json({ message: "نوع معاملة غير مدعوم" });
});
