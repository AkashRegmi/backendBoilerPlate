import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_ROOT = 'uploads';

const allowedMimeTypes = [
  // images
  'image/jpeg',
  'image/png',
  'image/webp',

  // excel / csv
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',

  // pdf
  'application/pdf',
  //video
  'video/mp4',
];

const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Determine the base upload path
    const uploadPath = UPLOAD_ROOT;

    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!allowedMimeTypes) {
    // No rules defined → reject by default
    const error = new Error(`No file types allowed for field "${file.fieldname}"`);
    return cb(error);
  }
  // if (!allowedMimeTypes.includes(file.mimetype)) {
  //   //here we specify the which feild need what type of file
  //   const error =new Error(`Unsupported file type for field "${file.fieldname}"`);
  //   return cb(error);
  // }
  // cb(null, true);
  // If allowed is '*', accept any file type
  if ( allowedMimeTypes.includes('*') || !allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(`Unsupported file type for field "${file.fieldname}"`);
    return cb(error);
  }

  cb(null, true); // file is allowed

};

export const multerConfig = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});


//for the usages
  // multerConfig.single('profilePicture'), // field name
  // multerConfig.array('app', 5), // max 5 files
  // multerConfig.fields([
  //   { name: 'profilePicture', maxCount: 1 },
  //   { name: 'resume', maxCount: 1 },
  //   { name: 'app', maxCount: 5 },
  // ]),
