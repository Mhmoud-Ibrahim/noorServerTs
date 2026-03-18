import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    imageCover: string;
    fullImageUrl?: string;
   
}
const CategorySchema = new Schema<ICategory>({
    name: {
        type: String,
        trim: true,
        minLength: [2, 'too short product name'] 
    },
    slug:{
        type:String,
        lowercase:true,
        required:true
    },
    imageCover: String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

CategorySchema.virtual('fullImageUrl').get(function (this: ICategory) {
    return this.imageCover ? `https://noor-server-ts.vercel.app/${this.imageCover}` : null;
});
export const CategoryModel = mongoose.model<ICategory>('Categories', CategorySchema);
