import { Router } from "express";
import { statusService } from "../services/statusService.js";
const statusRouter = Router();
statusRouter.get("/issues/:id/status-history", async (req, res) => {
  const items = await statusService.list(req.params.id);
  res.json(items);
});
export { statusRouter };
