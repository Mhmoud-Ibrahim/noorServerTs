import { Router } from "express";
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { addUser, changePassowrd, deleteUser, getAllUsers, getOneUser, updateuser } from "./user.controller.js";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";
import { uploadSingleFile } from "../../middleware/fileUpload.js";



const userRouter = Router();

userRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

userRouter.get('/auth/google/callback', 
  passport.authenticate('google', { session: false }),
  (req: any, res) => {
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_KEY!,
      { expiresIn: '24h' }
    );

    res.cookie('noorToken', token, { 
        httpOnly: true, 
        secure: true,      
        sameSite: 'none',  
        maxAge: 24 * 60 * 60 * 1000 
    });
    
    // التوجيه لصفحة الهوم في الفرونت إند
    res.redirect('https://vercel.app');
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
