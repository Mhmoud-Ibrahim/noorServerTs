import { Router } from "express";
import { createDailyTransaction } from "./transaction.controller.js"; // تأكد من كتابة المسار الصحيح لملف الـ Controller الخاص بك
import { authenticate, allowedTo } from "../../middleware/authintecate.js";

const transactionRouter = Router();

transactionRouter.post(
  "/transactions", 
  authenticate, 
  allowedTo("admin", "employee"), 
  createDailyTransaction
);

export default transactionRouter;
