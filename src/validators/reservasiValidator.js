const { body, param, validationResult } = require("express-validator");

const validateCreateReservation = [
  body("kost_id")
    .notEmpty()
    .withMessage("Kost ID tidak boleh kosong")
    .isUUID()
    .withMessage("Kost ID harus berupa UUID yang valid"),
  body("tanggal_check_in")
    .notEmpty()
    .withMessage("Tanggal Check-in tidak boleh kosong")
    .isISO8601()
    .toDate()
    .withMessage("Format Tanggal Check-in tidak valid (YYYY-MM-DD).")
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        throw new Error("Tanggal Check-in tidak bisa di masa lalu.");
      }
      return true;
    }),
  body("durasi_bulan")
    .notEmpty()
    .withMessage("Durasi bulan tidak boleh kosong")
    .isInt({ min: 1 })
    .withMessage("Durasi bulan harus berupa angka dan minimal 1."),
  body("metode_bayar")
    .notEmpty()
    .withMessage("Metode bayar tidak boleh kosong")
    .isIn(["QRIS", "TRANSFER"])
    .withMessage("Metode bayar tidak valid."),
  body("catatan")
    .optional()
    .isString()
    .withMessage("Catatan harus berupa teks."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateReservationStatus = [
  body("status")
    .notEmpty()
    .withMessage("Status tidak boleh kosong")
    .isIn(["APPROVED", "REJECTED"])
    .withMessage("Status reservasi tidak valid."),
  body("rejection_reason")
    .optional()
    .isString()
    .withMessage("Alasan penolakan harus berupa teks."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateExtendReservation = [
  body("durasi_perpanjangan_bulan")
    .notEmpty()
    .withMessage("Durasi perpanjangan bulan tidak boleh kosong")
    .isInt({ min: 1 })
    .withMessage("Durasi perpanjangan bulan harus berupa angka dan minimal 1."),
  body("metode_bayar")
    .notEmpty()
    .withMessage("Metode bayar tidak boleh kosong")
    .isIn(["QRIS", "TRANSFER"])
    .withMessage("Metode bayar tidak valid."),
  body("catatan")
    .optional()
    .isString()
    .withMessage("Catatan harus berupa teks."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateGetKostReservations = [
  param("kostId")
    .notEmpty()
    .withMessage("Kost ID tidak boleh kosong")
    .isUUID()
    .withMessage("Kost ID harus berupa UUID yang valid"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateCreateReservation,
  validateUpdateReservationStatus,
  validateExtendReservation,
  validateGetKostReservations,
};
