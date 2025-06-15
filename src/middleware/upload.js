const fileService = require('../services/fileService');
const { AppError } = require('./errorHandler');
const logger = require('../config/logger');

class UploadMiddleware {
    single(fieldName, destination = 'temp') {
        const upload = fileService.getMulterConfig(destination).single(fieldName);
        
        return (req, res, next) => {
            upload(req, res, (error) => {
                if (error) {
                    logger.error('Upload error:', error);
                    
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        return next(new AppError('File size too large', 400));
                    }
                    if (error.code === 'LIMIT_FILE_COUNT') {
                        return next(new AppError('Too many files', 400));
                    }
                    
                    return next(new AppError(error.message, 400));
                }
                next();
            });
        };
    }

    array(fieldName, maxCount = 5, destination = 'temp') {
        const upload = fileService.getMulterConfig(destination).array(fieldName, maxCount);
        
        return (req, res, next) => {
            upload(req, res, (error) => {
                if (error) {
                    logger.error('Upload error:', error);
                    
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        return next(new AppError('File size too large', 400));
                    }
                    if (error.code === 'LIMIT_FILE_COUNT') {
                        return next(new AppError('Too many files', 400));
                    }
                    
                    return next(new AppError(error.message, 400));
                }
                next();
            });
        };
    }

    fields(fields, destination = 'temp') {
        const upload = fileService.getMulterConfig(destination).fields(fields);
        
        return (req, res, next) => {
            upload(req, res, (error) => {
                if (error) {
                    logger.error('Upload error:', error);
                    return next(new AppError(error.message, 400));
                }
                next();
            });
        };
    }

    avatar() {
        return [
            this.single('avatar', 'temp'),
            async (req, res, next) => {
                if (!req.file) {
                    return next();
                }

                try {
                    const processedPath = await fileService.processImage(req.file.path, {
                        width: 400,
                        height: 400,
                        quality: 85,
                        format: 'jpeg'
                    });

                    const result = await fileService.moveFile(processedPath, 'avatars');
                    
                    req.processedFile = {
                        ...result,
                        originalName: req.file.originalname,
                        size: req.file.size
                    };

                    next();
                } catch (error) {
                    logger.error('Avatar processing error:', error);
                    next(new AppError('Failed to process avatar', 500));
                }
            }
        ];
    }
}

module.exports = new UploadMiddleware();