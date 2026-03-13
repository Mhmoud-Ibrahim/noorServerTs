import mongoose from "mongoose";
const Schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    userImage: { type: String, default: null },
    role: {
        type: String,
        enum: ['user', 'admin', 'employee'], // مسموح فقط بهاتين القيمتين
        default: 'user' // أي مستخدم جديد سيكون user تلقائياً
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
Schema.virtual('fullUserImage').get(function () {
    if (this.userImage) {
        if (this.userImage.startsWith('http://m2dd-serverchatapp.hf.space')) {
            return this.userImage.replace('http://', 'https://');
        }
        if (!this.userImage.startsWith('http')) {
            return `https://m2dd-serverchatapp.hf.space/uploads/profiles/${this.userImage}`;
        }
        return this.userImage;
    }
    return null;
});
export const User = mongoose.model('User', Schema);
//# sourceMappingURL=user.model.js.map