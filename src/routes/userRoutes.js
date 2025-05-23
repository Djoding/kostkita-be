const express = require('express');
const router = express.Router();
const {test, createUser, getUser, getUserById, updateUser, deleteUser } = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

//Public API Route
router.get('/test', test);

//Private API Route
router.use(authMiddleware)
router.get('/', getUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);



module.exports = router;