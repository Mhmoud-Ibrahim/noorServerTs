import multer from 'multer';
export declare const fileUpload: (folderName: string) => multer.Multer;
export declare const uploadSingleFile: (fieldName: string, folderName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadMixOfFiles: (arrayOfFields: multer.Field[], folderName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=fileUpload.d.ts.map