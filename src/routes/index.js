import { Router } from "express";
import { authRouter } from "./auth.js";
import { issuesRouter } from "./issues.js";
import { votesRouter } from "./votes.js";
import { commentsRouter } from "./comments.js";
import { adminRouter } from "./admin.js";
const router = Router();
router.get("/health", (req, res) => {
  res.json({ ok: true });
});
router.use("/auth", authRouter);
router.use("/issues", issuesRouter);
router.use("/", votesRouter);
router.use("/", commentsRouter);
router.use("/admin", adminRouter);
export { router };
