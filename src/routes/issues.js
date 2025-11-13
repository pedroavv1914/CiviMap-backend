import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { issueService } from "../services/issueService.js";
import { photoService } from "../services/photoService.js";
import { upload } from "../upload.js";
import { validate } from "../utils/validate.js";
const issuesRouter = Router();
issuesRouter.get("/", async (req, res) => {
  const { status, category, neighborhood, radius, lat, lng, sort, city, from, to, limit, offset, with_count } = req.query || {};
  if (status && !validate.enumeration(status, ["open","in_review","in_progress","resolved","closed"])) return res.status(400).json({ error: "invalid" });
  if (category && !validate.integer(Number(category), 1)) return res.status(400).json({ error: "invalid" });
  if (lat !== undefined && !validate.num(lat, -90, 90)) return res.status(400).json({ error: "invalid" });
  if (lng !== undefined && !validate.num(lng, -180, 180)) return res.status(400).json({ error: "invalid" });
  if (radius !== undefined && !validate.integer(radius, 1, 100000)) return res.status(400).json({ error: "invalid" });
  const list = await issueService.list({ status, category, neighborhood, radius, lat, lng, sort, city, from, to, limit, offset, with_count });
  res.json(list);
});
issuesRouter.get("/:id", async (req, res) => {
  const item = await issueService.getById(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });
  res.json(item);
});
issuesRouter.post("/", requireAuth, async (req, res) => {
  const { title, description, category_id, lat, lng, address, neighborhood } = req.body || {};
  if (!validate.str(title, 1, 200)) return res.status(400).json({ error: "invalid" });
  if (!validate.integer(Number(category_id), 1)) return res.status(400).json({ error: "invalid" });
  if (!validate.num(lat, -90, 90) || !validate.num(lng, -180, 180)) return res.status(400).json({ error: "invalid" });
  if (!validate.optionalStr(address, 200) || !validate.optionalStr(neighborhood, 120)) return res.status(400).json({ error: "invalid" });
  const created = await issueService.create({ title, description, category_id, lat: Number(lat), lng: Number(lng), address, neighborhood, created_by: req.user.id });
  res.status(201).json(created);
});
issuesRouter.patch("/:id/status", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const { new_status } = req.body || {};
  if (!validate.enumeration(new_status, ["open","in_review","in_progress","resolved","closed"])) return res.status(400).json({ error: "invalid" });
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
