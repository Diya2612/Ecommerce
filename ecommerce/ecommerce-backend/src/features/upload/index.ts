import { Router, Request, Response, NextFunction } from 'express';
import type { Route as Routes } from '../../interfaces';
import { uploadSingleFileMiddleware, requireAuth } from '../../middlewares';
import { uploadToStorage } from '../../utils/supabase/storage';
import { ResponseFormatter, HttpException } from '../../utils';

class UploadRoute implements Routes {
  public path = '/uploads';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      this.path,
      requireAuth,
      uploadSingleFileMiddleware,
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          const file = req.file;
          if (!file) {
            throw new HttpException(400, 'No file uploaded');
          }

          const folder = (req.body?.folder as string) || 'products';
          const userId = req.userId || 'admin';

          const result = await uploadToStorage(
            file.buffer,
            file.originalname,
            file.mimetype,
            userId,
            { folder },
          );

          ResponseFormatter.created(
            res,
            {
              id: result.key,
              filename: file.originalname,
              original_filename: file.originalname,
              mime_type: file.mimetype,
              file_size: file.size,
              file_path: result.key,
              file_url: result.url,
              thumbnail_url: result.thumbnailUrl || result.url,
              created_at: new Date().toISOString(),
            },
            'File uploaded successfully',
          );
        } catch (error) {
          next(error);
        }
      },
    );
  }
}

export default UploadRoute;
