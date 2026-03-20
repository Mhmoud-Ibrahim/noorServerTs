// import mongoose, { Schema, Document } from "mongoose";

// export interface ICategory extends Document {
//      _id:mongoose.Types.ObjectId;
//     name: string;
//     slug: string;
//     imageCover: string;
//     fullImageUrl?: string;
   
// }
// const CategorySchema = new Schema<ICategory>({
//     name: {
//         type: String,
//         trim: true,
//         minLength: [2, 'too short product name'] 
//     },
//     slug:{
//         type:String,
//         lowercase:true,
//         required:true
//     },
//     imageCover: String,
// }, {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });

// CategorySchema.virtual('fullImageUrl').get(function (this: ICategory) {
//     return this.imageCover ? `https://noor-server-ts.vercel.app/uploads/categories${this.imageCover}` : null;
// });
// export const CategoryModel = mongoose.model<ICategory>('Categories', CategorySchema);
import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    imageCover: string; // سيحتوي على رابط Cloudinary المباشر
}

const CategorySchema = new Schema<ICategory>({
    name: {
        type: String,
        trim: true,
        minLength: [2, 'too short category name'] 
    },
    slug: {
        type: String,
        lowercase: true,
        required: true
    },
    imageCover: {
        type: String,
        required: true // يفضل جعله مطلوباً
    }
}, {
    timestamps: true
});

// ملاحظة: تم حذف الـ Virtual 'fullImageUrl' 
// لأن imageCover سيبدأ بـ https://cloudinary.com تلقائياً

export const CategoryModel = mongoose.model<ICategory>('Categories', CategorySchema);
