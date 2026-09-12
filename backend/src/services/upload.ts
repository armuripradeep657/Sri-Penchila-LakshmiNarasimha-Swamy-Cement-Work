import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary configuration
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Disk storage for multer
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage: diskStorage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

export async function processUploadedFile(file: Express.Multer.File): Promise<string> {
  if (isCloudinaryConfigured && process.env.UPLOAD_PROVIDER === 'cloudinary') {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'prasad-cement-products',
      use_filename: true,
      unique_filename: true,
    });
    // Remove local temp file
    try {
      fs.unlinkSync(file.path);
    } catch {}
    return result.secure_url;
  }

  // Return static URL served by Express
  const filename = path.basename(file.path);
  return `/uploads/${filename}`;
}
