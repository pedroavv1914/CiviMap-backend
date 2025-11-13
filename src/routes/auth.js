import { Router } from "express";
import { userService } from "../services/userService.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../utils/validate.js";
const authRouter = Router();
authRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!validate.str(name, 1, 80) || !validate.email(email) || !validate.str(password, 6, 128)) return res.status(400).json({ error: "invalid" });
  try {
    const user = await userService.createUser({ name, email, password, role: "citizen" });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (e) {
    if (String(e.message).includes("exists")) return res.status(409).json({ error: "email_exists" });
    res.status(500).json({ error: "error" });
  }
});
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!validate.email(email) || !validate.str(password, 6, 128)) return res.status(400).json({ error: "invalid" });
  try {
    const user = await userService.authenticate(email, password);
    const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: "7d" });
    res.json({ token });
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
});
authRouter.get("/me", requireAuth, async (req, res) => {
  const u = await userService.findById(req.user.id);
  if (!u) return res.status(404).json({ error: "not_found" });
  res.json({ id: u.id, name: u.name, email: u.email, role: u.role });
});
export { authRouter };
