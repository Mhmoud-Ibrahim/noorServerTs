
// import jwt from 'jsonwebtoken'
// import { User } from '../../../database/models/user.model.js'
// import bcrypt from 'bcrypt'
// import { catchError } from '../../middleware/catchError.js';
// import { AppError } from '../../utils/appError.js';
// import type { NextFunction, Request, Response } from 'express';

// // --- دالة مساعدة لإنشاء التوكن وإرساله في الكوكيز ---
// const sendTokenResponse = (user: any, res: Response) => {
//     const token = jwt.sign(
//         { userId: user._id, email: user.email, name: user.name, role: user.role },
//         process.env.JWT_KEY as string,
//         { expiresIn: '24h' } // يفضل إضافة مدة انتهاء للتوكن
//     );

//     res.cookie('noorToken', token, {
//         httpOnly: true,
//         secure: true,      // ضروري لـ Vercel/Production
//         sameSite: 'none',  // ضروري لعمل الكوكيز بين دومينات مختلفة
//         maxAge: 24 * 60 * 60 * 1000, // يوم واحد
//     });
    
//     return token;
// };

// // --- Controllers ---

// // 1. التسجيل العادي (Signup)
// const signup = catchError(async (req: Request, res: Response) => {
//     const userExists = await User.findOne({ email: req.body.email });
//     if (userExists) return res.status(400).json({ message: "user already exists" });

//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const newUser = new User({ ...req.body, password: hashedPassword });
//     await newUser.save();
    
//     res.status(201).json({ message: "success" });
// });

// // 2. تسجيل الدخول العادي (Signin)
// const signin = catchError(async (req: Request, res: Response, next: NextFunction) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return next(new AppError('user not found', 401));

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (isPasswordCorrect) {
//         sendTokenResponse(user, res); // استخدام الدالة الموحدة
//         return res.status(200).json({ message: "success" });
//     }
    
//     return next(new AppError('incorrect email or password ', 401));
// });

// // 3. تسجيل الخروج (Logout)
// const logout = catchError((req: Request, res: any) => {
//     res.clearCookie('noorToken', {
//         httpOnly: true,
//         secure: true,
//         sameSite: 'none',
//         path: '/' 
//     });
//     return res.json({ message: 'Logged out successfully' });
// });

// // 4. الحصول على بيانات المستخدم الحالي (Get Me)
// const getMe = catchError(async (req: any, res: Response, next: NextFunction) => {
//     // req.user بيتم وضعه بواسطة الـ Middleware الخاص بالـ Auth
//     if (!req.user) {
//         return next(new AppError("No user found, please login", 401));
//     }
    
//     res.status(200).json({
//         status: "success",
//         data: req.user
//     });
// });

// // 5. دالة النجاح بعد Google OAuth
// const googleAuthSuccess = catchError(async (req: Request, res: Response) => {
//     // passport بيضع بيانات المستخدم في req.user تلقائياً بعد النجاح
//     if (req.user) {
//         sendTokenResponse(req.user, res);
//         // التوجيه لصفحة الهوم في الفرونت إند
//         res.redirect('https://noor-store-five.vercel.app'); 
//     } else {
//         // في حال الفشل نرجعه لصفحة اللوجن
//         res.redirect('noor-store-five.vercel.app');
//     }
// });

// export {
//     signup,
//     signin,
//     logout,
//     getMe,
//     googleAuthSuccess
// }
import jwt from 'jsonwebtoken'
import { User } from '../../../database/models/user.model.js'
import bcrypt from 'bcrypt'
import { catchError } from '../../middleware/catchError.js';
import { AppError } from '../../utils/appError.js';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';

// --- 1. تعريف إستراتيجية جوجل (Google Strategy) ---
passport.use(new GoogleStrategy({
    clientID: process.env.clientID!,
    clientSecret: process.env.clientSecret!,
    callbackURL: "https://noor-server-ts.vercel.app/auth/google/callback",
  },
  async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
        const userEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!userEmail) {
            return done(null, false);
        }

        let user = await User.findOne({ email: userEmail });

        if (!user) {
            user = await User.create({
                name: profile.displayName,
                email: userEmail,
                password: Math.random().toString(36).slice(-10), // كلمة سر عشوائية
                userImage: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
                googleId: profile.id,
                role: 'user'
            });
        } else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err as Error, undefined);
    }
  }
));

// --- 2. الدوال المساعدة ---
const sendTokenResponse = (user: any, res: Response) => {
    const token = jwt.sign(
        { userId: user._id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_KEY as string,
        { expiresIn: '24h' }
    );
    
    res.cookie('noorToken', token, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
    });
    
    return token;
};

// --- 3. الـ Controllers ---

export const signup = catchError(async (req: Request, res: Response) => {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) return res.status(400).json({ message: "user already exists" });
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "success" });
});

export const signin = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return next(new AppError('user not found', 401))
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
        sendTokenResponse(user, res);
        return res.status(200).json({ message: "success" });
    }
    return next(new AppError('incorrect email or password ', 401))
});

export const logout = catchError((req: Request, res: any) => {
    res.clearCookie('noorToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/' 
    });
    return res.json({ message: 'Logged out successfully' })
});

export const getMe = catchError(async (req: any, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("Not authenticated", 401));
    res.status(200).json({ status: "success", data: req.user });
});

export const googleAuthSuccess = catchError(async (req: Request, res: Response) => {
    if (req.user) {
        sendTokenResponse(req.user, res);
        res.redirect('https://noor-store-five.vercel.app'); 
    } else {
        res.redirect('https://vercel.app');
    }
});
