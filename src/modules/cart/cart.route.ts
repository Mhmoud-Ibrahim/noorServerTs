import { Router } from "express";
import { addToCart, getLoggedUserCart, removeItemFromCart, updateQuantity } from "./cart.controller.js";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";
import { validation } from "../../middleware/validate.js";
import { updateQuantityVal } from "./cart.validate.js";

const cartRouter = Router();

cartRouter
    .post('/cart', 
        authenticate, 
        allowedTo('user', 'admin', 'employee'), 
        addToCart
    )
    .get('/cart', 
        authenticate, 
        allowedTo('user', 'admin', 'employee'), 
        getLoggedUserCart
    )
    .patch('/cart/:itemId', 
        authenticate, 
        allowedTo('user', 'admin', 'employee'), 
        validation(updateQuantityVal),
        updateQuantity
    )
    .delete('/cart/:itemId', 
        authenticate, 
        allowedTo('user', 'admin', 'employee'), 
        removeItemFromCart
    );

export default cartRouter;
