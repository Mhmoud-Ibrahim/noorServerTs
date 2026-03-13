

import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser'; 

import { AppError } from './utils/appError.js';
import globalErrorHandler from './middleware/globalError.js';
import cors from 'cors';
import userRouter from './modules/auth/user.routes.js';
import { dbConnections } from '../database/dbConnections.js';
import productRouter from './modules/products/product.routes.js';
import categoryRouter from './modules/categories/category.routes.js';
import authRouter from './modules/auth/user.routes.js';

dbConnections();
const app: Application = express();
app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use('/uploads', express.static('uploads'));
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/api', productRouter);
app.use('/api', categoryRouter);
;





app.get('/', (req, res) => res.send('OK'));
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} Not Found`, 404))
})
app.use(globalErrorHandler)
const port =process.env.PORT || 3000;

app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
