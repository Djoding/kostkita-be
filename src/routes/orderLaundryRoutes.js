const express = require("express");
const router = express.Router();
const laundryController = require("../controllers/orderLaundryController");
const detailOrderLaundryController = require("../controllers/detailOrderLaundryController");

const { authenticateJWT, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { handleValidationErrors, sanitizeInput } = require("../middleware/validation");

const {
  validateGetLaundryHistory,
  validateCreateLaundryOrderWithPayment,
} = require("../validators/orderLaundryValidator");

const {
  orderIdValidator,
  updateLaundryOrderStatusValidator,
  cancelLaundryOrderValidator,
  markAsPickedUpValidator,
} = require("../validators/detailOrderLaundryValidator");

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

router.get("/", validateGetLaundryHistory, laundryController.getLaundryHistory);

router.post(
  "/",
  sanitizeInput,
  parseItemsMiddleware,
  validateCreateLaundryOrderWithPayment,
  handleValidationErrors,
  laundryController.createLaundryOrderAndPayment
);

router.get(
  "/:id",
  orderIdValidator,
  handleValidationErrors,
  detailOrderLaundryController.getLaundryOrderDetail
);

router.patch(
  "/:id/status",
  authorize("PENGELOLA"),
  updateLaundryOrderStatusValidator,
  handleValidationErrors,
  detailOrderLaundryController.updateOrderStatus
);

router.post(
  "/:id/cancel",
  authorize("PENGHUNI"),
  cancelLaundryOrderValidator,
  handleValidationErrors,
  detailOrderLaundryController.cancelOrder
);

router.post(
  "/:id/pickup",
  authorize("PENGELOLA"),
  markAsPickedUpValidator,
  handleValidationErrors,
  detailOrderLaundryController.markAsPickedUp
);

module.exports = router;
