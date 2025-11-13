import multer from "multer";
import fs from "fs";
import path from "path";
const dir = path.resolve(process.cwd(), "uploads");
try { fs.mkdirSync(dir, { recursive: true }); } catch {}
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, dir); },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || "");
    const base = Date.now() + "-" + Math.random().toString(36).slice(2);
    cb(null, base + ext);
  }
});
function fileFilter(req, file, cb) {
  const ok = (file.mimetype || "").startsWith("image/");
  cb(ok ? null : new Error("invalid_file"), ok);
}
export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
