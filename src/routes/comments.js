import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { commentService } from "../services/commentService.js";
import { validate } from "../utils/validate.js";
const commentsRouter = Router();
commentsRouter.get("/issues/:id/comments", async (req, res) => {
  const items = await commentService.list(req.params.id);
  res.json(items);
});
commentsRouter.post("/issues/:id/comments", requireAuth, async (req, res) => {
  const { content } = req.body || {};
  if (!validate.str(content, 1, 1000)) return res.status(400).json({ error: "invalid" });
  const item = await commentService.create(req.params.id, req.user.id, content);
  res.status(201).json(item);
});
commentsRouter.delete("/comments/:id", requireAuth, async (req, res) => {
  const ok = await commentService.remove(req.params.id, { id: req.user.id, role: req.user.role });
  if (ok === null) return res.status(404).json({ error: "not_found" });
  if (ok === false) return res.status(403).json({ error: "forbidden" });
  res.status(204).send();
});
export { commentsRouter };
