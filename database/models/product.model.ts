import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    title: string;
    description: string;
    imageCover: string;
    images: string[]; 
    category:mongoose.Types.ObjectId
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
     category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Categories',
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
    return this.imageCover ? `http://localhost:5000/${this.imageCover}` : null;
});

// Virtual لمصفوفة الصور
ProductSchema.virtual('fullImagesUrls').get(function (this: IProduct) {
    return this.images ? this.images.map(image => `http://localhost:5000/${image}`) : [];
});

// التصدير باستخدام ESM
export const ProductModel = mongoose.model<IProduct>('Products', ProductSchema);
