import { Router } from "express";
import { cancelOrder, createOrder, getAllOrders, getDailyReport } from "./order.controller.js";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";

const orderRouter = Router();

// استخدام مسارات واضحة لمنع التداخل والتعارض مع الموديلات الأخرى
orderRouter.post('/', authenticate, allowedTo('admin', 'employee'), createOrder);
orderRouter.get('/daily-report', authenticate, allowedTo('admin'), getDailyReport);
orderRouter.patch('/cancel/:id', authenticate, allowedTo('admin'), cancelOrder);
orderRouter.get('/all', authenticate, allowedTo('admin'), getAllOrders);

export default orderRouter;
