const { query, body, validationResult } = require("express-validator");

const validateGetCateringHistory = [
  query("kostId")
    .optional()
    .isUUID()
    .withMessage("kostId harus berupa UUID yang valid"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateCreateCateringOrderWithPayment = [
  body("items")
    .notEmpty()
    .withMessage("Daftar menu tidak boleh kosong")
    .isArray({ min: 1 })
    .withMessage("Daftar menu harus berupa array dengan minimal satu item"),

  body("items.*.menu_id")
    .notEmpty()
    .withMessage("Menu ID setiap item tidak boleh kosong")
    .isUUID()
    .withMessage("Menu ID setiap item harus berupa UUID yang valid"),
  body("items.*.jumlah_porsi") 
    .notEmpty()
    .withMessage("Jumlah porsi setiap item tidak boleh kosong")
    .isInt({ min: 1 })
    .withMessage("Jumlah porsi setiap item harus berupa angka dan minimal 1"),

  body("metode_bayar")
    .notEmpty()
    .withMessage("Metode bayar tidak boleh kosong")
    .isIn(["QRIS", "TRANSFER"]) 
    .withMessage("Metode bayar tidak valid"),
  body("catatan")
    .optional()
    .isString()
    .withMessage("Catatan harus berupa teks"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateGetCateringHistory,
  validateCreateCateringOrderWithPayment,
};
