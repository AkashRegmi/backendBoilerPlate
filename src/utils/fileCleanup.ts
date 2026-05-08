import fs from "fs";
import path from "path";
export type fileDetails = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};
type MulterFile = Express.Multer.File;
export const currentDir: string = __dirname;
const UPLOAD_ROOT = "uploads";
const isMulterFile = (file: any): file is Express.Multer.File => {
  return (
    file &&
    typeof file === "object" &&
    typeof file.path === "string" &&
    typeof file.fieldname === "string"
  );
};

export const deleteUploadedFiles = (
  files?: MulterFile | MulterFile[] | Record<string, MulterFile[]>,
) => {
  if (!files) return;

  const fileList: MulterFile[] = [];

  // string path
  if (typeof files === "string") {
    fileList.push(files);
  }
  // single file
  if (isMulterFile(files)) {
    fileList.push(files);
  }

  // multiple files
  else if (Array.isArray(files)) {
    fileList.push(...files);
  }

  // fields upload
  else {
    Object.values(files).forEach((arr) => {
      if (Array.isArray(arr)) {
        fileList.push(...arr);
      }
    });
  }

  fileList.forEach((file) => {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Failed to delete file:", file.path, err.message);
        }
      });
    }
  });
};

//delete the file  Usage
//  deleteFileByName('abc.png', 'productImage');
//  export const deleteFileByName = (fileName: string, fieldName: string) => {
//   // folders to search in
//   const folders = ['images', 'files'];

//   for (const folder of folders) {
//     const filePath = path.join(UPLOAD_ROOT, folder, fieldName, fileName);

//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//       console.log(`Deleted: ${filePath}`);
//       return; // stop after deleting
//     }
//   }

//   console.log('File not found in any folder');
// };

export const deleteFileByName = (fileUrl: string, fieldName: string) => {
  if (!fileUrl) return;
  const folders = ["images", "files"]; // base folders
  for (const folder of folders) {
    const filename = path.basename(fileUrl);
    const filePath = path.join(UPLOAD_ROOT, folder, fieldName, filename);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", filePath, err);
        } else {
          console.log("Deleted:", filePath);
        }
      });
      break; // stop after deleting
    }
  }
};

//usages
// deleteMultipleFiles(productImages, 'productImage')
export const deleteMultipleFiles = async (
  fileUrls: string[],
  uploadedFolder: string,
) => {
  if (!fileUrls || fileUrls.length === 0) return;

  const folders = ["images", "files"]; // base folders

  fileUrls.forEach((fileUrl) => {
    // Extract filename from URL or path
    const filename = path.basename(fileUrl);

    for (const folder of folders) {
      const filePath = path.join(UPLOAD_ROOT, folder, uploadedFolder, filename);

      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", filePath, err);
          } else {
            console.log("Deleted:", filePath);
          }
        });
        break; // stop after deleting
      }
    }
  });
};
