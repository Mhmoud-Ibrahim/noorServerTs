
import jwt from 'jsonwebtoken'
import { User, type IUser } from '../../../database/models/user.model.js'
import bcrypt from 'bcrypt'
import { catchError } from '../../middleware/catchError.js';
import { AppError } from '../../utils/appError.js';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';
import crypto from 'crypto'; 
import { sendEmail } from '../../utils/sendEmail.js';

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




// 1. نسيت كلمة السر
// 1. نسيت كلمة السر
export const forgotPassword = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    
    // 1) توليد التوكن
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // 2) تحديث المستخدم بالتوكن
    const user = await User.findOneAndUpdate(
        { email },
        { 
            passwordResetToken: hashedToken, 
            passwordResetExpires: expires 
        },
        { new: true }
    );

    if (!user) return next(new AppError('لا يوجد مستخدم بهذا الإيميل', 404));

    // 3) محاولة إرسال الإيميل
    const message = `نسيت كلمة السر؟ استخدم هذا الرمز لإعادة تعيينها: ${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'إعادة تعيين كلمة المرور (صالح لمدة 10 دقائق)',
            message,
        });

        // 4) الـ Response يتبعت فقط لو الإيميل تم إرساله بنجاح
        res.status(200).json({ 
            status: "success", 
            message: "Token sent to email!", 
            resetToken 
        });

    } catch (err) {
        // في حالة فشل الإرسال، نمسح التوكنات اللي سجلناها في الداتابيز
        await User.findOneAndUpdate(
            { email },
            { 
                $unset: { passwordResetToken: 1, passwordResetExpires: 1 } 
            }
        );
        return next(new AppError('فشل في إرسال الإيميل، حاول لاحقاً', 500));
    }
});


// 2. إعادة التعيين
export const resetPassword = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return next(new AppError('التوكن مطلوب', 400));

    const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

    // تشفير الباسورد يدوياً هنا لأننا لن نستخدم .save()
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
        { 
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        },
        {
            password: hashedPassword,
            $unset: { passwordResetToken: 1, passwordResetExpires: 1 } // مسح التوكنات
        },
        { new: true }
    );

    if (!user) return next(new AppError('التوكن غير صالح أو انتهت صلاحيته', 400));

    sendTokenResponse(user, res);
    res.status(200).json({ message: "success" });
});

