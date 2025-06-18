const laundryService = require("../services/laundryService");
const { asyncHandler } = require("../middleware/errorHandler");
const fileService = require("../services/fileService");

class LaundryController {
  /**
   * GET /api/v1/laundry
   * Get laundry list by kost
   */
  getLaundrysByKost = asyncHandler(async (req, res) => {
    const { kost_id } = req.query;
    const { user_id, role } = req.user;

    if (!kost_id) {
      return res.status(400).json({
        success: false,
        message: "kost_id is required",
      });
    }

    const laundries = await laundryService.getLaundrysByKost(
      kost_id,
      role,
      user_id
    );

    res.json({
      success: true,
      message: "Laundries retrieved successfully",
      data: laundries,
    });
  });

  /**
   * POST /api/v1/laundry
   * Create laundry
   */
  createLaundry = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    let laundryData = req.body;

    // Handle file upload if present
    if (req.file) {
      try {
        const processedPath = await fileService.processImage(req.file.path, {
          width: 800,
          height: 600,
          quality: 80,
          format: "jpeg",
        });

        const result = await fileService.moveFile(processedPath, "laundry");
        laundryData.qris_image = result.url;
      } catch (error) {
        await fileService.deleteFile(req.file.path);
        throw new AppError("Failed to process QRIS image", 500);
      }
    }

    const laundry = await laundryService.createLaundry(laundryData, user_id);

    res.status(201).json({
      success: true,
      message: "Laundry created successfully",
      data: laundry,
      ...(req.file && {
        uploaded_file: {
          original_name: req.file.originalname,
          size: req.file.size,
          url: laundryData.qris_image,
        },
      }),
    });
  });

  /**
   * GET /api/v1/laundry/:id/services
   * Get laundry services & pricing
   */
  getLaundryServices = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id, role } = req.user;

    const result = await laundryService.getLaundryServices(id, role, user_id);

    res.json({
      success: true,
      message: "Laundry services retrieved successfully",
      data: result,
    });
  });

  /**
   * POST /api/v1/laundry/:id/services
   * Create laundry services & pricing
   */
  createLaundryService = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user;
    const serviceData = req.body;

    const result = await laundryService.createLaundryService(
      id,
      serviceData,
      user_id
    );

    res.status(201).json({
      success: true,
      message: "Laundry service created successfully",
      data: result,
    });
  });

  /**
   * PUT /api/v1/laundry/:id/services/:layanan_id
   * Update single laundry service & pricing
   */
  updateLaundryService = asyncHandler(async (req, res) => {
    const { id, layanan_id } = req.params;
    const { user_id } = req.user;
    const serviceData = req.body;

    const result = await laundryService.updateLaundryService(
      id,
      layanan_id,
      serviceData,
      user_id
    );

    res.json({
      success: true,
      message: "Laundry service updated successfully",
      data: result,
    });
  });

  /**
   * DELETE /api/v1/laundry/:id/services/:layanan_id
   * Delete laundry service & pricing
   */
  deleteLaundryService = asyncHandler(async (req, res) => {
    const { id, layanan_id } = req.params;
    const { user_id } = req.user;

    await laundryService.deleteLaundryService(id, layanan_id, user_id);

    res.json({
      success: true,
      message: "Laundry service deleted successfully",
    });
  });

  /**
   * GET /api/v1/laundry/orders
   * Get all user orders for pengelola
   */
  getLaundryOrders = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    const filters = req.query;

    const orders = await laundryService.getLaundryOrders(user_id, filters);

    res.json({
      success: true,
      message: "Laundry orders retrieved successfully",
      data: orders,
    });
  });

  /**
   * GET /api/v1/laundry/orders/:id
   * Get user order detail
   */
  getLaundryOrderDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user;

    const order = await laundryService.getLaundryOrderDetail(id, user_id);

    res.json({
      success: true,
      message: "Laundry order detail retrieved successfully",
      data: order,
    });
  });

  /**
   * PATCH /api/v1/laundry/orders/:id/status
   * Update order status
   */
  updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const statusData = req.body;
    const { user_id } = req.user;

    const order = await laundryService.updateOrderStatus(
      id,
      statusData,
      user_id
    );

    res.json({
      success: true,
      message: "Laundry order status updated successfully",
      data: order,
    });
  });
}

module.exports = new LaundryController();
