

// import express from 'express';
// import type { Application, NextFunction, Request, Response } from 'express';
// import cookieParser from 'cookie-parser'; 

// import { AppError } from './utils/appError.js';
// import globalErrorHandler from './middleware/globalError.js';
// import cors from 'cors';

// import { dbConnections } from '../database/dbConnections.js';
// import productRouter from './modules/products/product.routes.js';
// import categoryRouter from './modules/categories/category.routes.js';
// import authRouter from './modules/auth/auth.routes.js';
// import userRouter from './modules/user/user.routes.js';
// import orderRouter from './modules/order/order.routes.js';
// import dashboardRouter from './modules/dashboard/dashboard.routes.js';
// import expenseRouter from './modules/expenses/expenses.routes.js';
// import dotenv from 'dotenv';
// import cartRouter from './modules/cart/cart.route.js';
// import passport from 'passport';
// import './modules/user/user.controller.js'; // استدعاء ملف الإعداد الذي أنشأناه
//  // تأكد من المسار الصحيح لملف الباسبورت الذي أنشأناه


// dotenv.config();

// const app: Application = express();

// // ... بعد تعريف الـ app
// app.use(passport.initialize());
// app.use(cors({
//   origin:[
//     "http://localhost:5173",
//     "https://noor-store-five.vercel.app",
//     "https://api.cloudinary.com"
//   ],

//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   credentials: true, 
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));
// dbConnections();
// app.use(cookieParser());


// app.use(express.json({ limit: '15mb' }));
// app.use(express.urlencoded({ limit: '15mb', extended: true }));

// app.use('/uploads', express.static('uploads'));
// app.use('/auth', authRouter);
// app.use('/api', userRouter);
// app.use('/api',productRouter)
// app.use('/api',categoryRouter)
// app.use('/api',orderRouter)
// app.use('/api',dashboardRouter)
// app.use('/api',expenseRouter)
// app.use('/api',cartRouter)

// app.use(passport.initialize());



// app.get('/', (req, res) => res.send('OK api is running'));
// app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
//   next(new AppError(`Route ${req.originalUrl} Not Found`, 404))
// })
// app.use(globalErrorHandler)
// const port =process.env.PORT ||8000;

// app.listen(port, () => {
//   console.log(` Server running on http://localhost:${port}`);
// });
import dotenv from 'dotenv';
dotenv.config();

// 1. يجب استدعاء ملف الإعدادات أولاً وقبل الـ Routes
import './modules/user/user.controller.js'; 

import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser'; 
import passport from 'passport';
import cors from 'cors';

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
    "https://vercel.app",
    "https://cloudinary.com"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

dbConnections();
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// 3. تفعيل الباسبورت قبل الـ Routes
app.use(passport.initialize());

app.use('/uploads', express.static('uploads'));

// 4. تعريف المسارات
app.use('/auth', authRouter); // الـ Google Auth بداخل هذا الراوتر
app.use('/api', userRouter);
app.use('/api', productRouter);
app.use('/api', categoryRouter);
app.use('/api', orderRouter);
app.use('/api', dashboardRouter);
app.use('/api', expenseRouter);
app.use('/api', cartRouter);

app.get('/', (req, res) => res.send('OK api is running'));

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} Not Found`, 404))
});

app.use(globalErrorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
