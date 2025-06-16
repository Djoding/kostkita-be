const fileService = require('../services/fileService');
const { asyncHandler } = require('../middleware/errorHandler');
const path = require('path');

class FileController {
    /**
     * Get file
     */
    getFile = asyncHandler(async (req, res) => {
        const { folder, filename } = req.params;
        const filePath = `${fileService.uploadPath}/${folder}/${filename}`;

        const fileInfo = await fileService.getFileInfo(filePath);
        if (!fileInfo.exists) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        };

        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000');

        res.sendFile(path.resolve(filePath));
    });

    /**
     * Upload files
     */
    uploadFiles = asyncHandler(async (req, res) => {
        const { folder = 'temp' } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const uploadedFiles = [];

        for (const file of req.files) {
            try {
                const result = await fileService.moveFile(file.path, folder);

                uploadedFiles.push({
                    originalName: file.originalname,
                    filename: result.filename,
                    url: result.url,
                    size: file.size,
                    mimetype: file.mimetype
                });
            } catch (error) {
                await fileService.deleteFile(file.path);
                throw error;
            }
        }

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: {
                files: uploadedFiles,
                count: uploadedFiles.length
            }
        });
    });

    /**
     * Delete file
     */
    deleteFile = asyncHandler(async (req, res) => {
        const { folder, filename } = req.params;
        const filePath = `${fileService.uploadPath}/${folder}/${filename}`;

        await fileService.deleteFile(filePath);

        res.json({
            success: true,
            message: 'File deleted successfully by admin'
        });
    });
}

module.exports = new FileController();