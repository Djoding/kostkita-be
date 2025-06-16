const express = require("express");
const router = express.Router();
const cateringController = require("../controllers/orderCateringController");
const { authenticateJWT } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { handleValidationErrors } = require("../middleware/validation");
const {
  validateGetCateringHistory,
  validateCreateCateringOrderWithPayment,
} = require("../validators/orderCateringValidator");

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
  upload.single("bukti_bayar", "temp"),
  parseItemsMiddleware,
  validateCreateCateringOrderWithPayment,
  handleValidationErrors,
  cateringController.createCateringOrderAndPayment
);

module.exports = router;
