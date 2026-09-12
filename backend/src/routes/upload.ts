import { Router, Response, NextFunction } from 'express';
import { uploadMiddleware, processUploadedFile } from '../services/upload';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { BadRequestError } from '../utils/errors';

const router = Router();

// Upload single image (Admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadMiddleware.single('image'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No image file provided');
      }

      const imageUrl = await processUploadedFile(req.file);

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        url: imageUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Upload multiple images (up to 5)
router.post(
  '/bulk',
  authenticate,
  requireAdmin,
  uploadMiddleware.array('images', 5),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new BadRequestError('No image files provided');
      }

      const urls = await Promise.all(files.map((f) => processUploadedFile(f)));

      res.status(201).json({
        success: true,
        message: `${urls.length} images uploaded successfully`,
        urls,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
