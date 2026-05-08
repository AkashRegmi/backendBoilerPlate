import { Request, Response, NextFunction } from 'express';
import { multerConfig } from '../../configs/multer.config';


export const uploadSingle = (fieldName: string) =>
  multerConfig.single(fieldName);

export const uploadMultiple = (fieldName: string, maxCount = 5) =>
  multerConfig.array(fieldName, maxCount);

export const uploadFields = (
  fields: { name: string; maxCount?: number }[],
) =>
  multerConfig.fields(
    fields.map((f) => ({
      name: f.name,
      maxCount: f.maxCount ?? 1,
    })),
  );

// global multer error handler
export const uploadErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed',
    });
  }
  next();
};
