import joi from 'joi'

// تعريف قاعدة بيانات الملف (لتجنب التكرار)
// استخدم .unknown(true) عشان يتجاهل أي خصائص ناقصة زي destination
const fileSchema = joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().valid('image/jpeg', 'image/png', 'image/jpg', 'image/JPEG').required(),
    size: joi.number().max(5242880).required(),
    filename: joi.string().optional(), // خليها optional
    path: joi.string().optional(),     // خليها optional
}).unknown(true); // السطر ده هو "السحر" اللي هيخلي الجوي ميعترضش على الخصائص الناقصة


const addproductval = joi.object({
    title: joi.string().min(2).max(300).required().trim(),
    description: joi.string().min(3).max(1500).required().trim(),
    price: joi.number().min(0).required(),
    stock: joi.number().min(0),
    category: joi.string().hex().length(24).optional(),
    costPrice: joi.number().min(0),
   imageCover: joi.string().uri().required(), 
    images: joi.array().items(joi.string().uri()).required(),
})

export { addproductval }
