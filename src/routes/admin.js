import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { adminService } from "../services/adminService.js";
const adminRouter = Router();
adminRouter.get("/issues/stats", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const s = await adminService.stats();
  res.json(s);
});
export { adminRouter };
