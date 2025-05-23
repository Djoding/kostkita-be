const express = require('express');
const router = express.Router();
const { createKost, getAllKost } = require('../controllers/kostController')
const authMiddleware = require('../middleware/authMiddleware')


//Private API Route
// router.use(authMiddleware)
router.post('/create', createKost);
router.get('/', getAllKost)



module.exports = router;