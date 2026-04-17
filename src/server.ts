import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser'; 
import passport from 'passport';
import cors from 'cors';

// 1. استدعاء ملف الكنترولر فوراً لتفعيل passport.use (Google Strategy)
// ملاحظة: يجب أن يظل هذا الـ import فوق الـ Routers
import './modules/auth/auth.controller.js'; 

import { AppError } from './utils/appError.js';
import globalErrorHandler from './middleware/globalError.js';
import { dbConnections } from '../database/dbConnections.js';

// الـ Routers
import productRouter from './modules/products/product.routes.js';
import categoryRouter from './modules/categories/category.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import orderRouter from './modules/order/order.routes.js';
import dashboardRouter from './modules/dashboard/dashboard.routes.js';
import expenseRouter from './modules/expenses/expenses.routes.js';
import cartRouter from './modules/cart/cart.route.js';

const app: Application = express();

// 2. الـ Middlewares الأساسية
app.use(cors({
  origin:[
    "http://localhost:5173",
    "https://noor-store-five.vercel.app", 
    "https://api.cloudinary.com"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// الاتصال بقاعدة البيانات
dbConnections();

app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// 3. تفعيل الباسبورت (يجب أن يتم قبل تعريف الـ Routes)
app.use(passport.initialize());

app.use('/uploads', express.static('uploads'));

// 4. تعريف المسارات
// الآن سيتعرف الراوتر على استراتيجية "google" لأننا قمنا بعمل import للملف الخاص بها في الأعلى
app.use('/auth', authRouter); 
app.use('/api', userRouter);
app.use('/api', productRouter);
app.use('/api', categoryRouter);
app.use('/api', orderRouter);
app.use('/api', dashboardRouter);
app.use('/api', expenseRouter);
app.use('/api', cartRouter);

// المسار الأساسي للتأكد من عمل السيرفر
app.get('/', (req: Request, res: Response) => res.send('OK - API is running'));

// معالجة المسارات غير الموجودة
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} Not Found`, 404));
});

// ميدل وير معالجة الأخطاء العالمي
app.use(globalErrorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
