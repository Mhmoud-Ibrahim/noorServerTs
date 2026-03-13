import multer from 'multer';
import { AppError } from '../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
export const fileUpload = (folderName) => {
    const path = `uploads/${folderName}`;
    // إنشاء المجلد إذا لم يكن موجوداً لمنع خطأ 500
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path);
        },
        filename: (req, file, cb) => {
            cb(null, uuidv4() + "-" + file.originalname);
        }
    });
    function fileFilter(req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        }
        else {
            cb(new AppError('images only', 401), false);
        }
    }
    const upload = multer({ storage, fileFilter });
    return upload;
};
export const uploadSingleFile = (fieldName, folderName) => fileUpload(folderName).single(fieldName);
export const uploadMixOfFiles = (arrayOfFields, folderName) => fileUpload(folderName).fields(arrayOfFields);
//# sourceMappingURL=fileUpload.js.map