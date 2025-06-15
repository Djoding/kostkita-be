const { body } = require('express-validator');

const registerValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

    body('full_name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .trim(),

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
        .withMessage('Please provide a valid Indonesian WhatsApp number')
];

const loginValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const changePasswordValidator = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        })
];

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
        .custom((value, { req }) => {
            if (req.file) return true;

            if (value && typeof value === 'string') {
                const urlRegex = /^(https?:\/\/)|(\/uploads\/)/;
                if (!urlRegex.test(value)) {
                    throw new Error('Avatar must be a valid URL or file upload');
                }
            }
            return true;
        })
];

const requestPasswordResetValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail()
];

module.exports = {
    registerValidator,
    loginValidator,
    changePasswordValidator,
    updateProfileValidator,
    requestPasswordResetValidator
};