import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId; // الموظف الذي قام بالعملية (محدث ومحمي)
    customerName?: string;         // اسم العميل (مبيعات الكاش والمحل)
    orderItems: {
        product: mongoose.Types.ObjectId; // محدث لمنع أخطاء الـ Assignment
        quantity: number;
        price: number;        
        costPrice: number;    
    }[];
    status: 'completed' | 'cancelled';
    totalAmount: number;
    paymentType: 'cash' | 'card';
    notes?: string;              
    createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, default: 'زبون نقدي' }, 
    orderItems: [{
        product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        costPrice: { type: Number, required: true } 
    }],
    status: { 
        type: String, 
        enum: ['completed', 'cancelled'], 
        default: 'completed' 
    },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ['cash', 'card'], default: 'cash' },
    notes: { type: String, default: '' } 
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
