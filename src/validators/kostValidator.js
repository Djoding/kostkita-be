const { body, query } = require('express-validator');

const createKost = [
    body('pengelola_id')
        .isUUID()
        .withMessage('Valid pengelola ID required'),

    body('nama_kost')
        .notEmpty()
        .withMessage('Nama kost is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Nama kost must be between 2 and 255 characters')
        .trim(),

    body('alamat')
        .notEmpty()
        .withMessage('Alamat is required')
        .trim(),

    body('total_kamar')
        .isInt({ min: 1 })
        .withMessage('Total kamar must be at least 1'),

    body('gmaps_link')
        .optional()
        .isURL()
        .withMessage('GMaps link must be a valid URL'),

    body('deskripsi')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Deskripsi must not exceed 1000 characters')
        .trim(),

    body('daya_listrik')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Daya listrik must not exceed 50 characters'),

    body('kapasitas_parkir_motor')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Kapasitas parkir motor must be a positive number'),

    body('kapasitas_parkir_mobil')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Kapasitas parkir mobil must be a positive number'),

    body('biaya_tambahan')
        .optional()
        .isNumeric()
        .withMessage('Biaya tambahan must be a number')
];

const updateKost = [
    body('nama_kost')
        .optional()
        .isLength({ min: 2, max: 255 })
        .withMessage('Nama kost must be between 2 and 255 characters')
        .trim(),

    body('alamat')
        .optional()
        .trim(),

    body('total_kamar')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Total kamar must be at least 1'),

    body('gmaps_link')
        .optional()
        .isURL()
        .withMessage('GMaps link must be a valid URL'),

    body('biaya_tambahan')
        .optional()
        .isNumeric()
        .withMessage('Biaya tambahan must be a number')
];

const queryKost = [
    query('nama_kost')
        .optional()
        .isLength({ min: 2, max: 255 })
        .withMessage('Nama kost must be between 2 and 255 characters')
        .trim()
];

module.exports = {
    kostValidator: {
        createKost,
        updateKost,
        queryKost
    }
};