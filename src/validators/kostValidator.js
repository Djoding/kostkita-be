const { body, query } = require("express-validator");

const createKost = [
  body("pengelola_id")
    .optional()
    .isUUID()
    .withMessage("Valid pengelola ID required"),

  body("nama_kost")
    .notEmpty()
    .withMessage("Nama kost is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Nama kost must be between 2 and 255 characters")
    .trim(),

  body("alamat")
    .notEmpty()
    .withMessage("Alamat is required")
    .trim(),

  body("total_kamar")
    .isInt({ min: 1 })
    .withMessage("Total kamar must be at least 1"),

  body("tipe_id")
    .notEmpty()
    .withMessage("Tipe ID is required")
    .isUUID()
    .withMessage("Valid tipe ID required"),

  body("harga_bulanan")
    .notEmpty()
    .withMessage("Harga bulanan is required")
    .isNumeric({ min: 0 })
    .withMessage("Harga bulanan must be a positive number"),

  body("harga_final")
    .notEmpty()
    .withMessage("Harga final is required")
    .isNumeric({ min: 0 })
    .withMessage("Harga final must be a positive number"),

  body("deposit")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Deposit must be a positive number"),

  body("gmaps_link")
    .optional()
    .isURL()
    .withMessage("GMaps link must be a valid URL"),

  body("deskripsi")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Deskripsi must not exceed 1000 characters")
    .trim(),

  body("daya_listrik")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Daya listrik must not exceed 50 characters"),

  body("sumber_air")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Sumber air must not exceed 100 characters"),

  body("wifi_speed")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Wifi speed must not exceed 100 characters"),

  body("kapasitas_parkir_motor")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Kapasitas parkir motor must be a positive number"),

  body("kapasitas_parkir_mobil")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Kapasitas parkir mobil must be a positive number"),

  body("kapasitas_parkir_sepeda")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Kapasitas parkir sepeda must be a positive number"),

  body("biaya_tambahan")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Biaya tambahan must be a positive number"),

  body("jam_survey")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Jam survey must not exceed 50 characters"),

  body("foto_kost")
    .optional()
    .isArray()
    .withMessage("Foto kost must be an array"),

  body("fasilitas_ids")
    .optional()
    .isArray()
    .withMessage("Fasilitas IDs must be an array"),

  body("fasilitas_ids.*")
    .optional()
    .isUUID()
    .withMessage("Each fasilitas ID must be a valid UUID"),

  body("peraturan_data")
    .optional()
    .isArray()
    .withMessage("Peraturan data must be an array"),

  body("peraturan_data.*.peraturan_id")
    .if(body("peraturan_data").exists())
    .notEmpty()
    .withMessage("Peraturan ID is required")
    .isUUID()
    .withMessage("Peraturan ID must be a valid UUID"),

  body("peraturan_data.*.keterangan_tambahan")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Keterangan tambahan must not exceed 500 characters"),
];

const updateKost = [
  body("nama_kost")
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage("Nama kost must be between 2 and 255 characters")
    .trim(),

  body("alamat")
    .optional()
    .trim(),

  body("total_kamar")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total kamar must be at least 1"),

  body("gmaps_link")
    .optional()
    .isURL()
    .withMessage("GMaps link must be a valid URL"),

  body("biaya_tambahan")
    .optional()
    .isNumeric()
    .withMessage("Biaya tambahan must be a number"),
];

const queryKost = [
  query("nama_kost")
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage("Nama kost must be between 2 and 255 characters")
    .trim(),
];

module.exports = {
  kostValidator: {
    createKost,
    updateKost,
    queryKost,
  },
};