import { Router } from "express";
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { addUser, changePassowrd, deleteUser, getAllUsers, getOneUser, updateuser } from "./user.controller.js";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";
import { uploadSingleFile } from "../../middleware/fileUpload.js";

const userRouter = Router();

// ======================== Google OAuth Routes ========================

// 1. بدء عملية تسجيل الدخول بجوجل
userRouter.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. معالجة العودة من جوجل (Callback)
userRouter.get('/auth/google/callback', 
  passport.authenticate('google', { session: false }),
  (req: any, res) => {
    // إنشاء التوكن الخاص بنظامك
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_KEY!,
      { expiresIn: '24h' }
    );

    // إرسال التوكن في الكوكيز (إعدادات ضرورية للعمل على Vercel)
    res.cookie('noorToken', token, { 
        httpOnly: true, 
        secure: true,      // يجب أن يكون true لأنك تستخدم HTTPS على Vercel
        sameSite: 'none',  // ضروري جداً للربط بين دومين الباك والفرونت المختلفين
        maxAge: 24 * 60 * 60 * 1000 // يوم واحد
    });
    
    // التوجيه النهائي لصفحة الهوم في الفرونت إند الخاص بك
   res.redirect('https://noor-store-five.vercel.app');
  }
);

// ======================== Standard User Routes ========================

userRouter
.post('/user', authenticate, allowedTo('admin'), addUser)
.get('/user', authenticate, allowedTo('admin'), getAllUsers)
.get('/user/:id', authenticate, allowedTo('admin'), getOneUser)
.delete('/user/:id', authenticate, allowedTo('admin'), deleteUser)
.patch('/user/:id',
    authenticate, allowedTo('admin', 'employee', 'user'),
    uploadSingleFile('userImage', 'users'),
    updateuser)
.post('/changePassword/:id', authenticate, changePassowrd);

export default userRouter;
