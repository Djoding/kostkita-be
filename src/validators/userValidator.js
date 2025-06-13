const { body, query } = require('express-validator');

const updateProfileValidator = [
    body('full_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .trim(),

    body('phone')
        .optional()
        .matches(/^(\+62|0)[0-9]{8,13}$/)
        .withMessage('Please provide a valid Indonesian phone number'),

    body('whatsapp_number')
        .optional()
        .matches(/^(\+62|0)[0-9]{8,13}$/)
        .withMessage('Please provide a valid Indonesian WhatsApp number'),

    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL')
];

const updateUserValidator = [
    body('full_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .trim(),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('role')
        .optional()
        .isIn(['ADMIN', 'PENGELOLA', 'PENGHUNI', 'TAMU'])
        .withMessage('Invalid role'),

    body('phone')
        .optional()
        .matches(/^(\+62|0)[0-9]{8,13}$/)
        .withMessage('Please provide a valid Indonesian phone number'),

    body('whatsapp_number')
        .optional()
        .matches(/^(\+62|0)[0-9]{8,13}$/)
        .withMessage('Please provide a valid Indonesian WhatsApp number'),

    body('is_approved')
        .optional()
        .isBoolean()
        .withMessage('is_approved must be a boolean value')
];

const approveUserValidator = [
    body('is_approved')
        .isBoolean()
        .withMessage('is_approved must be a boolean value')
];

const getUsersValidator = [
    query('role')
        .optional()
        .isIn(['ADMIN', 'PENGELOLA', 'PENGHUNI', 'TAMU'])
        .withMessage('Invalid role filter'),

    query('is_approved')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('is_approved must be true or false'),

    query('search')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Search query must be between 2 and 50 characters')
        .trim(),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

const searchUsersValidator = [
    query('q')
        .notEmpty()
        .withMessage('Search query is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Search query must be between 2 and 50 characters')
        .trim(),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

const bulkApproveValidator = [
    body('user_ids')
        .isArray({ min: 1 })
        .withMessage('user_ids must be a non-empty array'),

    body('user_ids.*')
        .isUUID()
        .withMessage('Each user_id must be a valid UUID'),

    body('is_approved')
        .isBoolean()
        .withMessage('is_approved must be a boolean value')
];

module.exports = {
    updateProfileValidator,
    updateUserValidator,
    approveUserValidator,
    getUsersValidator,
    searchUsersValidator,
    bulkApproveValidator
};