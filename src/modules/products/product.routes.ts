import { Router } from "express";
import { addProduct, deleteProduct, getAllProducts, getOneProduct, updateProduct } from "./product.controller.js";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";
import { uploadMixOfFiles } from "../../middleware/fileUpload.js";
import { validation } from "../../middleware/validate.js";
import { addproductval } from "./product.validate.js";

const productRouter =Router()
const mixFields = [
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 50 }
];
productRouter
.post('/product',
  //  uploadMixOfFiles(mixFields, 'products'),
    authenticate,
    allowedTo('admin', 'employee'),
    validation(addproductval),
addProduct)
.get('/product',getAllProducts)
.get('/product/:id',getOneProduct)
.delete('/product/:id',deleteProduct)
.put('/product/:id',uploadMixOfFiles(mixFields, 'products'),authenticate,allowedTo('admin'),updateProduct)






export default productRouter