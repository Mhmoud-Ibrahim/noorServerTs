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
    slug:string,
    costPrice: number;
    fullImageCoverUrl?: string;
    fullImagesUrls?: string[];
}

const ProductSchema = new Schema<IProduct>({
    title: {
        type: String,
        trim: true,
        minLength: [2, 'too short product name'] 
    },
     slug:{
        type:String,
        lowercase:true,
        required:true
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
        minLength: [10, 'too short description'],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey:false
});

// Virtual للصورة الأساسية
ProductSchema.virtual('fullImageCoverUrl').get(function (this: IProduct) {
    return this.imageCover ? `https://noor-server-ts.vercel.app/uploads/products${this.imageCover}` : null;
});

// Virtual لمصفوفة الصور
ProductSchema.virtual('fullImagesUrls').get(function (this: IProduct) {
    return this.images ? this.images.map(image => `https://noor-server-ts.vercel.app/uploads/products${image}`) : [];
});

// التصدير باستخدام ESM
export const ProductModel = mongoose.model<IProduct>('Products', ProductSchema);
