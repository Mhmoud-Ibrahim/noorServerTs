import joi from "joi";

export const updateQuantityVal = joi.object({
    quantity: joi.number().integer().min(1).required(),
    itemId: joi.string().hex().length(24).required() // الـ ID بتاع الـ item جوه السلة
});
