const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Validation Result Middleware
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value,
            location: error.location
        }));

        logger.warn('Validation errors:', {
            path: req.path,
            method: req.method,
            errors: formattedErrors,
            body: req.body
        });

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }

    next();
};

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === undefined || req.body[key] === null || req.body[key] === '') {
                delete req.body[key];
            }

            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }

    next();
};

/**
 * Validate UUID parameter
 */
const validateUUID = (paramName = 'id') => {
    return (req, res, next) => {
        const uuid = req.params[paramName];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!uuid || !uuidRegex.test(uuid)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format. Must be a valid UUID.`,
                provided: uuid
            });
        }

        next();
    };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (page < 1) {
        return res.status(400).json({
            success: false,
            message: 'Page must be greater than 0'
        });
    }

    if (limit < 1 || limit > 100) {
        return res.status(400).json({
            success: false,
            message: 'Limit must be between 1 and 100'
        });
    }

    req.pagination = {
        page,
        limit,
        offset
    };

    next();
};

/**
 * Validate file upload
 */
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
    return (req, res, next) => {
        if (!req.file && !req.files) {
            return next();
        }

        const files = req.files || [req.file];

        for (const file of files) {
            if (file.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    message: `File ${file.originalname} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
                });
            }

            if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File ${file.originalname} has invalid type. Allowed types: ${allowedTypes.join(', ')}`,
                    provided: file.mimetype
                });
            }
        }

        next();
    };
};

module.exports = {
    handleValidationErrors,
    sanitizeInput,
    validateUUID,
    validatePagination,
    validateFileUpload
};