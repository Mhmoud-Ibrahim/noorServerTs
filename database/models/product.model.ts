
import mongoose, { Schema, Document } from "mongoose";
import type { ICategory } from "./category.model.js";

export interface IProduct extends Document {
    title: string;
    description: string;
    imageCover: string; 
    images: string[];  
    category: mongoose.Types.ObjectId | ICategory; 
    price: number;
    stock: number;
    slug: string;
    costPrice: number;
}

const ProductSchema = new Schema<IProduct>({
    title: {
        type: String,
        trim: true,
        minLength: [1, 'too short product name'] 
    },
    slug: {
        type: String,
        lowercase: true,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        minLength: [1, 'too short description'],
        maxLength: [1000, 'too long description']
    },
    category: {
        type: Schema.Types.ObjectId, 
        ref: 'Categories', 
        required: true
    },
    imageCover: String,
    images: [String], 
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

// تم حذف الـ Virtuals بالكامل لأن الروابط أصبحت مخزنة بشكل كامل وجاهز في imageCover و images

export const ProductModel = mongoose.model<IProduct>('Products', ProductSchema);
