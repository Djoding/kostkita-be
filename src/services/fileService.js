const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

class FileService {
    constructor() {
        this.uploadPath = process.env.UPLOAD_PATH || './uploads';
        this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
        this.allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');
        this.initializeUploadDirectory();
    }

    async initializeUploadDirectory() {
        try {
            const directories = [
                `${this.uploadPath}/avatars`,
                `${this.uploadPath}/kost`,
                `${this.uploadPath}/kamar`,
                `${this.uploadPath}/catering_payment`,
                `${this.uploadPath}/laundry_payment`,
                `${this.uploadPath}/catering_menu`,
                `${this.uploadPath}/laundry_menu`,
                `${this.uploadPath}/catering`,
                `${this.uploadPath}/laundry`,
                `${this.uploadPath}/reservation_payment`,
                `${this.uploadPath}/temp`
            ];

            for (const dir of directories) {
                await fs.mkdir(dir, { recursive: true });
            }

            logger.info('Upload directories initialized');
        } catch (error) {
            logger.error('Failed to initialize upload directories:', error);
        }
    }

    getMulterConfig(destination = 'temp') {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, `${this.uploadPath}/${destination}`);
            },
            filename: (req, file, cb) => {
                const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
                cb(null, uniqueName);
            }
        });

        const fileFilter = (req, file, cb) => {
            if (this.allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new AppError(`File type ${file.mimetype} not allowed`, 400), false);
            }
        };

        return multer({
            storage,
            fileFilter,
            limits: {
                fileSize: this.maxFileSize,
                files: 10
            }
        });
    }

    async processImage(filePath, options = {}) {
        const {
            width = 800,
            height = 800,
            quality = 80,
            format = 'jpeg'
        } = options;

        try {
            const processedPath = filePath.replace(/\.[^/.]+$/, `_processed.${format}`);

            await sharp(filePath)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality })
                .toFile(processedPath);

            await fs.unlink(filePath);

            return processedPath;
        } catch (error) {
            logger.error('Image processing failed:', error);
            throw new AppError('Failed to process image', 500);
        }
    }

    async moveFile(sourcePath, destinationFolder, filename = null) {
        try {
            const fileName = filename || path.basename(sourcePath);
            const destinationPath = `${this.uploadPath}/${destinationFolder}/${fileName}`;

            console.log('[moveFile] Attempting to move file:');
            console.log('  Source:', sourcePath);
            console.log('  Destination:', destinationPath);

            await fs.rename(sourcePath, destinationPath);

            return {
                path: destinationPath,
                url: `/uploads/${destinationFolder}/${fileName}`,
                filename: fileName
            };
        } catch (error) {
            console.error(`[moveFile] Failed to move file from ${sourcePath} to ${destinationFolder}:`, error);
            throw new AppError('Failed to save file', 500);
        }
    }

    async deleteFile(filePath) {
        try {
            const fullPath = filePath.startsWith('./') ? filePath : `./${filePath}`;
            await fs.unlink(fullPath);
            logger.info(`File deleted: ${fullPath}`);
        } catch (error) {
            logger.warn(`Failed to delete file: ${filePath}`, error);
        }
    }

    async getFileInfo(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                exists: true,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        } catch (error) {
            return { exists: false };
        }
    }

    generateFileUrl(relativePath) {
        if (!relativePath) return null;

        if (/^https?:\/\//.test(relativePath)) {
            return relativePath;
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        return `${baseUrl}${relativePath}`;
    }

    async cleanTempFiles() {
        try {
            const tempDir = `${this.uploadPath}/temp`;
            const files = await fs.readdir(tempDir);
            const oneHourAgo = Date.now() - (60 * 60 * 1000);

            for (const file of files) {
                const filePath = `${tempDir}/${file}`;
                const stats = await fs.stat(filePath);

                if (stats.mtime.getTime() < oneHourAgo) {
                    await fs.unlink(filePath);
                    logger.info(`Cleaned temp file: ${file}`);
                }
            }
        } catch (error) {
            logger.error('Failed to clean temp files:', error);
        }
    }
}

module.exports = new FileService();