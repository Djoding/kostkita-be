const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class AuthController {
    /**
     * Register new user
     */
    register = asyncHandler(async (req, res) => {
        const userData = req.body;
        const result = await authService.register(userData);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    });

    /**
     * Login user
     */
    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    });

    /**
     * Google OAuth callback
     */
    googleCallback = asyncHandler(async (req, res) => {
        const user = req.user;
        const result = await authService.googleAuth(user);

        // Redirect to frontend with tokens
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
        res.redirect(redirectUrl);
    });

    /**
     * Get current user profile
     */
    getProfile = asyncHandler(async (req, res) => {
        const user = req.user;

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user }
        });
    });

    /**
     * Change password
     */
    changePassword = asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.user_id;

        await authService.changePassword(userId, currentPassword, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    });

    /**
     * Logout user
     */
    logout = asyncHandler(async (req, res) => {
        logger.info(`User logged out: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });

    /**
     * Verify email
     */
    verifyEmail = asyncHandler(async (req, res) => {
        const { token } = req.params;
        await authService.verifyEmail(token);

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    });

    /**
     * Request password reset
     */
    requestPasswordReset = asyncHandler(async (req, res) => {
        const { email } = req.body;
        await authService.requestPasswordReset(email);

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    });
}

module.exports = new AuthController();