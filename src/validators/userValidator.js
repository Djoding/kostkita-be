const { body } = require('express-validator');

exports.loginValidator = [
    body('email')
        .isEmail()
        .withMessage('Email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
]

exports.registerValidator = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['Pengelola', 'Penghuni'])
        .withMessage('Role must be either Pengelola or Penghuni')
]

exports.loginWithGoogleValidator = [
    body('token')
        .notEmpty()
        .withMessage('Token is required')
        .isString()
        .withMessage('Token must be a string'),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['Pengelola', 'Penghuni'])
        .withMessage('Role must be either Pengelola or Penghuni'),
]