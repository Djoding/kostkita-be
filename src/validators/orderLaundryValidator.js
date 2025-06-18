const { query, body, validationResult } = require("express-validator");

const validateGetLaundryHistory = [
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

const validateCreateLaundryOrderWithPayment = [
  body("items")
    .notEmpty()
    .withMessage("Daftar layanan laundry tidak boleh kosong")
    .isArray({ min: 1 })
    .withMessage(
      "Daftar layanan laundry harus berupa array dengan minimal satu item"
    ),

  body("items.*.layanan_id")
    .notEmpty()
    .withMessage("Layanan ID setiap item tidak boleh kosong")
    .isUUID()
    .withMessage("Layanan ID setiap item harus berupa UUID yang valid"),
  body("items.*.jumlah_satuan")
    .notEmpty()
    .withMessage("Jumlah satuan setiap item tidak boleh kosong")
    .isInt({ min: 1 })
    .withMessage("Jumlah satuan setiap item harus berupa angka dan minimal 1"),

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
  validateGetLaundryHistory,
  validateCreateLaundryOrderWithPayment,
};
