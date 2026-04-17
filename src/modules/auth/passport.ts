

import jwt from 'jsonwebtoken'
import { User } from '../../../database/models/user.model.js'
import bcrypt from 'bcrypt'
import { catchError } from '../../middleware/catchError.js';
import { AppError } from '../../utils/appError.js';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';

// 1. إعداد Passport Strategy
passport.use('google', new GoogleStrategy({
    clientID: process.env.clientID!,
    clientSecret: process.env.clientSecret!,
    callbackURL: "https://noor-server-ts.vercel.app/auth/google/callback" 
  },
  async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
        const userEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!userEmail) {
            return done(new AppError("No email found from Google profile", 400), undefined);
        }

        let user = await User.findOne({ email: userEmail });

        if (!user) {
          
            user = await User.create({
                name: profile.displayName,
                email: userEmail,
                password: Math.random().toString(36).slice(-10), 
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

// 2. دالة إرسال التوكن الموحدة
const sendTokenResponse = (user: any, res: Response) => {
    const token = jwt.sign(
        { userId: user._id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_KEY as string
    );
    res.cookie('noorToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
    });
};

// 3. Auth Controllers
const signup = catchError(async (req: Request, res: Response) => {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) return res.status(400).json({ message: "user already exists" });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "success" });
});

const signin = catchError(async (req: Request, res: Response, next: NextFunction) => {
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

const logout = catchError((req: Request, res: any) => {
    res.clearCookie('noorToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/' 
    });
    return res.json({ message: 'Logged out successfully' })
});

const getMe = catchError(async (req: any, res: Response, next: NextFunction) => {
    const token = req.cookies?.noorToken;
    if (!token) {
        return next(new AppError("No token found, please login", 401));
    }
    res.status(200).json({
        status: "success",
        data: req.user, 
        token
    });
});

// 4. Google Auth Success Controller
const googleAuthSuccess = catchError(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        sendTokenResponse(req.user, res);
        res.redirect('http://localhost:5173/home'); 
    } else {
        return next(new AppError("Google authentication failed", 401));
    }
});

export {
    signup,
    signin,
    logout,
    getMe,
    googleAuthSuccess
}
