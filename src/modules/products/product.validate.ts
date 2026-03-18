
import joi from 'joi'


const addproductval = joi.object({
    title: joi.string().min(2).max(300).required().trim(),
    description: joi.string().min(3).max(1500).required().trim(),
    price:joi.number().min(0).required(),
    stock :joi.number().min(0),
    category:joi.string().hex().length(24).optional(),
    costPrice:joi.number().min(0),

    imageCover:joi.array().items(joi.object({
        fieldname:joi.string().required(),
        originalname:joi.string().required(),
        encoding:joi.string().required(),
        mimetype:joi.string().valid('image/jpeg','image/png','image/jpg','image/jpEG').required(),
        size:joi.number().max(5242880).required(),
        destination:joi.string().required(),
        filename:joi.string().required(),
        path:joi.string().required(),
    })).required(),
    images:joi.array().items(joi.object({
        fieldname:joi.string().required(),
        originalname:joi.string().required(),
        encoding:joi.string().required(),
        mimetype:joi.string().valid('image/jpeg','image/png','image/jpg','image/jpEG').required(),
        size:joi.number().max(5242880).required(),
        destination:joi.string().required(),
        filename:joi.string().required(),
        path:joi.string().required(),
    })).required(),
})

export {addproductval} 