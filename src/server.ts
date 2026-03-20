

import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser'; 

import { AppError } from './utils/appError.js';
import globalErrorHandler from './middleware/globalError.js';
import cors from 'cors';

import { dbConnections } from '../database/dbConnections.js';
import productRouter from './modules/products/product.routes.js';
import categoryRouter from './modules/categories/category.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import orderRouter from './modules/order/order.routes.js';
import dashboardRouter from './modules/dashboard/dashboard.routes.js';
import expenseRouter from './modules/expenses/expenses.routes.js';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
app.use(cors({
  origin:"http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
dbConnections();
app.use(cookieParser());


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static('uploads'));
app.use('/auth', authRouter);
app.use('/api', userRouter);
app.use('/api',productRouter)
app.use('/api',categoryRouter)
app.use('/api',orderRouter)
app.use('/api',dashboardRouter)
app.use('/api',expenseRouter)





app.get('/', (req, res) => res.send('OK api is running'));
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} Not Found`, 404))
})
app.use(globalErrorHandler)
const port =process.env.PORT ||8000;

app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
