const logger = require('../config/logger');

/**
 * Custom Error Class
 */
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async Error Handler Wrapper
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Handle Prisma Errors
 */
const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P2000':
            return new AppError('The provided value for the column is too long', 400);
        case 'P2001':
            return new AppError('Record not found', 404);
        case 'P2002':
            const field = error.meta?.target?.[0] || 'field';
            return new AppError(`${field} already exists`, 409);
        case 'P2003':
            return new AppError('Foreign key constraint failed', 400);
        case 'P2004':
            return new AppError('Constraint failed on the database', 400);
        case 'P2025':
            return new AppError('Record not found', 404);
        default:
            return new AppError('Database operation failed', 500);
    }
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again', 401);
};

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired. Please log in again', 401);
};

/**
 * Send Error Response
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    } else {
        logger.error('ERROR:', err);

        res.status(500).json({
            success: false,
            message: 'Something went wrong!'
        });
    }
};

/**
 * Global Error Handler Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    logger.error({
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        if (error.code && error.code.startsWith('P')) {
            error = handlePrismaError(error);
        } else if (error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        } else if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        } else if (error.name === 'ValidationError') {
            error = new AppError('Invalid input data', 400);
        } else if (error.name === 'CastError') {
            error = new AppError('Invalid data format', 400);
        }

        sendErrorProd(error, res);
    }
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

module.exports = {
    AppError,
    asyncHandler,
    globalErrorHandler,
    notFoundHandler
};