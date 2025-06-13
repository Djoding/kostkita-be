const express = require('express');
const masterController = require('../controllers/masterController');
const { authenticateJWT, authorize } = require('../middleware/auth');
const { handleValidationErrors, sanitizeInput, validateUUID } = require('../middleware/validation');
const masterValidator = require('../validators/masterValidator');

const router = express.Router();

router.get('/all', masterController.getAllMasterData);
router.get('/fasilitas', masterController.getFasilitas);
router.get('/tipe-kamar', masterController.getTipeKamar);
router.get('/peraturan', masterController.getPeraturan);
router.get('/layanan-laundry', masterController.getLayananLaundry);

router.use(authenticateJWT);
router.use(authorize('ADMIN'));

router.get('/summary', masterController.getMasterDataSummary);

router.post('/fasilitas',
    sanitizeInput,
    masterValidator.masterDataValidator.createFasilitas,
    handleValidationErrors,
    masterController.createFasilitas
);

router.put('/fasilitas/:id',
    validateUUID('id'),
    sanitizeInput,
    masterValidator.masterDataValidator.updateFasilitas,
    handleValidationErrors,
    masterController.updateFasilitas
);

router.delete('/fasilitas/:id',
    validateUUID('id'),
    masterController.deleteFasilitas
);

router.post('/tipe-kamar',
    sanitizeInput,
    masterValidator.masterDataValidator.createTipeKamar,
    handleValidationErrors,
    masterController.createTipeKamar
);

router.post('/peraturan',
    sanitizeInput,
    masterValidator.masterDataValidator.createPeraturan,
    handleValidationErrors,
    masterController.createPeraturan
);

router.post('/layanan-laundry',
    sanitizeInput,
    masterValidator.masterDataValidator.createLayananLaundry,
    handleValidationErrors,
    masterController.createLayananLaundry
);

module.exports = router;