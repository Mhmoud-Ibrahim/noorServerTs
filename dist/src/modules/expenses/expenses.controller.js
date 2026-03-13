import { ExpenseModel } from "../../../database/models/expense.model.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";
export const addExpense = catchError(async (req, res, next) => {
    // إذا كان هناك صورة مرفوعة من الميدل وير
    if (req.file) {
        req.body.invoiceImage = req.file.filename;
    }
    // إنشاء المصروف وربطه بالموظف/الآدمن الحالي
    const expense = new ExpenseModel({
        title: req.body.title,
        amount: Number(req.body.amount),
        category: req.body.category,
        invoiceImage: req.body.invoiceImage,
        user: req.user.userId // المعرف القادم من التوكن (الميدل وير)
    });
    await expense.save();
    res.status(201).json({
        message: "تم تسجيل المصروف بنجاح",
        expense
    });
});
// دالة إضافية لجلب كل المصروفات للمراجعة
export const getAllExpenses = catchError(async (req, res, next) => {
    const expenses = await ExpenseModel.find().populate('user', 'name');
    res.status(200).json({ message: "success", expenses });
});
//# sourceMappingURL=expenses.controller.js.map