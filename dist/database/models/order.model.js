import mongoose, { Schema, Document } from 'mongoose';
const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{
            product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            costPrice: { type: Number, required: true }
        }], status: {
        type: String,
        enum: ['completed', 'cancelled'],
        default: 'completed'
    },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ['cash', 'card'], default: 'cash' }
}, { timestamps: true });
export const Order = mongoose.model('Order', orderSchema);
//# sourceMappingURL=order.model.js.map