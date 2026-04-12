// import { Router } from "express";
// import {   getMe, googleAuthSuccess, logout, signin, signup } from "./auth.controller.js";
// import { authenticate } from "../../middleware/authintecate.js";

// const authRouter =Router()

// authRouter
// .post('/signup',signup)
// .post('/signin',signin)
// .post('/logout',logout)
// .get('/me',authenticate,getMe)

// import passport from 'passport';

// authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// authRouter.get('/google/callback', 
//     passport.authenticate('google', { session: false, failureRedirect: '/login' }),
//     googleAuthSuccess
// );




// export default authRouter
import { Router } from "express";
import passport from "passport"; // تأكد من تثبيته
import { getMe, logout, signin, signup, googleAuthSuccess } from "./auth.controller.js";
import { authenticate } from "../../middleware/authintecate.js";

const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, getMe);

// --- مسارات جوجل الجديدة ---
// 1. توجيه المستخدم لجوجل
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. استقبال المستخدم بعد تسجيل الدخول من جوجل
authRouter.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleAuthSuccess
);

export default authRouter;
