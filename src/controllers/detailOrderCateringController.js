const detailOrderCateringService = require("../services/detailOrderCateringService");
const { asyncHandler } = require("../middleware/errorHandler");

class DetailOrderCateringController {
    /**
     * GET /api/v1/order/catering/:id
     * Get catering order detail
     */
    getCateringOrderDetail = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { user_id, role } = req.user;

        const orderDetail = await detailOrderCateringService.getCateringOrderDetail(
            id,
            user_id,
            role
        );

        res.json({
            success: true,
            message: "Catering order detail retrieved successfully",
            data: orderDetail,
        });
    });

    /**
     * PATCH /api/v1/order/catering/:id/status
     * Update catering order status
     */
    updateOrderStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status, notes } = req.body;
        const { user_id } = req.user;

        const updatedOrder = await detailOrderCateringService.updateCateringOrderStatus(
            id,
            status,
            user_id,
            notes
        );

        res.json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder,
        });
    });

    /**
     * POST /api/v1/order/catering/:id/cancel
     * Cancel catering order
     */
    cancelOrder = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { reason } = req.body;
        const { user_id } = req.user;

        const cancelledOrder = await detailOrderCateringService.cancelCateringOrder(
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
}

module.exports = new DetailOrderCateringController();