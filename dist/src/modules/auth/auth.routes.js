import { Router } from "express";
import { getMe, logout, signin, signup } from "./auth.controller.js";
import { authenticate } from "../../middleware/authintecate.js";
const authRouter = Router();
authRouter
    .post('/signup', signup)
    .post('/signin', signin)
    .post('/logout', logout)
    .get('/me', authenticate, getMe);
export default authRouter;
//# sourceMappingURL=auth.routes.js.map