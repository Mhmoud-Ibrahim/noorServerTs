
import jwt from 'jsonwebtoken'
import { User } from '../../../database/models/user.model.js'
import bcrypt from 'bcrypt'
import { catchError } from '../../middleware/catchError.js';
import { AppError } from '../../utils/appError.js';
import type { NextFunction, Request, Response } from 'express';

// --- دالة مساعدة لإنشاء التوكن وإرساله في الكوكيز ---
const sendTokenResponse = (user: any, res: Response) => {
    const token = jwt.sign(
        { userId: user._id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_KEY as string,
        { expiresIn: '24h' } // يفضل إضافة مدة انتهاء للتوكن
    );

    res.cookie('noorToken', token, {
        httpOnly: true,
        secure: true,      // ضروري لـ Vercel/Production
        sameSite: 'none',  // ضروري لعمل الكوكيز بين دومينات مختلفة
        maxAge: 24 * 60 * 60 * 1000, // يوم واحد
    });
    
    return token;
};

// --- Controllers ---

// 1. التسجيل العادي (Signup)
const signup = catchError(async (req: Request, res: Response) => {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) return res.status(400).json({ message: "user already exists" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: "success" });
});

// 2. تسجيل الدخول العادي (Signin)
const signin = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return next(new AppError('user not found', 401));

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
        sendTokenResponse(user, res); // استخدام الدالة الموحدة
        return res.status(200).json({ message: "success" });
    }
    
    return next(new AppError('incorrect email or password ', 401));
});

// 3. تسجيل الخروج (Logout)
const logout = catchError((req: Request, res: any) => {
    res.clearCookie('noorToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/' 
    });
    return res.json({ message: 'Logged out successfully' });
});

// 4. الحصول على بيانات المستخدم الحالي (Get Me)
const getMe = catchError(async (req: any, res: Response, next: NextFunction) => {
    // req.user بيتم وضعه بواسطة الـ Middleware الخاص بالـ Auth
    if (!req.user) {
        return next(new AppError("No user found, please login", 401));
    }
    
    res.status(200).json({
        status: "success",
        data: req.user
    });
});

// 5. دالة النجاح بعد Google OAuth
const googleAuthSuccess = catchError(async (req: Request, res: Response) => {
    // passport بيضع بيانات المستخدم في req.user تلقائياً بعد النجاح
    if (req.user) {
        sendTokenResponse(req.user, res);
        // التوجيه لصفحة الهوم في الفرونت إند
        res.redirect('https://noor-store-five.vercel.app'); 
    } else {
        // في حال الفشل نرجعه لصفحة اللوجن
        res.redirect('noor-store-five.vercel.app');
    }
});

export {
    signup,
    signin,
    logout,
    getMe,
    googleAuthSuccess
}
