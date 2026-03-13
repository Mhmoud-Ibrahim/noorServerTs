import { Router } from "express";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";
import { uploadMixOfFiles, uploadSingleFile } from "../../middleware/fileUpload.js";
import { addCategory, deleteCategory, getAllCategories, getOneCategory, updateCategory } from "./category.controller.js";




const categoryRouter = Router()
const mixFields = [
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 50 }
];
categoryRouter
    .post('/category',
        uploadMixOfFiles(mixFields, 'products'),
        authenticate,
        allowedTo('admin'),
        addCategory)
    .get('/category', getAllCategories)
    .get('/category/:id', getOneCategory)
    .delete('/category/:id', deleteCategory)
    .put('/category/:id',
        uploadSingleFile('imageCover', 'category'),
        authenticate, allowedTo('admin'),
        updateCategory)






export default categoryRouter