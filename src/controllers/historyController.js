const historyService = require('../services/historyService');
const { asyncHandler } = require('../middleware/errorHandler');

class HistoryController {
    /**
     * Get user's reservation history
     */
    getReservationHistory = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const pagination = req.pagination;

        const result = await historyService.getReservationHistory(userId, pagination);

        res.json({
            success: true,
            message: 'Reservation history retrieved successfully',
            data: result.reservations,
            pagination: result.pagination
        });
    });

    /**
     * Get user's catering order history
     */
    getCateringHistory = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const pagination = req.pagination;

        const result = await historyService.getCateringHistory(userId, pagination);

        res.json({
            success: true,
            message: 'Catering history retrieved successfully',
            data: result.orders,
            pagination: result.pagination
        });
    });

    /**
     * Get user's laundry order history
     */
    getLaundryHistory = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const pagination = req.pagination;

        const result = await historyService.getLaundryHistory(userId, pagination);

        res.json({
            success: true,
            message: 'Laundry history retrieved successfully',
            data: result.orders,
            pagination: result.pagination
        });
    });

    /**
     * Get complete user history
     */
    getCompleteHistory = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const pagination = req.pagination;

        const result = await historyService.getCompleteHistory(userId, pagination);

        res.json({
            success: true,
            message: 'Complete history retrieved successfully',
            data: result.activities,
            pagination: result.pagination
        });
    });

    /**
     * Get history statistics
     */
    getHistoryStats = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;

        const stats = await historyService.getHistoryStats(userId);

        res.json({
            success: true,
            message: 'History statistics retrieved successfully',
            data: stats
        });
    });
}

module.exports = new HistoryController();