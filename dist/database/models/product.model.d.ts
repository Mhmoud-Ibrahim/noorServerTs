import mongoose, { Document } from "mongoose";
export interface IProduct extends Document {
    title: string;
    description: string;
    imageCover: string;
    images: string[];
    category: mongoose.Types.ObjectId;
    price: number;
    stock: number;
    slug: string;
    costPrice: number;
    fullImageCoverUrl?: string;
    fullImagesUrls?: string[];
}
export declare const ProductModel: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct>;
//# sourceMappingURL=product.model.d.ts.map