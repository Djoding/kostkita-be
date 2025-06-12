const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');

class UserController {
    /**
     * Get all users (Admin only)
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const filters = {
            role: req.query.role,
            is_approved: req.query.is_approved ? req.query.is_approved === 'true' : undefined,
            search: req.query.search
        };

        const result = await userService.getAllUsers(filters, req.pagination);

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
        const { id } = req.params;
        const user = await userService.getUserById(id);

        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: { user }
        });
    });

    /**
     * Update current user profile
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
     * Update user by admin
     */
    updateUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;

        const user = await userService.updateUser(id, updateData);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    });

    /**
     * Delete user
     */
    deleteUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await userService.deleteUser(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    });

    /**
     * Approve/Reject user
     */
    approveUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { is_approved } = req.body;

        const user = await userService.approveUser(id, is_approved);

        res.json({
            success: true,
            message: `User ${is_approved ? 'approved' : 'rejected'} successfully`,
            data: { user }
        });
    });

    /**
     * Get user statistics
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
     * Search users
     */
    searchUsers = asyncHandler(async (req, res) => {
        const { q: query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const result = await userService.searchUsers(query, req.pagination);

        res.json({
            success: true,
            message: 'Search results retrieved successfully',
            data: result.users,
            pagination: result.pagination
        });
    });
}

module.exports = new UserController();