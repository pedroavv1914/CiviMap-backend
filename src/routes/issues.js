import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { issueService } from "../services/issueService.js";
import { photoService } from "../services/photoService.js";
import { upload } from "../upload.js";
const issuesRouter = Router();
issuesRouter.get("/", async (req, res) => {
  const { status, category, neighborhood, radius, lat, lng, sort } = req.query || {};
  const list = await issueService.list({ status, category, neighborhood, radius, lat, lng, sort });
  res.json(list);
});
issuesRouter.get("/:id", async (req, res) => {
  const item = await issueService.getById(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });
  res.json(item);
});
issuesRouter.post("/", requireAuth, async (req, res) => {
  const { title, description, category_id, lat, lng, address, neighborhood } = req.body || {};
  if (!title || !category_id || lat === undefined || lng === undefined) return res.status(400).json({ error: "invalid" });
  const created = await issueService.create({ title, description, category_id, lat: Number(lat), lng: Number(lng), address, neighborhood, created_by: req.user.id });
  res.status(201).json(created);
});
issuesRouter.patch("/:id/status", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const { new_status } = req.body || {};
  if (!new_status) return res.status(400).json({ error: "invalid" });
  const updated = await issueService.updateStatus(req.params.id, new_status, req.user.id);
  if (!updated) return res.status(404).json({ error: "not_found" });
  res.json(updated);
});
issuesRouter.get("/:id/photos", async (req, res) => {
  const list = await photoService.list(req.params.id);
  res.json(list);
});
issuesRouter.post("/:id/photos", requireAuth, upload.array("photos", 5), async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  if (!files.length) return res.status(400).json({ error: "invalid" });
  const urls = files.map(f => "/uploads/" + f.filename);
  const created = [];
  for (const url of urls) {
    const p = await photoService.add(req.params.id, url);
    created.push(p);
  }
  res.status(201).json(created);
});
export { issuesRouter };
