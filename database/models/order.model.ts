import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    user: Schema.Types.ObjectId; // الموظف الذي قام بالعملية
    orderItems: {
        product: Schema.Types.ObjectId;
        quantity: number;
        price: number;        // سعر البيع وقت الطلب
        costPrice: number;    // سعر التكلفة (لحساب الربح لاحقاً)
    }[];
    status: 'completed' | 'cancelled';
    totalAmount: number;
    paymentType: 'cash' | 'card';
    createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{
        product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
       quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        costPrice: { type: Number, required: true } 
    }],status: { 
    type: String, 
    enum: ['completed', 'cancelled'], 
    default: 'completed' 
},
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ['cash', 'card'], default: 'cash' }
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
