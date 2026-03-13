import mongoose, { Schema, Document } from "mongoose";
const CategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        minLength: [2, 'too short product name']
    },
    slug: {
        type: String,
        lowercase: true,
        required: true
    },
    imageCover: String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
CategorySchema.virtual('fullImageUrl').get(function () {
    return this.imageCover ? `http://localhost:5000/${this.imageCover}` : null;
});
export const CategoryModel = mongoose.model('Categories', CategorySchema);
//# sourceMappingURL=category.model.js.map