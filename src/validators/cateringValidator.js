// validators/cateringValidator.js
const { body, query, param } = require("express-validator");

const createCateringValidator = [
  body("kost_id").isUUID().withMessage("Valid kost_id (UUID) is required"),

  body("nama_catering")
    .notEmpty()
    .withMessage("Nama catering is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Nama catering must be between 2 and 255 characters")
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

const updateCateringValidator = [
  param("id").isUUID().withMessage("Valid catering ID (UUID) is required"), // Added for update

  body("nama_catering")
    .optional()
    .notEmpty()
    .withMessage("Nama catering cannot be empty")
    .isLength({ min: 2, max: 255 })
    .withMessage("Nama catering must be between 2 and 255 characters")
    .trim(),

  body("alamat")
    .optional()
    .notEmpty()
    .withMessage("Alamat cannot be empty")
    .isLength({ min: 5, max: 500 })
    .withMessage("Alamat must be between 5 and 500 characters")
    .trim(),

  body("whatsapp_number")
    .optional({ nullable: true }) // Allow null for optional field update
    .matches(/^(\+62|0)[0-9]{8,13}$/)
    .withMessage("Please provide a valid Indonesian WhatsApp number"),

  body("rekening_info")
    .optional({ nullable: true }) // Allow null for optional field update
    .isObject()
    .withMessage("Rekening info must be a valid object"),

  body("is_partner")
    .optional()
    .isBoolean()
    .withMessage("is_partner must be a boolean value"),

  body("is_active") // For soft delete/activate
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean value"),
];

const deleteCateringValidator = [
  param("id").isUUID().withMessage("Valid catering ID (UUID) is required"), // Added for delete
];

const getCateringByKostValidator = [
  query("kost_id").isUUID().withMessage("Valid kost_id (UUID) is required"),
];

const cateringIdValidator = [
  param("id").isUUID().withMessage("Valid catering ID (UUID) is required"),
];

const addMenuItemValidator = [
  param("id").isUUID().withMessage("Valid catering ID (UUID) is required"),

  body("nama_menu")
    .notEmpty()
    .withMessage("Nama menu is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Nama menu must be between 2 and 255 characters")
    .trim(),

  body("kategori")
    .isIn(["MAKANAN_BERAT", "SNACK", "MINUMAN"])
    .withMessage("Invalid kategori menu"),

  body("harga")
    .isNumeric()
    .withMessage("Harga must be a valid number")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("Harga must be greater than 0");
      }
      return true;
    }),

  body("is_available")
    .optional()
    .isBoolean()
    .withMessage("is_available must be a boolean value"),
];

const updateMenuItemValidator = [
  param("menu_id").isUUID().withMessage("Valid menu ID (UUID) is required"),

  body("nama_menu")
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage("Nama menu must be between 2 and 255 characters")
    .trim(),

  body("kategori")
    .optional()
    .isIn(["MAKANAN_BERAT", "SNACK", "MINUMAN"])
    .withMessage("Invalid kategori menu"),

  body("harga")
    .optional()
    .isNumeric()
    .withMessage("Harga must be a valid number")
    .custom((value) => {
      if (value !== undefined && parseFloat(value) <= 0) {
        throw new Error("Harga must be greater than 0");
      }
      return true;
    }),

  body("is_available")
    .optional()
    .isBoolean()
    .withMessage("is_available must be a boolean value"),
];

const deleteMenuItemValidator = [
  param("menu_id").isUUID().withMessage("Valid menu ID (UUID) is required"),
];

const getOrdersValidator = [
  query("status")
    .optional()
    .isIn(["PENDING", "PROSES", "DITERIMA"])
    .withMessage("Invalid status"),

  query("catering_id")
    .optional()
    .isUUID()
    .withMessage("Valid catering_id (UUID) is required"),

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
];

module.exports = {
  createCateringValidator,
  updateCateringValidator, // Export new validator
  deleteCateringValidator, // Export new validator
  getCateringByKostValidator,
  cateringIdValidator,
  addMenuItemValidator,
  updateMenuItemValidator,
  deleteMenuItemValidator,
  getOrdersValidator,
  orderIdValidator,
  updateOrderStatusValidator,
};
