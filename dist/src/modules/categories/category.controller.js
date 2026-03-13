import { CategoryModel } from '../../../database/models/category.model.js';
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";
import ApiFeatures from "../../utils/ApiFeatures.js";
import slugify from "slugify";
//add product
const addCategory = catchError(async (req, res, next) => {
    const { name, slug, imageCover } = req.body;
    if (req.body.name)
        req.body.slug = slugify.default(req.body.name, { lower: true });
    const files = req.files;
    if (files) {
        if (files.imageCover && files.imageCover[0]) {
            req.body.imageCover = files.imageCover[0].filename;
        }
    }
    const isExist = await CategoryModel.findOne({ name });
    if (isExist)
        return next(new AppError("product already exist", 400));
    const category = await CategoryModel.create({ ...req.body });
    res.status(201).json({ message: "success", category });
});
// get all products
const getAllCategories = catchError(async (req, res, next) => {
    const apiFeatures = new ApiFeatures(CategoryModel.find(), req.query)
        .filter()
        .sort()
        .search()
        .fields()
        .pagination();
    const categories = await apiFeatures.mongooseQuery;
    res.json({
        message: "success",
        results: categories.length,
        page: Number(req.query.page) || 1,
        categories
    });
});
// git one product
const getOneCategory = catchError(async (req, res, next) => {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    if (!category)
        return next(new AppError("category not found", 404));
    res.json({ message: "success", category });
});
// delete product
const deleteCategory = catchError(async (req, res, next) => {
    const { id } = req.params;
    const category = await CategoryModel.findByIdAndDelete(id);
    if (!category)
        return next(new AppError("category not found", 404));
    res.json({ message: "success", category });
});
// update product
const updateCategory = catchError(async (req, res, next) => {
    const { id } = req.params;
    if (req.body && req.body.name) {
        req.body.slug = slugify.default(req.body.name, { lower: true, replacement: '-' });
    }
    const files = req.files;
    if (files) {
        if (files.imageCover)
            req.body.imageCover = files.imageCover[0].filename;
        if (files.images)
            req.body.images = files.images.map((img) => img.filename);
    }
    const category = await CategoryModel.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    if (!category)
        return next(new AppError("category not found", 404));
    res.json({ message: "success", category });
});
export { addCategory, getAllCategories, getOneCategory, deleteCategory, updateCategory };
//# sourceMappingURL=category.controller.js.map