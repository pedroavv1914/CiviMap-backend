import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { voteService } from "../services/voteService.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { voteRepository } from "../repositories/voteRepository.js";
const votesRouter = Router();
votesRouter.post("/issues/:id/votes", requireAuth, async (req, res) => {
  const r = await voteService.toggle(req.params.id, req.user.id);
  res.json(r);
});
votesRouter.get("/issues/:id/votes", async (req, res) => {
  const count = await voteRepository.count(req.params.id);
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  let my_voted = false;
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      my_voted = await voteRepository.has(req.params.id, payload.sub);
    } catch {}
  }
  res.json({ count, my_voted });
});
export { votesRouter };
