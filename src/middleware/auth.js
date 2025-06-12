const passport = require('passport');
const jwtService = require('../config/jwt');
const prisma = require('../config/database');
const logger = require('../config/logger');

/**
 * JWT Authentication Middleware
 */
const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            logger.error('JWT Authentication error:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during authentication'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access',
                error: info?.message || 'Invalid token'
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

/**
 * Optional JWT Authentication Middleware
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            logger.error('Optional auth error:', err);
        }

        if (user) {
            req.user = user;
        }

        next();
    })(req, res, next);
};

/**
 * Role-based Authorization Middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                required_roles: roles,
                user_role: req.user.role
            });
        }

        next();
    };
};

/**
 * Check if user is approved
 */
const requireApproval = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.is_approved && req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Account not approved yet. Please wait for admin approval.'
        });
    }

    next();
};

/**
 * Refresh Token Middleware
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const decoded = jwtService.verifyRefreshToken(refreshToken);

        // Get fresh user data
        const user = await prisma.users.findUnique({
            where: { user_id: decoded.userId },
            select: {
                user_id: true,
                email: true,
                username: true,
                full_name: true,
                role: true,
                is_approved: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new tokens
        const tokens = jwtService.generateTokens({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                ...tokens,
                user
            }
        });

    } catch (error) {
        logger.error('Refresh token error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

module.exports = {
    authenticateJWT,
    optionalAuth,
    authorize,
    requireApproval,
    refreshToken
};