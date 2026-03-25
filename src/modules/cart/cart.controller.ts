import type { NextFunction, Request, Response } from "express";
import { ProductModel } from "../../../database/models/product.model.js";
import { CartModel, type ICart } from "../../../database/models/cart.model.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";

// وظيفة حساب الإجمالي
const calcTotalCartPrice = (cart: ICart) => {
    let totalPrice = 0;
    cart.cartItems.forEach((item: any) => {
        totalPrice += item.quantity * item.price;
    });
    cart.totalCartPrice = totalPrice;
    if (cart.discount) {
        cart.totalPriceAfterDiscount = (totalPrice - (totalPrice * cart.discount) / 100);
    }
};

// 1. إضافة منتج للسلة
export const addToCart = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;
    const userId = (req as any).user.userId; // استخراج الـ ID الصحيح من التوكن

    const product = await ProductModel.findById(productId);
    if (!product) return next(new AppError("Product not found", 404));

    let cart = await CartModel.findOne({ user: userId });

    if (!cart) {
        cart = await CartModel.create({
            user: userId,
            cartItems: [{ product: productId, price: product.price, quantity: 1 }]
        });
    } else {
        const itemIndex = cart.cartItems.findIndex((item: any) => item.product.toString() === productId);
        
        if (itemIndex > -1) {
            (cart.cartItems[itemIndex] as any).quantity += 1;
        } else {
            cart.cartItems.push({ 
                product: productId, 
                price: product.price, 
                quantity: 1 
            } as any);
        }
    }

    calcTotalCartPrice(cart);
    await cart.save();

    res.status(201).json({ message: "success", cart });
});

// 2. الحصول على سلة المستخدم
export const getLoggedUserCart = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    
    const cart = await CartModel.findOne({ user: userId }).populate('cartItems.product');
    if (!cart) return next(new AppError("Cart is empty", 404));

    res.status(200).json({ message: "success", cart });
});

// 3. حذف منتج من السلة
export const removeItemFromCart = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;

    const cart = await CartModel.findOneAndUpdate(
        { user: userId },
        { $pull: { cartItems: { _id: req.params.itemId } } },
        { new: true }
    );

    if (!cart) return next(new AppError("Cart not found", 404));

    calcTotalCartPrice(cart);
    await cart.save();

    res.status(200).json({ message: "success", cart });
});

// 4. تحديث الكمية
export const updateQuantity = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { quantity } = req.body;
    const userId = (req as any).user.userId;

    const cart = await CartModel.findOne({ user: userId });
    if (!cart) return next(new AppError("Cart not found", 404));

    const item = cart.cartItems.find((item: any) => item._id?.toString() === req.params.itemId);
    if (!item) return next(new AppError("Item not found in cart", 404));

    item.quantity = quantity;
    calcTotalCartPrice(cart);
    await cart.save();

    res.status(200).json({ message: "success", cart });
});
