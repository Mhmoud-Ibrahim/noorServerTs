import { Router } from "express";
import {   getMe, googleAuthSuccess, logout, signin, signup } from "./auth.controller.js";
import { authenticate } from "../../middleware/authintecate.js";

const authRouter =Router()

authRouter
.post('/signup',signup)
.post('/signin',signin)
.post('/logout',logout)
.get('/me',authenticate,getMe)

import passport from 'passport';

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleAuthSuccess
);




export default authRouter