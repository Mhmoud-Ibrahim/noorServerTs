import { Router } from "express";
import { authenticate, allowedTo } from "../../middleware/authintecate.js";
import { uploadSingleFile } from "../../middleware/fileUpload.js";
import { addExpense, getAllExpenses } from "./expenses.controller.js";
const expenseRouter = Router();
expenseRouter.route('/expenses')
    .post(authenticate, allowedTo('admin', 'employee'), uploadSingleFile('invoiceImage', 'expenses'), // اسم الحقل في Postman واسم المجلد
addExpense)
    .get(authenticate, allowedTo('admin'), getAllExpenses);
export default expenseRouter;
//# sourceMappingURL=expenses.routes.js.map