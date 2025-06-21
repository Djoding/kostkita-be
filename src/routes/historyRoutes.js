const express = require('express');
const historyController = require('../controllers/historyController');
const { authenticateJWT } = require('../middleware/auth');
const { validatePagination, validateUUID } = require('../middleware/validation');

const router = express.Router();

router.use(authenticateJWT);

router.get('/reservations',
    validatePagination,
    historyController.getReservationHistory
);

router.get('/reservations/:reservasiId',
    validateUUID('reservasiId'),
    historyController.getReservationDetail
);

router.get('/catering',
    validatePagination,
    historyController.getCateringHistory
);

router.get('/laundry',
    validatePagination,
    historyController.getLaundryHistory
);

router.get('/complete',
    validatePagination,
    historyController.getCompleteHistory
);

router.get('/stats',
    historyController.getHistoryStats
);

router.get('/active-reservation',
    historyController.getActiveReservation
);

module.exports = router;