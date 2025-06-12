const express = require('express');
const userController = require('../controllers/userController');
const { authenticateJWT, authorize } = require('../middleware/auth');
const {
    handleValidationErrors,
    sanitizeInput,
    validateUUID,
    validatePagination
} = require('../middleware/validation');
const {
    updateProfileValidator,
    updateUserValidator,
    approveUserValidator,
    getUsersValidator,
    searchUsersValidator
} = require('../validators/userValidator');

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Profile routes (accessible by all authenticated users)
router.get('/profile',
    userController.getUserById
);

router.put('/profile',
    sanitizeInput,
    updateProfileValidator,
    handleValidationErrors,
    userController.updateProfile
);

// Search users (accessible by all authenticated users)
router.get('/search',
    validatePagination,
    searchUsersValidator,
    handleValidationErrors,
    userController.searchUsers
);

// Admin only routes
router.use(authorize('ADMIN'));

// User management
router.get('/',
    validatePagination,
    getUsersValidator,
    handleValidationErrors,
    userController.getAllUsers
);

router.get('/stats',
    userController.getUserStats
);

router.get('/:id',
    validateUUID('id'),
    userController.getUserById
);

router.put('/:id',
    validateUUID('id'),
    sanitizeInput,
    updateUserValidator,
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
    approveUserValidator,
    handleValidationErrors,
    userController.approveUser
);

module.exports = router;