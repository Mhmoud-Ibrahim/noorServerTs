import { catchError } from "../../middleware/catchError.js";
import { ProductModel } from "../../../database/models/product.model.js";
import { AppError } from "../../utils/appError.js";
import ApiFeatures from "../../utils/ApiFeatures.js";
import slugify from "slugify";
//add product
const addProduct = catchError(async (req, res, next) => {
    const { title, slug, description, imageCover, images, price } = req.body;
    if (req.body.title)
        req.body.slug = slugify.default(req.body.title, { lower: true });
    const files = req.files;
    if (files) {
        if (files.imageCover && files.imageCover[0]) {
            req.body.imageCover = files.imageCover[0].filename;
        }
        if (files.images) {
            req.body.images = files.images.map((img) => img.filename);
        }
    }
    const isExist = await ProductModel.findOne({ title });
    if (isExist)
        return next(new AppError("المنتج موجود مسبقاً", 400));
    const newProduct = await ProductModel.create({ ...req.body });
    res.status(201).json({ message: "success", product: newProduct });
});
// get all products
const getAllProducts = catchError(async (req, res, next) => {
    const apiFeatures = new ApiFeatures(ProductModel.find().populate('category'), req.query)
        .filter()
        .sort()
        .search()
        .fields()
        .pagination();
    const products = await apiFeatures.mongooseQuery;
    res.json({
        message: "success",
        results: products.length, // عدد المنتجات اللي رجعت في الصفحة دي
        page: Number(req.query.page) || 1, // الصفحة الحالية
        products
    });
});
// git one product
const getOneProduct = catchError(async (req, res, next) => {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (!product)
        return next(new AppError("product not found", 404));
    res.json({ message: "success", product });
});
// delete product
const deleteProduct = catchError(async (req, res, next) => {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product)
        return next(new AppError("product not found", 404));
    res.json({ message: "success", product });
});
// update product
const updateProduct = catchError(async (req, res, next) => {
    const { id } = req.params;
    if (req.body && req.body.title) {
        req.body.slug = slugify.default(req.body.title, { lower: true, replacement: '-' });
    }
    const files = req.files;
    if (files) {
        if (files.imageCover)
            req.body.imageCover = files.imageCover[0].filename;
        if (files.images)
            req.body.images = files.images.map((img) => img.filename);
    }
    const product = await ProductModel.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    if (!product)
        return next(new AppError("product not found", 404));
    res.json({ message: "success", product });
});
export { addProduct, getAllProducts, getOneProduct, deleteProduct, updateProduct };
//# sourceMappingURL=product.controller.js.map