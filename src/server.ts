

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
// dotenv.config();

// const app: Application = express();
// app.use(cors({
//   origin: ["http://localhost:3000", "http://172.20.10.5:3000"],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   credentials: true, 
 
// }));
// dbConnections();
// app.use(cookieParser());


// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// app.use('/uploads', express.static('uploads'));
// app.use('/auth', authRouter);
// app.use('/api', userRouter,
//   productRouter,
//   categoryRouter,
//   orderRouter,
//   expenseRouter,
//   dashboardRouter);






// app.get('/', (req, res) => res.send('OK api is running'));
// app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
//   next(new AppError(`Route ${req.originalUrl} Not Found`, 404))
// })
// app.use(globalErrorHandler)
// const port =process.env.PORT ||8000;

// app.listen(port, () => {
//   console.log(` Server running on http://localhost:${port}`);
// });

import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser'; 
import cors from 'cors';
import dotenv from 'dotenv';

import { AppError } from './utils/appError.js';
import globalErrorHandler from './middleware/globalError.js';
import { dbConnections } from '../database/dbConnections.js';

import productRouter from './modules/products/product.routes.js';
import categoryRouter from './modules/categories/category.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import orderRouter from './modules/order/order.routes.js';
import dashboardRouter from './modules/dashboard/dashboard.routes.js';
import expenseRouter from './modules/expenses/expenses.routes.js';

dotenv.config();

const app: Application = express();

// 1. إعدادات CORS في مقدمة الملف تماماً
app.use(cors({
  origin: ["http://localhost:3000", "http://172.20.10.5:3000"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // ضروري لأنك تستخدم cookie-parser
}));

// 2. هيدر إضافي لضمان السماح بالـ Credentials في كل الردود
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && "http://localhost:3000".includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// 3. بقية الـ Middlewares الأساسية
dbConnections();
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// 4. الراوترات
app.use('/auth', authRouter);
app.use('/api', 
  userRouter,
  productRouter,
  categoryRouter,
  orderRouter,
  expenseRouter,
  dashboardRouter
);

app.get('/', (req, res) => res.send('OK api is running'));

// 5. معالجة المسارات غير الموجودة والأخطاء
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} Not Found`, 404))
});

app.use(globalErrorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
