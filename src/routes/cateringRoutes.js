const express = require("express");
const cateringController = require("../controllers/cateringController");
const { authenticateJWT, authorize } = require("../middleware/auth");
const {
  handleValidationErrors,
  sanitizeInput,
  validateUUID,
} = require("../middleware/validation");
const uploadMiddleware = require("../middleware/upload");
const cateringValidator = require("../validators/cateringValidator");

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// GET /api/v1/catering - Get catering list by kost (Pengelola & Penghuni)
router.get(
  "/",
  cateringValidator.getCateringByKostValidator,
  handleValidationErrors,
  authorize("PENGELOLA", "PENGHUNI"),
  cateringController.getCateringsByKost
);

// POST /api/v1/catering - Create catering (Pengelola only)
router.post(
  "/",
  authorize("PENGELOLA"),
  uploadMiddleware.single("qris_image", "temp"),
  sanitizeInput,
  cateringValidator.createCateringValidator,
  handleValidationErrors,
  cateringController.createCatering
);

// GET /api/v1/catering/orders - Get user orders (Pengelola only)
router.get(
  "/orders",
  authorize("PENGELOLA"),
  cateringValidator.getOrdersValidator,
  handleValidationErrors,
  cateringController.getCateringOrders
);

// GET /api/v1/catering/orders/:id - Get user order detail (Pengelola only)
router.get(
  "/orders/:id",
  authorize("PENGELOLA"),
  cateringValidator.orderIdValidator,
  handleValidationErrors,
  cateringController.getCateringOrderDetail
);

// PATCH /api/v1/catering/orders/:id/status - Update order status (Pengelola only)
router.patch(
  "/orders/:id/status",
  authorize("PENGELOLA"),
  sanitizeInput,
  cateringValidator.updateOrderStatusValidator,
  handleValidationErrors,
  cateringController.updateOrderStatus
);

// GET /api/v1/catering/:id/menu - Get catering menu (Pengelola & Penghuni)
router.get(
  "/:id/menu",
  cateringValidator.cateringIdValidator,
  handleValidationErrors,
  authorize("PENGELOLA", "PENGHUNI"),
  cateringController.getCateringMenu
);

// POST /api/v1/catering/:id/menu - Add catering menu item (Pengelola only)
router.post('/:id/menu',
    authorize('PENGELOLA'),
    uploadMiddleware.single('foto_menu', 'temp'),
    sanitizeInput,
    cateringValidator.addMenuItemValidator,
    handleValidationErrors,
    cateringController.addCateringMenuItem
);

// PUT /api/v1/catering/:catering_id/menu/:menu_id - Update catering menu item (Pengelola only)
router.put('/:catering_id/menu/:menu_id',
    authorize('PENGELOLA'),
    uploadMiddleware.single('foto_menu', 'temp'),
    sanitizeInput,
    cateringValidator.updateMenuItemValidator,
    handleValidationErrors,
    cateringController.updateCateringMenuItem
);

// DELETE /api/v1/catering/:catering_id/menu/:menu_id - Delete catering menu item (Pengelola only)
router.delete('/:catering_id/menu/:menu_id',
    authorize('PENGELOLA'),
    cateringValidator.deleteMenuItemValidator,
    handleValidationErrors,
    cateringController.deleteCateringMenuItem
);

module.exports = router;
