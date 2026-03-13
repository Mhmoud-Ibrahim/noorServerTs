import mongoose, { Document } from "mongoose";
export interface IExpense extends Document {
    title: string;
    amount: number;
    category: 'utilities' | 'rent' | 'supplies' | 'other';
    invoiceImage?: string;
    user: mongoose.Types.ObjectId;
    fullInvoiceImageUrl?: string;
}
export declare const ExpenseModel: mongoose.Model<IExpense, {}, {}, {}, mongoose.Document<unknown, {}, IExpense, {}, mongoose.DefaultSchemaOptions> & IExpense & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IExpense>;
//# sourceMappingURL=expense.model.d.ts.map