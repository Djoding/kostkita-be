const { body, query } = require('express-validator');

const createFasilitas = [
    body('nama_fasilitas')
        .notEmpty()
        .withMessage('Nama fasilitas is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Nama fasilitas must be between 2 and 255 characters')
        .trim(),

    body('kategori')
        .isIn(['UMUM', 'KAMAR', 'KAMAR_MANDI', 'PARKIR'])
        .withMessage('Invalid kategori fasilitas'),

    body('icon')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Icon name must not exceed 100 characters')
        .trim()
];

const updateFasilitas = [
    body('nama_fasilitas')
        .optional()
        .isLength({ min: 2, max: 255 })
        .withMessage('Nama fasilitas must be between 2 and 255 characters')
        .trim(),

    body('kategori')
        .optional()
        .isIn(['UMUM', 'KAMAR', 'KAMAR_MANDI', 'PARKIR'])
        .withMessage('Invalid kategori fasilitas'),

    body('icon')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Icon name must not exceed 100 characters')
        .trim(),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean value')
];

const createTipeKamar = [
    body('nama_tipe')
        .notEmpty()
        .withMessage('Nama tipe is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Nama tipe must be between 2 and 100 characters')
        .trim(),

    body('ukuran')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Ukuran must not exceed 50 characters')
        .trim(),

    body('kapasitas')
        .isInt({ min: 1, max: 10 })
        .withMessage('Kapasitas must be between 1 and 10'),

    body('deskripsi')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Deskripsi must not exceed 1000 characters')
        .trim()
];

const createPeraturan = [
    body('nama_peraturan')
        .notEmpty()
        .withMessage('Nama peraturan is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Nama peraturan must be between 2 and 255 characters')
        .trim(),

    body('kategori')
        .isIn(['TIPE_KAMAR', 'KOST_UMUM'])
        .withMessage('Invalid kategori peraturan'),

    body('icon')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Icon name must not exceed 100 characters')
        .trim()
];

const createLayananLaundry = [
    body('nama_layanan')
        .notEmpty()
        .withMessage('Nama layanan is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Nama layanan must be between 2 and 255 characters')
        .trim(),

    body('satuan')
        .notEmpty()
        .withMessage('Satuan is required')
        .isLength({ min: 1, max: 20 })
        .withMessage('Satuan must be between 1 and 20 characters')
        .trim()
];

const queryFasilitas = [
    query('kategori')
        .optional()
        .isIn(['UMUM', 'KAMAR', 'KAMAR_MANDI', 'PARKIR'])
        .withMessage('Invalid kategori fasilitas')
];

const queryPeraturan = [
    query('kategori')
        .optional()
        .isIn(['TIPE_KAMAR', 'KOST_UMUM'])
        .withMessage('Invalid kategori peraturan')
];

module.exports = {
    masterDataValidator: {
        createFasilitas,
        updateFasilitas,
        createTipeKamar,
        createPeraturan,
        createLayananLaundry,
        queryFasilitas,
        queryPeraturan
    }
};