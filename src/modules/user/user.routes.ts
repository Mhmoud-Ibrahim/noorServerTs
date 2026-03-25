import { Router } from "express";
import {   addUser, changePassowrd, deleteUser, getAllUsers, getOneUser, updateuser } from "./user.controller.js";
import { allowedTo, authenticate } from "../../middleware/authintecate.js";
import { uploadSingleFile } from "../../middleware/fileUpload.js";

const userRouter =Router()

userRouter
.post('/user',authenticate,allowedTo('admin'),addUser)
.get('/user',authenticate,allowedTo('admin'),getAllUsers)
.get('/user/:id',authenticate,allowedTo('admin'),getOneUser)
.delete('/user/:id',authenticate,allowedTo('admin'),deleteUser)
.patch('/user/:id', uploadSingleFile('userImage', 'user'),authenticate,allowedTo('admin'),updateuser)
.post('/changePassword/:id',authenticate,changePassowrd)




export default userRouter