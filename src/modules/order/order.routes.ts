// import { Router } from "express";
// import { cancelOrder, createOrder, getAllOrders, getDailyReport } from "./order.controller.js";
// import { allowedTo, authenticate } from "../../middleware/authintecate.js";

// const orderRouter = Router();

// // تسجيل عملية بيع جديدة (للموظف والآدمن)
// orderRouter.post('/orders', authenticate, allowedTo('admin', 'employee'), createOrder);
// // جلب تقرير المبيعات اليومي (للآدمن فقط أو الموظف المسؤول)
// orderRouter.get('/daily-report', authenticate, allowedTo('admin'), getDailyReport);
// // يفضل استخدام PATCH لأننا نعدل حالة الطلب فقط
// orderRouter.patch('/cancel/:id', authenticate, allowedTo('admin'), cancelOrder);
// orderRouter.get('/getAllOrders', authenticate, allowedTo('admin'), getAllOrders);

// export default orderRouter;
import { Router } from "express";
import { 
    cancelOrder, 
    createOrder, 
    createCheckoutOrder, // الوظيفة الجديدة لربط السلة
    getAllOrders, 
    getDailyReport 
} from "./order.controller.js";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";

const orderRouter = Router();

// 1. إتمام عملية الشراء من السلة (الـ Checkout الأساسي)
// متاحة للمستخدم العادي والآدمن والموظف
orderRouter.post('/checkout', 
    authenticate, 
    allowedTo('user', 'admin', 'employee'), 
    createCheckoutOrder
);

// 2. تسجيل عملية بيع يدوية (Manual Order)
// متاحة للموظف والآدمن فقط (مثلاً في الكاشير)
orderRouter.post('/orders', 
    authenticate, 
    allowedTo('admin', 'employee'), 
    createOrder
);

// 3. جلب تقرير المبيعات اليومي (للآدمن فقط)
orderRouter.get('/daily-report', 
    authenticate, 
    allowedTo('admin'), 
    getDailyReport
);

// 4. إلغاء الطلب (PATCH لأننا نعدل الـ status فقط)
orderRouter.patch('/cancel/:id', 
    authenticate, 
    allowedTo('admin'), 
    cancelOrder
);

// 5. عرض قائمة جميع الطلبات
orderRouter.get('/getAllOrders', 
    authenticate, 
    allowedTo('admin'), 
    getAllOrders
);

export default orderRouter;
