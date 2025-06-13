const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class UserController {
    /**
     * [ADMIN YE] Get all users with pagination and filters 
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const { role, is_approved, search } = req.query;
        const pagination = req.pagination;

        const filters = {};
        if (role) filters.role = role;
        if (is_approved !== undefined) filters.is_approved = is_approved === 'true';
        if (search) filters.search = search;

        const result = await userService.getAllUsers(filters, pagination);

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: result.users,
            pagination: result.pagination
        });
    });

    /**
     * Get user by ID
     */
    getUserById = asyncHandler(async (req, res) => {
        const userId = req.params.id || req.user.user_id; 
        const user = await userService.getUserById(userId);

        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: { user }
        });
    });

    /**
     * Update user profile
     */
    updateProfile = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const updateData = req.body;

        const user = await userService.updateProfile(userId, updateData);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    });

    /**
     * [ADMIN YE] Update user
     */
    updateUser = asyncHandler(async (req, res) => {
        const userId = req.params.id;
        const updateData = req.body;

        const user = await userService.updateUser(userId, updateData);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    });

    /**
     * [ADMIN YE] Delete user 
     */
    deleteUser = asyncHandler(async (req, res) => {
        const userId = req.params.id;

        if (userId === req.user.user_id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        await userService.deleteUser(userId);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    });

    /**
     * [ADMIN YE] Approve/Reject user 
     */
    approveUser = asyncHandler(async (req, res) => {
        const userId = req.params.id;
        const { is_approved } = req.body;

        const user = await userService.approveUser(userId, is_approved);

        res.json({
            success: true,
            message: `User ${is_approved ? 'approved' : 'rejected'} successfully`,
            data: { user }
        });
    });

    /**
     * [ADMIN YE] Get user statistics 
     */
    getUserStats = asyncHandler(async (req, res) => {
        const stats = await userService.getUserStats();

        res.json({
            success: true,
            message: 'User statistics retrieved successfully',
            data: stats
        });
    });

    /**
     * [ADMIN YE] Search users
     */
    searchUsers = asyncHandler(async (req, res) => {
        const { q: query } = req.query;
        const pagination = req.pagination;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }

        const result = await userService.searchUsers(query.trim(), pagination);

        res.json({
            success: true,
            message: 'Search completed successfully',
            data: result.users,
            pagination: result.pagination,
            query: query.trim()
        });
    });

    /**
     * [ADMIN YE] Get users pending approval
     */
    getPendingUsers = asyncHandler(async (req, res) => {
        const pagination = req.pagination;
        const filters = { is_approved: false };

        const result = await userService.getAllUsers(filters, pagination);

        res.json({
            success: true,
            message: 'Pending users retrieved successfully',
            data: result.users,
            pagination: result.pagination
        });
    });

    /**
     * [ADMIN YE] Bulk approve users
     */
    bulkApproveUsers = asyncHandler(async (req, res) => {
        const { user_ids, is_approved } = req.body;

        if (!Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'user_ids must be a non-empty array'
            });
        }

        if (typeof is_approved !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_approved must be a boolean value'
            });
        }

        const results = [];
        const errors = [];

        for (const userId of user_ids) {
            try {
                const user = await userService.approveUser(userId, is_approved);
                results.push(user);
            } catch (error) {
                errors.push({
                    user_id: userId,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Bulk ${is_approved ? 'approval' : 'rejection'} completed`,
            data: {
                successful: results,
                failed: errors,
                total_processed: user_ids.length,
                successful_count: results.length,
                failed_count: errors.length
            }
        });
    });
}

module.exports = new UserController();