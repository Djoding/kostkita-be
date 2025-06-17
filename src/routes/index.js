const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const orderCateringRoutes = require('./orderCateringRoutes');
const masterRoutes = require('./masterRoutes');
const kostRoutes = require('./kostRoutes');

const router = express.Router();

router.get('/docs', (req, res) => {
    res.json({
        success: true,
        message: 'API Documentation',
        version: 'v1',
        endpoints: {
            authentication: {
                base: '/auth',
                description: 'User authentication and authorization',
                routes: [
                    'POST /auth/register - Register new user',
                    'POST /auth/login - User login',
                    'POST /auth/refresh-token - Refresh access token',
                    'GET /auth/google - Google OAuth login',
                    'GET /auth/google/callback - Google OAuth callback',
                    'GET /auth/profile - Get user profile (Protected)',
                    'PUT /auth/profile - Update user profile (Protected)',
                    'POST /auth/change-password - Change password (Protected)',
                    'POST /auth/logout - User logout (Protected)',
                    'POST /auth/request-password-reset - Request password reset',
                    'GET /auth/verify-email/:token - Verify email address'
                ]
            },
            users: {
                base: '/users',
                description: 'User management (Admin only)',
                routes: [
                    'GET /users - Get all users with pagination',
                    'GET /users/stats - Get user statistics',
                    'GET /users/search - Search users',
                    'GET /users/:id - Get user by ID',
                    'PUT /users/:id - Update user',
                    'DELETE /users/:id - Delete user',
                    'PATCH /users/:id/approve - Approve/reject user'
                ]
            },
            master: {
                base: '/master',
                description: 'Master data management',
                routes: [
                    'GET /master/all - Get all master data (Public)',
                    'GET /master/fasilitas - Get all fasilitas (Public)',
                    'GET /master/tipe-kamar - Get all tipe kamar (Public)',
                    'GET /master/peraturan - Get all peraturan (Public)',
                    'GET /master/layanan-laundry - Get all layanan laundry (Public)',
                    'GET /master/summary - Get master data summary (Admin only)',
                    'POST /master/fasilitas - Create fasilitas (Admin only)',
                    'PUT /master/fasilitas/:id - Update fasilitas (Admin only)',
                    'DELETE /master/fasilitas/:id - Delete fasilitas (Admin only)'
                ]
            },
            kost: {
                base: '/kost',
                description: 'Kost management',
                routes: [
                    'GET /kost - Get all kost (Public)',
                    'GET /kost/:id - Get kost by ID (Public)',
                    'GET /kost/owner - Get kost by logged-in owner (Pengelola only)',
                    'POST /kost - Create kost (Pengelola/Admin)',
                    'PUT /kost/:id - Update kost (Pengelola/Admin)',
                    'DELETE /kost/:id - Delete kost (Admin only)'
                ]
            },
        },
        authentication: {
            type: 'Bearer Token',
            header: 'Authorization: Bearer <token>',
            note: 'Include access token in Authorization header for protected routes'
        },
        responses: {
            success: {
                format: {
                    success: true,
                    message: 'string',
                    data: 'object|array'
                }
            },
            error: {
                format: {
                    success: false,
                    message: 'string',
                    errors: 'array (optional)'
                }
            }
        }
    });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/master', masterRoutes);
router.use('/order/catering', orderCateringRoutes);
router.use('/kost', kostRoutes);

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Kosan Management API v1',
        timestamp: new Date().toISOString(),
        available_endpoints: [
            '/auth - Authentication routes',
            '/users - User management routes',
            '/master - Master data routes',
            '/docs - API documentation',
            '/kost - Kost management routes',
        ]
    });
});

router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.method} ${req.originalUrl} not found`,
        available_endpoints: [
            '/api/v1/auth',
            '/api/v1/users',
            '/api/v1/master',
            '/api/v1/docs',
            '/api/v1/kost',
        ]
    });
});

module.exports = router;