import { Router } from "express";
import { cancelOrder, createOrder, getAllOrders, getDailyReport } from "./order.controller.js";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";

const orderRouter = Router();

// تسجيل عملية بيع جديدة (للموظف والآدمن)
orderRouter.post('/orders', authenticate, allowedTo('admin', 'employee'), createOrder);
// جلب تقرير المبيعات اليومي (للآدمن فقط أو الموظف المسؤول)
orderRouter.get('/daily-report', authenticate, allowedTo('admin'), getDailyReport);
// يفضل استخدام PATCH لأننا نعدل حالة الطلب فقط
orderRouter.patch('/cancel/:id', authenticate, allowedTo('admin'), cancelOrder);
orderRouter.get('/getAllOrders', authenticate, allowedTo('admin'), getAllOrders);

export default orderRouter;
