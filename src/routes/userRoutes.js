const express = require('express');
const userController = require('../controllers/userController');
const { authenticateJWT, authorize } = require('../middleware/auth');
const {
    handleValidationErrors,
    sanitizeInput,
    validateUUID,
    validatePagination
} = require('../middleware/validation');
const userValidator = require('../validators/userValidator');

const router = express.Router();

router.use(authenticateJWT);

router.get('/profile', userController.getUserById);

router.put('/profile',
    sanitizeInput,
    userValidator.updateProfileValidator,
    handleValidationErrors,
    userController.updateProfile
);

router.get('/search',
    validatePagination,
    userValidator.searchUsersValidator,
    handleValidationErrors,
    userController.searchUsers
);

router.use(authorize('ADMIN'));

router.get('/',
    validatePagination,
    userValidator.getUsersValidator,
    handleValidationErrors,
    userController.getAllUsers
);

router.get('/stats', userController.getUserStats);

router.get('/pending',
    validatePagination,
    userController.getPendingUsers
);

router.post('/bulk-approve',
    sanitizeInput,
    userValidator.bulkApproveValidator,
    handleValidationErrors,
    userController.bulkApproveUsers
);

router.get('/:id',
    validateUUID('id'),
    userController.getUserById
);

router.put('/:id',
    validateUUID('id'),
    sanitizeInput,
    userValidator.updateUserValidator,
    handleValidationErrors,
    userController.updateUser
);

router.delete('/:id',
    validateUUID('id'),
    userController.deleteUser
);

router.patch('/:id/approve',
    validateUUID('id'),
    sanitizeInput,
    userValidator.approveUserValidator,
    handleValidationErrors,
    userController.approveUser
);

module.exports = router;