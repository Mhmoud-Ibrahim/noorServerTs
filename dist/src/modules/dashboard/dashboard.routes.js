import { Router } from "express";
import { authenticate, allowedTo } from "../../middleware/authintecate.js";
import { getDashboardStats } from "./dashboard.controller.js";
const dashboardRouter = Router();
// مسموح للآدمن فقط رؤية الأرباح والحسابات الحساسة
dashboardRouter.get('/stats', authenticate, allowedTo('admin'), getDashboardStats);
export default dashboardRouter;
//# sourceMappingURL=dashboard.routes.js.map