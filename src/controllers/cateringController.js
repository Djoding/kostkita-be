const cateringService = require("../services/cateringService");
const { asyncHandler } = require("../middleware/errorHandler");
const fileService = require("../services/fileService");

class CateringController {
  /**
   * GET /api/v1/catering
   * Get catering list by kost
   */
  getCateringsByKost = asyncHandler(async (req, res) => {
    const { kost_id } = req.query;
    const { user_id, role } = req.user;

    if (!kost_id) {
      return res.status(400).json({
        success: false,
        message: "kost_id is required",
      });
    }

    const caterings = await cateringService.getCateringsByKost(
      kost_id,
      role,
      user_id
    );

    res.json({
      success: true,
      message: "Caterings retrieved successfully",
      data: caterings,
    });
  });

  /**
   * POST /api/v1/catering
   * Create catering
   */
  createCatering = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    let cateringData = req.body;

    // Handle file upload if present
    if (req.file) {
      try {
        const processedPath = await fileService.processImage(req.file.path, {
          width: 800,
          height: 600,
          quality: 80,
          format: "jpeg",
        });

        const result = await fileService.moveFile(processedPath, "catering");
        cateringData.qris_image = result.url;
      } catch (error) {
        await fileService.deleteFile(req.file.path);
        throw new AppError("Failed to process QRIS image", 500);
      }
    }

    const catering = await cateringService.createCatering(
      cateringData,
      user_id
    );

    res.status(201).json({
      success: true,
      message: "Catering created successfully",
      data: catering,
      ...(req.file && {
        uploaded_file: {
          original_name: req.file.originalname,
          size: req.file.size,
          url: cateringData.qris_image,
        },
      }),
    });
  });

  /**
   * GET /api/v1/catering/:id/menu
   * Get catering menu
   */
  getCateringMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id, role } = req.user;

    const result = await cateringService.getCateringMenu(id, role, user_id);

    res.json({
      success: true,
      message: "Catering menu retrieved successfully",
      data: result,
    });
  });

  /**
   * POST /api/v1/catering/:id/menu
   * Add catering menu item
   */
  addCateringMenuItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user;
    let menuData = req.body;

    // Handle file upload if present
    if (req.file) {
      try {
        const processedPath = await fileService.processImage(req.file.path, {
          width: 600,
          height: 400,
          quality: 80,
          format: "jpeg",
        });

        const result = await fileService.moveFile(
          processedPath,
          "catering_menu"
        );
        menuData.foto_menu = result.url;
      } catch (error) {
        await fileService.deleteFile(req.file.path);
        throw new AppError("Failed to process menu image", 500);
      }
    }

    const menu = await cateringService.addCateringMenuItem(
      id,
      menuData,
      user_id
    );

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      data: menu,
      ...(req.file && {
        uploaded_file: {
          original_name: req.file.originalname,
          size: req.file.size,
          url: menuData.foto_menu,
        },
      }),
    });
  });

  /**
   * PUT /api/v1/catering/:catering_id/menu/:menu_id
   * Update catering menu item
   */
  updateCateringMenuItem = asyncHandler(async (req, res) => {
    const { menu_id } = req.params;
    const { user_id } = req.user;
    let updateData = req.body;

    // Handle file upload if present
    if (req.file) {
      try {
        const processedPath = await fileService.processImage(req.file.path, {
          width: 600,
          height: 400,
          quality: 80,
          format: "jpeg",
        });

        const result = await fileService.moveFile(
          processedPath,
          "catering_menu"
        );
        updateData.foto_menu = result.url;
      } catch (error) {
        await fileService.deleteFile(req.file.path);
        throw new AppError("Failed to process menu image", 500);
      }
    }

    const menu = await cateringService.updateCateringMenuItem(
      menu_id,
      updateData,
      user_id
    );

    res.json({
      success: true,
      message: "Menu item updated successfully",
      data: menu,
      ...(req.file && {
        uploaded_file: {
          original_name: req.file.originalname,
          size: req.file.size,
          url: updateData.foto_menu,
        },
      }),
    });
  });

  /**
   * DELETE /api/v1/catering/:catering_id/menu/:menu_id
   * Delete catering menu item
   */
  deleteCateringMenuItem = asyncHandler(async (req, res) => {
    const { menu_id } = req.params;
    const { user_id } = req.user;

    await cateringService.deleteCateringMenuItem(menu_id, user_id);

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  });

  /**
   * GET /api/v1/catering/orders
   * Get user orders for pengelola
   */
  getCateringOrders = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    const filters = req.query;

    const orders = await cateringService.getCateringOrders(user_id, filters);

    res.json({
      success: true,
      message: "Catering orders retrieved successfully",
      data: orders,
    });
  });

  /**
   * GET /api/v1/catering/orders/:id
   * Get user order detail
   */
  getCateringOrderDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user;

    const order = await cateringService.getCateringOrderDetail(id, user_id);

    res.json({
      success: true,
      message: "Catering order detail retrieved successfully",
      data: order,
    });
  });

  /**
   * PATCH /api/v1/catering/orders/:id/status
   * Update order status
   */
  updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { user_id } = req.user;

    const order = await cateringService.updateOrderStatus(id, status, user_id);

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  });
}

module.exports = new CateringController();
