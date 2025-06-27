// routes/laundryRoutes.js
const express = require("express");
const laundryController = require("../controllers/laundryController");
const { authenticateJWT, authorize } = require("../middleware/auth");
const {
  handleValidationErrors,
  sanitizeInput,
  validateUUID,
} = require("../middleware/validation");
const uploadMiddleware = require("../middleware/upload");
const laundryValidator = require("../validators/laundryValidator");
const parseJsonFields = require("../middleware/parseJsonFields");

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// GET /api/v1/laundry - Get laundry list by kost (Pengelola & Penghuni)
router.get(
  "/",
  laundryValidator.getLaundryByKostValidator,
  handleValidationErrors,
  authorize("PENGELOLA", "PENGHUNI"),
  laundryController.getLaundrysByKost
);

// POST /api/v1/laundry - Create laundry (Pengelola only)
router.post(
  "/",
  authorize("PENGELOLA"),
  uploadMiddleware.single("qris_image", "temp"),
  parseJsonFields(["rekening_info"]), // Tambahkan ini
  sanitizeInput,
  laundryValidator.createLaundryValidator,
  handleValidationErrors,
  laundryController.createLaundry
);

// PUT /api/v1/laundry/:id - Update laundry (Pengelola only)
router.put(
  "/:id",
  authorize("PENGELOLA"),
  uploadMiddleware.single("qris_image", "temp"),
  parseJsonFields(["rekening_info"]), // Tambahkan ini
  sanitizeInput,
  laundryValidator.updateLaundryValidator,
  handleValidationErrors,
  laundryController.updateLaundry
);

// DELETE /api/v1/laundry/:id - Delete laundry (soft delete) (Pengelola only)
router.delete(
  "/:id",
  authorize("PENGELOLA"),
  validateUUID("id"),
  handleValidationErrors,
  laundryController.deleteLaundry
);

// GET /api/v1/laundry/orders - Get all user orders (Pengelola only)
router.get(
  "/orders",
  authorize("PENGELOLA"),
  laundryValidator.getOrdersValidator,
  handleValidationErrors,
  laundryController.getLaundryOrders
);

// GET /api/v1/laundry/orders/:id - Get user order detail (Pengelola only)
router.get(
  "/orders/:id",
  authorize("PENGELOLA"),
  laundryValidator.orderIdValidator,
  handleValidationErrors,
  laundryController.getLaundryOrderDetail
);

// PATCH /api/v1/laundry/orders/:id/status - Update order status (Pengelola only)
router.patch(
  "/orders/:id/status",
  authorize("PENGELOLA"),
  sanitizeInput,
  laundryValidator.updateOrderStatusValidator,
  handleValidationErrors,
  laundryController.updateOrderStatus
);

// GET /api/v1/laundry/:id/services - Get laundry services & pricing (Pengelola & Penghuni)
router.get(
  "/:id/services",
  laundryValidator.laundryIdValidator,
  handleValidationErrors,
  authorize("PENGELOLA", "PENGHUNI"),
  laundryController.getLaundryServices
);

// POST /api/v1/laundry/:id/services - Create laundry service & pricing (Pengelola only)
router.post(
  "/:id/services",
  authorize("PENGELOLA"),
  sanitizeInput,
  laundryValidator.createServiceValidator,
  handleValidationErrors,
  laundryController.createLaundryService
);

// PUT /api/v1/laundry/:id/services/:layanan_id - Update laundry service & pricing (Pengelola only)
router.put(
  "/:id/services/:layanan_id",
  authorize("PENGELOLA"),
  sanitizeInput,
  laundryValidator.updateServiceValidator,
  handleValidationErrors,
  laundryController.updateLaundryService
);

// DELETE /api/v1/laundry/:id/services/:layanan_id - Delete laundry service & pricing (Pengelola only)
router.delete(
  "/:id/services/:layanan_id",
  authorize("PENGELOLA"),
  laundryValidator.deleteServiceValidator,
  handleValidationErrors,
  laundryController.deleteLaundryService
);

module.exports = router;
