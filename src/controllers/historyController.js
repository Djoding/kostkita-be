const historyService = require('../services/historyService');
const { asyncHandler } = require('../middleware/errorHandler');

class HistoryController {
    /**
     * Get user's reservation history with orders
     */
    getReservationHistory = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const pagination = req.pagination;

        const result = await historyService.getReservationHistoryWithOrders(userId, pagination);

        res.json({
            success: true,
            message: 'Reservation history with orders retrieved successfully',
            data: result.reservations,
            pagination: result.pagination
        });
    });

    /**
     * Get reservation detail with all orders
     */
    getReservationDetail = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const { reservasiId } = req.params;

        const reservation = await historyService.getReservationDetail(userId, reservasiId);

        res.json({
            success: true,
            message: 'Reservation detail retrieved successfully',
            data: reservation
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

    /**
     * Get user's active reservation
     */
    getActiveReservation = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;

        const activeReservation = await historyService.getActiveReservation(userId);

        res.json({
            success: true,
            message: activeReservation ? 'Active reservation found' : 'No active reservation',
            data: activeReservation
        });
    });
}

module.exports = new HistoryController();