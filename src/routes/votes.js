import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { voteService } from "../services/voteService.js";
const votesRouter = Router();
votesRouter.post("/issues/:id/votes", requireAuth, async (req, res) => {
  const r = await voteService.toggle(req.params.id, req.user.id);
  res.json(r);
});
export { votesRouter };
