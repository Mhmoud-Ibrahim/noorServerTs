
import { Router } from "express";
import passport from "passport";
import { getMe, logout, signin, signup, googleAuthSuccess } from "./auth.controller.js";
import { authenticate } from "../../middleware/authintecate.js";

const authRouter = Router();

// 1. مسارات المصادقة التقليدية
authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, getMe);

// 2. مسار بدء عملية الدخول بجوجل
// يتم استدعاؤه عند الضغط على زر Google في الفرونت إند
authRouter.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false // نستخدم JWT بدلاً من الـ Sessions
}));

// 3. مسار العودة (Callback) من جوجل
// هذا هو الرابط الذي يجب أن يكون مسجلاً في Google Cloud Console
authRouter.get('/google/callback', 
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: 'noor-store-five.vercel.app' // يتم التوجيه هنا في حال فشل المستخدم في تسجيل الدخول
    }),
    googleAuthSuccess // هذه الدالة هي التي ترسل الـ Cookie والـ JWT في حال النجاح
);

export default authRouter;
