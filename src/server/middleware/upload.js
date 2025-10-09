/**
 * File upload middleware configuration
 */

const multer = require('multer');
const appConfig = require('../config/app');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept PDF and text files
    if (appConfig.upload.allowedMimeTypes.includes(file.mimetype) ||
        file.originalname.toLowerCase().endsWith('.txt')) {
        cb(null, true);
    } else {
        const allowedTypes = appConfig.upload.allowedMimeTypes.join(', ');
        cb(new Error(`Only ${allowedTypes} files are supported`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: appConfig.upload.maxFileSize,
        files: 1 // Only allow one file at a time
    },
    fileFilter: fileFilter
});

module.exports = upload;
