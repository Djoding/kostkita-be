const express = require("express");
const router = express.Router();
const cateringController = require("../controllers/orderCateringController");
const detailOrderCateringController = require("../controllers/detailOrderCateringController");

const { authenticateJWT, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { handleValidationErrors, sanitizeInput } = require("../middleware/validation");

const {
  validateGetCateringHistory,
  validateCreateCateringOrderWithPayment,
} = require("../validators/orderCateringValidator");
const {
  orderIdValidator,
  updateCateringOrderStatusValidator,
  cancelCateringOrderValidator,
} = require("../validators/detailOrderCateringValidator");

const parseItemsMiddleware = (req, res, next) => {
  if (req.body.items && typeof req.body.items === "string") {
    try {
      req.body.items = JSON.parse(req.body.items);
    } catch (e) {
      return res.status(400).json({
        errors: [
          {
            msg: "Format 'items' tidak valid, harus berupa JSON string yang benar.",
          },
        ],
      });
    }
  }
  next();
};

router.use(authenticateJWT);

router.get(
  "/",
  validateGetCateringHistory,
  cateringController.getCateringHistory
);

router.post(
  "/",
  sanitizeInput,
  parseItemsMiddleware,
  validateCreateCateringOrderWithPayment,
  handleValidationErrors,
  cateringController.createCateringOrderAndPayment
);

router.get(
  "/:id",
  orderIdValidator,
  handleValidationErrors,
  detailOrderCateringController.getCateringOrderDetail
);

router.patch(
  "/:id/status",
  authorize("PENGELOLA"),
  updateCateringOrderStatusValidator,
  handleValidationErrors,
  detailOrderCateringController.updateOrderStatus
);

router.post(
  "/:id/cancel",
  authorize("PENGHUNI"),
  cancelCateringOrderValidator,
  handleValidationErrors,
  detailOrderCateringController.cancelOrder
);

module.exports = router;
