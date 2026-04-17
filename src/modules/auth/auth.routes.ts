
import { Router } from "express";
import passport from "passport";
import { getMe, logout, signin, signup, googleAuthSuccess } from "./auth.controller.js";
import { authenticate } from "../../middleware/authintecate.js";

const authRouter = Router();

// المسارات العادية
authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, getMe);

authRouter.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

authRouter.get('/google/callback', 
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: 'http://localhost:5173/login' 
    }),
    googleAuthSuccess 
);

export default authRouter;
