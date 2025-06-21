const detailOrderLaundryService = require("../services/detailOrderLaundryService");
const { asyncHandler } = require("../middleware/errorHandler");

class DetailOrderLaundryController {
    /**
     * GET /api/v1/order/laundry/:id
     * Get laundry order detail
     */
    getLaundryOrderDetail = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { user_id, role } = req.user;

        const orderDetail = await detailOrderLaundryService.getLaundryOrderDetail(
            id,
            user_id,
            role
        );

        res.json({
            success: true,
            message: "Laundry order detail retrieved successfully",
            data: orderDetail,
        });
    });

    /**
     * PATCH /api/v1/order/laundry/:id/status
     * Update laundry order status 
     */
    updateOrderStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        const { user_id } = req.user;

        const updatedOrder = await detailOrderLaundryService.updateLaundryOrderStatus(
            id,
            updateData,
            user_id
        );

        res.json({
            success: true,
            message: "Laundry order status updated successfully",
            data: updatedOrder,
        });
    });

    /**
     * POST /api/v1/order/laundry/:id/cancel
     * Cancel laundry order 
     */
    cancelOrder = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { reason } = req.body;
        const { user_id } = req.user;

        const cancelledOrder = await detailOrderLaundryService.cancelLaundryOrder(
            id,
            user_id,
            reason
        );

        res.json({
            success: true,
            message: "Order cancelled successfully",
            data: cancelledOrder,
        });
    });

    /**
     * POST /api/v1/order/laundry/:id/pickup
     * Mark laundry order as picked up 
     */
    markAsPickedUp = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { user_id } = req.user;

        const updatedOrder = await detailOrderLaundryService.markAsPickedUp(id, user_id);

        res.json({
            success: true,
            message: "Order marked as picked up successfully",
            data: updatedOrder,
        });
    });
}

module.exports = new DetailOrderLaundryController();