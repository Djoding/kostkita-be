const { body, query, param } = require("express-validator");

const createLaundryValidator = [
  body("kost_id").isUUID().withMessage("Valid kost_id (UUID) is required"),

  body("nama_laundry")
    .notEmpty()
    .withMessage("Nama laundry is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Nama laundry must be between 2 and 255 characters")
    .trim(),

  body("alamat")
    .notEmpty()
    .withMessage("Alamat is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Alamat must be between 5 and 500 characters")
    .trim(),

  body("whatsapp_number")
    .optional()
    .matches(/^(\+62|0)[0-9]{8,13}$/)
    .withMessage("Please provide a valid Indonesian WhatsApp number"),

  body("rekening_info")
    .optional()
    .isObject()
    .withMessage("Rekening info must be a valid object"),

  body("is_partner")
    .optional()
    .isBoolean()
    .withMessage("is_partner must be a boolean value"),
];

const getLaundryByKostValidator = [
  query("kost_id").isUUID().withMessage("Valid kost_id (UUID) is required"),
];

const laundryIdValidator = [
  param("id").isUUID().withMessage("Valid laundry ID (UUID) is required"),
];

const createServiceValidator = [
  param("id").isUUID().withMessage("Valid laundry ID (UUID) is required"),

  body("layanan_id")
    .isUUID()
    .withMessage("Valid layanan_id (UUID) is required"),

  body("harga_per_satuan")
    .isNumeric()
    .withMessage("Harga per satuan must be a valid number")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("Harga per satuan must be greater than 0");
      }
      return true;
    }),

  body("is_available")
    .optional()
    .isBoolean()
    .withMessage("is_available must be a boolean value"),
];

const updateServiceValidator = [
  param("id").isUUID().withMessage("Valid laundry ID (UUID) is required"),

  param("layanan_id")
    .isUUID()
    .withMessage("Valid layanan ID (UUID) is required"),

  body("harga_per_satuan")
    .optional()
    .isNumeric()
    .withMessage("Harga per satuan must be a valid number")
    .custom((value) => {
      if (value !== undefined && parseFloat(value) <= 0) {
        throw new Error("Harga per satuan must be greater than 0");
      }
      return true;
    }),

  body("is_available")
    .optional()
    .isBoolean()
    .withMessage("is_available must be a boolean value"),
];

const deleteServiceValidator = [
  param("id").isUUID().withMessage("Valid laundry ID (UUID) is required"),

  param("layanan_id")
    .isUUID()
    .withMessage("Valid layanan ID (UUID) is required"),
];


const getOrdersValidator = [
  query("status")
    .optional()
    .isIn(["PENDING", "PROSES", "DITERIMA"])
    .withMessage("Invalid status"),

  query("laundry_id")
    .optional()
    .isUUID()
    .withMessage("Valid laundry_id (UUID) is required"),

  query("start_date")
    .optional()
    .isISO8601()
    .withMessage("start_date must be a valid ISO8601 date"),

  query("end_date")
    .optional()
    .isISO8601()
    .withMessage("end_date must be a valid ISO8601 date"),
];

const orderIdValidator = [
  param("id").isUUID().withMessage("Valid order ID (UUID) is required"),
];

const updateOrderStatusValidator = [
  param("id").isUUID().withMessage("Valid order ID (UUID) is required"),

  body("status")
    .isIn(["PENDING", "PROSES", "DITERIMA"])
    .withMessage("Invalid status. Must be PENDING, PROSES, or DITERIMA"),

  body("total_final")
    .optional()
    .isNumeric()
    .withMessage("Total final must be a valid number")
    .custom((value) => {
      if (value !== undefined && parseFloat(value) <= 0) {
        throw new Error("Total final must be greater than 0");
      }
      return true;
    }),

  body("berat_actual")
    .optional()
    .isNumeric()
    .withMessage("Berat actual must be a valid number")
    .custom((value) => {
      if (value !== undefined && parseFloat(value) <= 0) {
        throw new Error("Berat actual must be greater than 0");
      }
      return true;
    }),

  body("estimasi_selesai")
    .optional()
    .isISO8601()
    .withMessage("Estimasi selesai must be a valid ISO8601 date"),
];

module.exports = {
  createLaundryValidator,
  getLaundryByKostValidator,
  laundryIdValidator,
  createServiceValidator,
  updateServiceValidator,
  deleteServiceValidator,
  getOrdersValidator,
  orderIdValidator,
  updateOrderStatusValidator,
};
