
import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    userImage?: string; 
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
