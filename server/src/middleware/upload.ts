import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || ".jpg";
    const baseName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}${extension}`);
  },
});

function imageFileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image uploads are allowed"));
    return;
  }
  cb(null, true);
}

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
