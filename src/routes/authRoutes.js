const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticateJWT, refreshToken } = require('../middleware/auth');
const { handleValidationErrors, sanitizeInput } = require('../middleware/validation');
const authValidator = require('../validators/authValidator');
const rateLimit = require('express-rate-limit');
const uploadMiddleware = require('../middleware/upload');
const router = express.Router();

const authLimitStrict = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimitGeneral = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register',
    authLimitStrict,
    sanitizeInput,
    authValidator.registerValidator,
    handleValidationErrors,
    authController.register
);

router.post('/login',
    authLimitStrict,
    sanitizeInput,
    authValidator.loginValidator,
    handleValidationErrors,
    authController.login
);

router.post('/google/mobile',
    sanitizeInput,
    authController.googleMobileAuth
);

router.post('/refresh-token',
    authLimitGeneral,
    refreshToken
);

router.post('/setup-password',
    sanitizeInput,
    [
        body('email').isEmail().withMessage('Valid email required'),
        body('newPassword').isLength({ min: 8 }).withMessage('Password min 8 characters'),
        body('confirmPassword').notEmpty().withMessage('Confirm password required')
    ],
    handleValidationErrors,
    authController.setupPassword
);

router.post('/request-password-reset',
    authLimitStrict,
    sanitizeInput,
    authValidator.requestPasswordResetValidator,
    handleValidationErrors,
    authController.requestPasswordReset
);

router.get('/verify-email/:token',
    authController.verifyEmail
);

router.get('/google', (req, res, next) => {
    console.log('🔐 Initiating Google OAuth...');
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    console.log('🔄 Google OAuth Callback received');

    passport.authenticate('google', {
        session: false,
        failureRedirect: '/api/v1/auth/google/failure'
    }, async (err, user, info) => {
        console.log('🔍 Passport authenticate result:');
        console.log('❌ Error:', err);
        console.log('👤 User:', user ? 'Found' : 'Not found');
        console.log('ℹ️ Info:', info);

        if (err) {
            console.error('❌ Authentication error:', err);
            return res.status(500).json({
                success: false,
                message: 'Google authentication error',
                error: err.message
            });
        }

        if (!user) {
            console.error('❌ No user returned from authentication');
            return res.status(400).json({
                success: false,
                message: 'Google authentication failed',
                info: info
            });
        }

        try {
            console.log('🔐 Generating JWT tokens...');

            const jwtService = require('../config/jwt');
            const tokens = jwtService.generateTokens({
                userId: user.user_id,
                email: user.email,
                role: user.role
            });

            console.log('✅ Tokens generated successfully');

            const { password, ...userWithoutPassword } = user;

            if (req.query.mobile === 'true') {
                console.log('📱 Returning mobile response');
                return res.json({
                    success: true,
                    message: 'Google authentication successful',
                    data: {
                        user: userWithoutPassword,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        tokenType: 'Bearer',
                        expiresIn: tokens.expiresIn
                    }
                });
            }

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
            const redirectUrl = `${frontendUrl}/auth/callback?success=true&token=${tokens.accessToken}&refresh=${tokens.refreshToken}`;

            console.log('🌐 Redirecting to:', redirectUrl);
            res.redirect(redirectUrl);

        } catch (tokenError) {
            console.error('❌ Token generation error:', tokenError);
            return res.status(500).json({
                success: false,
                message: 'Token generation failed',
                error: tokenError.message
            });
        }
    })(req, res, next);
});

router.get('/google/failure', (req, res) => {
    console.log('❌ Google OAuth failure');
    res.status(400).json({
        success: false,
        message: 'Google authentication failed'
    });
});

router.get('/google/failure', (req, res) => {
    console.log('❌ Google OAuth failure');
    res.status(400).json({
        success: false,
        message: 'Google authentication failed'
    });
});

router.use(authenticateJWT);

router.get('/profile', authController.getProfile);
router.put('/profile',
    uploadMiddleware.single('avatar', 'temp'),
    sanitizeInput,
    authValidator.updateProfileValidator,
    handleValidationErrors,
    authController.updateProfile
);

router.get('/dashboard-stats', authController.getDashboardStats);
router.get('/activity', authController.getActivity);

router.post('/change-password',
    sanitizeInput,
    authValidator.changePasswordValidator,
    handleValidationErrors,
    authController.changePassword
);

router.post('/logout', authController.logout);
router.get('/check', authController.checkAuth);

module.exports = router;