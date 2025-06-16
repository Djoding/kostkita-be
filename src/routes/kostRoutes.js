const express = require('express');
const kostController = require('../controllers/kostController');
const { authenticateJWT, authorize } = require('../middleware/auth');
const { handleValidationErrors, sanitizeInput, validateUUID } = require('../middleware/validation');
const kostValidator = require('../validators/kostValidator');

const router = express.Router();

router.get('/kost', kostController.getAllKost);

router.use(authenticateJWT);
router.use(authorize('ADMIN'));

router.post('/kost',
    sanitizeInput,
    kostValidator.kostValidator.createKost,
    handleValidationErrors,
    kostController.createKost
);

router.put('/kost/:kost_id',
    validateUUID('kost_id'),
    sanitizeInput,
    kostValidator.kostValidator.updateKost,
    handleValidationErrors,
    kostController.updateKost
);

router.delete('/kost/:kost_id',
    validateUUID('kost_id'),
    kostController.deleteKost
);

module.exports = router;