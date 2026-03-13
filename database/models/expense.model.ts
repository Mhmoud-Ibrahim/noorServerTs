import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
    title: string;
    amount: number;
    category: 'utilities' | 'rent' | 'supplies' | 'other';
    invoiceImage?: string;
    user: mongoose.Types.ObjectId;
    fullInvoiceImageUrl?: string;
}

const ExpenseSchema = new Schema<IExpense>({
    title: {
        type: String,
        trim: true,
        required: [true, 'title is required'],
        minLength: [3, 'too short expense title']
    },
    amount: {
        type: Number,
        required: [true, 'amount is required'],
        min: [0, 'amount cannot be negative']
    },
    category: {
        type: String,
        enum: ['utilities', 'rent', 'supplies', 'other'],
        default: 'other'
    },
    invoiceImage: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false
});

// Virtual لرابط صورة الفاتورة
ExpenseSchema.virtual('fullInvoiceImageUrl').get(function (this: IExpense) {
    return this.invoiceImage ? `http://localhost:5000/uploads/expenses/${this.invoiceImage}` : null;
});

export const ExpenseModel = mongoose.model<IExpense>('Expenses', ExpenseSchema);
