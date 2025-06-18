const express = require('express');
const kostController = require('../controllers/kostController');
const { authenticateJWT, authorize } = require('../middleware/auth');
const { handleValidationErrors, sanitizeInput, validateUUID } = require('../middleware/validation');
const kostValidator = require('../validators/kostValidator');

const router = express.Router();

router.get('/', kostController.getAllKost);

router.get(
    '/:kost_id/fasilitas',
    validateUUID('kost_id'),
    kostController.getFasilitasByKostId
  );



router.get('/:kost_id/peraturan',
  validateUUID('kost_id'),
  kostController.getPeraturanByKostId
);

router.get('/owner',
    authenticateJWT,
    authorize('PENGELOLA'),
    kostController.getKostByOwner
);
router.get('/:kost_id',
    validateUUID('kost_id'),
    kostController.getKostById
);

router.use(authenticateJWT);

router.post('/',
    authorize('PENGELOLA', 'ADMIN'),
    sanitizeInput,
    kostValidator.kostValidator.createKost,
    handleValidationErrors,
    kostController.createKost
);

router.put('/:kost_id',
    authorize('PENGELOLA', 'ADMIN'),
    validateUUID('kost_id'),
    sanitizeInput,
    kostValidator.kostValidator.updateKost,
    handleValidationErrors,
    kostController.updateKost
);

router.delete('/:kost_id',
    authorize('ADMIN'),
    validateUUID('kost_id'),
    kostController.deleteKost
);




module.exports = router;