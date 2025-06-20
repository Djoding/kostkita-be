const express = require('express');
const historyController = require('../controllers/historyController');
const { authenticateJWT } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// History endpoints
router.get('/reservations',
    validatePagination,
    historyController.getReservationHistory
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

module.exports = router;