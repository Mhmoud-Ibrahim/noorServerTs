import { User } from '../../../database/models/user.model.js';
import bcrypt from 'bcrypt';
import { catchError } from '../../middleware/catchError.js';
import { AppError } from '../../utils/appError.js';
import ApiFeatures from '../../utils/ApiFeatures.js';
//add user
const addUser = catchError(async (req, res) => {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists)
        return res.status(400).json({ message: "user already exists" });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "success", user });
});
// get all users
const getAllUsers = catchError(async (req, res, next) => {
    const apiFeatures = new ApiFeatures(User.find(), req.query)
        .filter()
        .sort()
        .search()
        .fields()
        .pagination();
    const users = await apiFeatures.mongooseQuery;
    res.json({
        message: "success",
        results: users.length, // عدد المنتجات اللي رجعت في الصفحة دي
        page: Number(req.query.page) || 1, // الصفحة الحالية
        users
    });
});
// get one user
const getOneUser = catchError(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user)
        return next(new AppError("user not found", 404));
    res.json({ message: "success", user });
});
// delete user
const deleteUser = catchError(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user)
        return next(new AppError("user not found", 404));
    res.json({ message: "success", user });
});
// update user
const updateuser = catchError(async (req, res, next) => {
    const { id } = req.params;
    const files = req.files;
    if (files) {
        if (files.userImage)
            req.body.userImage = files.userImage[0].filename;
    }
    const user = await User.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    if (!user)
        return next(new AppError("user not found", 404));
    res.json({ message: "success", user });
});
// change password 
const changePassowrd = catchError(async (req, res, next) => {
    req.body.changePasswordAt = Date.now();
    let data = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data)
        return res.status(404).json({ message: "user not found" });
    res.json({ message: "success", data });
});
export { addUser, getAllUsers, getOneUser, deleteUser, updateuser, changePassowrd };
//# sourceMappingURL=user.controller.js.map