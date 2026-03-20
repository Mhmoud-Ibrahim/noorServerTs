//  import mongoose from "mongoose";
// export interface IUser extends Document {
//     name: string;
//     email: string;
//     password: string;
//     userImage?: string;
//     fullUserImage?: string;
//     role: string; 
// }

// const Schema = new mongoose.Schema<IUser>({
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     password: { type: String, required: true },
//     userImage: { type: String, default: null },
//     role: { 
//         type: String, 
//         enum: ['user', 'admin','employee'], // مسموح فقط بهاتين القيمتين
//         default: 'user' // أي مستخدم جديد سيكون user تلقائياً
//     }
// }, {
//    timestamps: true,
//   versionKey: false,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// Schema.virtual('fullUserImage').get(function (this: IUser) {
//   if (this.userImage) {
//     if (this.userImage.startsWith('http://m2dd-serverchatapp.hf.space')) {
//       return this.userImage.replace('http://', 'https://');
//     }
//     if (!this.userImage.startsWith('http')) {
//       return `https://m2dd-serverchatapp.hf.space/uploads/user${this.userImage}`;
//     }
    
//     return this.userImage; 
//   }
//   return null;
// });

// export const User = mongoose.model('User', Schema)
import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    userImage?: string; // سيخزن رابط Cloudinary المباشر
    role: string; 
}

const UserSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    userImage: { type: String, default: null },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'employee'],
        default: 'user'
    }
}, {
    timestamps: true,
    versionKey: false
});

// تم حذف الـ Virtual 'fullUserImage' 
// لأن الرابط سيُخزن كاملاً كـ https://cloudinary.com...

export const User = mongoose.model<IUser>('User', UserSchema);
