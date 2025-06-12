const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticateJWT, refreshToken } = require('../middleware/auth');
const { handleValidationErrors, sanitizeInput } = require('../middleware/validation');
const {
    registerValidator,
    loginValidator,
    changePasswordValidator,
    requestPasswordResetValidator
} = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/register',
    sanitizeInput,
    registerValidator,
    handleValidationErrors,
    authController.register
);

router.post('/login',
    sanitizeInput,
    loginValidator,
    handleValidationErrors,
    authController.login
);

router.post('/refresh-token',
    refreshToken
);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    authController.googleCallback
);

// Password reset
router.post('/request-password-reset',
    sanitizeInput,
    requestPasswordResetValidator,
    handleValidationErrors,
    authController.requestPasswordReset
);

router.get('/verify-email/:token',
    authController.verifyEmail
);

// Protected routes
router.use(authenticateJWT);

router.get('/profile',
    authController.getProfile
);

router.post('/change-password',
    sanitizeInput,
    changePasswordValidator,
    handleValidationErrors,
    authController.changePassword
);

router.post('/logout',
    authController.logout
);

module.exports = router;