const express = require('express');
const router = express.Router();
const { login, register, loginWithGoogle,  } = require('../controllers/authController');
const { loginValidator, registerValidator, loginWithGoogleValidator } = require('../validators/userValidator');


router.post('/login', loginValidator, login)
router.post('/register', registerValidator, register)
router.post('/auth/google', loginWithGoogleValidator, loginWithGoogle)

module.exports = router;