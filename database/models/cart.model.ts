import mongoose, { Schema, Document } from "mongoose";
import type { IProduct } from "./product.model.js";

// واجهة تعريف محتويات السلة (المنتجات المفردة داخل السلة)
interface ICartItem {
    _id?: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId | IProduct;
    quantity: number;
    price: number; // تخزين السعر وقت الإضافة لضمان ثبات الفاتورة
}

// واجهة تعريف موديل السلة
export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    cartItems: ICartItem[];
    totalCartPrice: number;
    totalPriceAfterDiscount?: number;
    discount?: number;
}

const CartSchema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // تأكد أن اسم الموديل عندك 'User'
        required: [true, 'Cart must belong to a user']
    },
    cartItems: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Products',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, 'Quantity cannot be less than 1']
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalCartPrice: {
        type: Number,
        default: 0
    },
    totalPriceAfterDiscount: Number,
    discount: Number
}, {
    timestamps: true,
    versionKey: false
});

export const CartModel = mongoose.model<ICart>('Cart', CartSchema);
