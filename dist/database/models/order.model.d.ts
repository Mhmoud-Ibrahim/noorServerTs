import mongoose, { Schema, Document } from 'mongoose';
export interface IOrder extends Document {
    user: Schema.Types.ObjectId;
    orderItems: {
        product: Schema.Types.ObjectId;
        quantity: number;
        price: number;
        costPrice: number;
    }[];
    status: 'completed' | 'cancelled';
    totalAmount: number;
    paymentType: 'cash' | 'card';
    createdAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
//# sourceMappingURL=order.model.d.ts.map