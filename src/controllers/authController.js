const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const prisma = require('../config/database');
const logger = require('../config/logger');
const fileService = require('../services/fileService');

class AuthController {
    /**
     * Register new user
     */
    register = asyncHandler(async (req, res) => {
        const userData = req.body;
        const result = await authService.register(userData);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                tokenType: 'Bearer',
                expiresIn: result.tokens.expiresIn
            }
        });
    });

    /**
     * Login user
     */
    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                tokenType: 'Bearer',
                expiresIn: result.tokens.expiresIn
            }
        });
    });

    /**
     * Google OAuth initiate
     */
    googleAuth = asyncHandler(async (req, res, next) => {
        // passport middleware
        next();
    });

    googleMobileAuth = asyncHandler(async (req, res) => {
        const { idToken, platform } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'Google ID token is required'
            });
        }

        const { OAuth2Client } = require('google-auth-library');

        const clientIds = [
            process.env.IOS_CLIENT_ID,
            process.env.GOOGLE_CLIENT_ID,
            process.env.ANDROID_CLIENT_ID,
            '407408718192.apps.googleusercontent.com',
        ].filter(Boolean);

        let profile;
        let verified = false;
        let lastError;

        console.log('🔍 Received ID token from Flutter...');
        console.log('📱 Platform:', platform);

        for (const clientId of clientIds) {
            try {
                console.log(`🔑 Trying to verify with client ID: ${clientId}`);
                const client = new OAuth2Client(clientId);
                const ticket = await client.verifyIdToken({
                    idToken: idToken,
                    audience: clientId,
                });

                const payload = ticket.getPayload();
                console.log(`✅ Verification successful with: ${clientId}`);
                console.log(`👤 User: ${payload.name} (${payload.email})`);

                profile = {
                    id: payload.sub,
                    emails: [{ value: payload.email }],
                    displayName: payload.name,
                    photos: [{ value: payload.picture }]
                };

                verified = true;
                break;
            } catch (error) {
                lastError = error;
                console.log(`❌ Failed with client ID ${clientId}: ${error.message}`);
                continue;
            }
        }

        if (!verified) {
            console.error('🚫 All client ID verifications failed');
            console.error('Last error:', lastError?.message);

            return res.status(400).json({
                success: false,
                message: 'Invalid Google ID token',
                debug: process.env.NODE_ENV === 'development' ? {
                    error: lastError?.message,
                    triedClientIds: clientIds,
                    receivedPlatform: platform
                } : undefined
            });
        }

        try {
            const result = await authService.googleAuth(profile);

            console.log(`🎉 Google auth successful for: ${profile.emails[0].value}`);

            res.json({
                success: true,
                message: 'Google authentication successful',
                data: {
                    user: result.user,
                    accessToken: result.tokens.accessToken,
                    refreshToken: result.tokens.refreshToken,
                    tokenType: 'Bearer',
                    expiresIn: result.tokens.expiresIn
                }
            });

        } catch (error) {
            logger.error('Google mobile auth error:', error);
            res.status(500).json({
                success: false,
                message: 'Authentication failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    /**
    * Setup password for OAuth users
    */
    setupPassword = asyncHandler(async (req, res) => {
        const { email, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        const user = await authService.setupPassword(email, newPassword);

        const tokens = jwtService.generateTokens({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        res.json({
            success: true,
            message: 'Password setup completed successfully. You are now logged in.',
            data: {
                user: user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                tokenType: 'Bearer',
                expiresIn: tokens.expiresIn
            }
        });

        res.json({
            success: true,
            message: 'Password setup completed successfully',
            data: { user }
        });
    });

    /**
     * Google OAuth callback
     */
    googleCallback = asyncHandler(async (req, res) => {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: 'Google authentication failed'
            });
        }

        const result = await authService.googleAuth(req.user);

        // mobile -> return JSON
        if (req.query.mobile === 'true') {
            return res.json({
                success: true,
                message: 'Google authentication successful',
                data: {
                    user: result.user,
                    accessToken: result.tokens.accessToken,
                    refreshToken: result.tokens.refreshToken,
                    tokenType: 'Bearer',
                    expiresIn: result.tokens.expiresIn
                }
            });
        }

        // web -> redirect with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const redirectUrl = `${frontendUrl}/auth/callback?success=true&token=${result.tokens.accessToken}&refresh=${result.tokens.refreshToken}`;

        res.redirect(redirectUrl);
    });

    /**
     * Request password reset
     */
    requestPasswordReset = asyncHandler(async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        await authService.requestPasswordReset(email);

        res.json({
            success: true,
            message: 'If email exists, password reset link has been sent'
        });
    });

    /**
     * Verify email
     */
    verifyEmail = asyncHandler(async (req, res) => {
        const { token } = req.params;
        await authService.verifyEmail(token);

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    });

    /**
     * Refresh access token
     */
    refreshToken = asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const result = await authService.refreshToken(refreshToken);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                expiresIn: result.expiresIn
            }
        });
    });

    /**
     * Get current user profile
     */
    getProfile = asyncHandler(async (req, res) => {
        const user = req.user;

        const fullUserData = await prisma.users.findUnique({
            where: { user_id: user.user_id },
            select: {
                user_id: true,
                email: true,
                username: true,
                full_name: true,
                role: true,
                phone: true,
                whatsapp_number: true,
                is_approved: true,
                is_guest: true,
                avatar: true,
                email_verified: true,
                last_login: true,
                created_at: true,
                updated_at: true
            }
        });

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user: fullUserData }
        });
    });

    /**
    * Update user profile
    */
    updateProfile = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        let updateData = {};
        let avatarUrl = null;

        if (req.file) {
            try {
                const processedPath = await fileService.processImage(req.file.path, {
                    width: 400,
                    height: 400,
                    quality: 85,
                    format: 'jpeg'
                });

                const result = await fileService.moveFile(processedPath, 'avatars');
                avatarUrl = result.url;
            } catch (error) {
                if (req.file) {
                    await fileService.deleteFile(req.file.path);
                }
                throw new AppError('Failed to process avatar', 500);
            }
        }

        // Only allow specific fields to be updated 
        const allowedFields = ['full_name', 'phone', 'whatsapp_number'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (avatarUrl) {
            updateData.avatar = avatarUrl;
        } else if (req.body.avatar !== undefined) {
            updateData.avatar = req.body.avatar;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        try {
            const currentUser = await prisma.users.findUnique({
                where: { user_id: userId },
                select: { avatar: true }
            });

            if (avatarUrl && currentUser.avatar && currentUser.avatar.startsWith('/uploads/')) {
                await fileService.deleteFile(`.${currentUser.avatar}`);
            }

            const updatedUser = await prisma.users.update({
                where: { user_id: userId },
                data: {
                    ...updateData,
                    updated_at: new Date()
                },
                select: {
                    user_id: true,
                    email: true,
                    username: true,
                    full_name: true,
                    role: true,
                    phone: true,
                    whatsapp_number: true,
                    is_approved: true,
                    is_guest: true,
                    avatar: true,
                    email_verified: true,
                    updated_at: true
                }
            });

            if (updatedUser.avatar && !updatedUser.avatar.startsWith('http')) {
                updatedUser.avatar_url = fileService.generateFileUrl(updatedUser.avatar);
            } else {
                updatedUser.avatar_url = updatedUser.avatar;
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: updatedUser,
                    ...(req.file && {
                        uploaded_file: {
                            original_name: req.file.originalname,
                            size: req.file.size,
                            url: avatarUrl
                        }
                    })
                }
            });

        } catch (error) {
            if (req.file) {
                await fileService.deleteFile(req.file.path);
            }
            throw error;
        }
    });

    /**
     * Change password
     */
    changePassword = asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.user_id;

        await authService.changePassword(userId, currentPassword, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    });

    /**
     * Logout user
     */
    logout = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;

        await authService.logout(userId);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });

    /**
     * Check authentication status
     */
    checkAuth = asyncHandler(async (req, res) => {
        const user = req.user;

        res.json({
            success: true,
            message: 'User is authenticated',
            data: {
                user,
                isAuthenticated: true
            }
        });
    });

    /**
     * Verify email
     */
    verifyEmail = asyncHandler(async (req, res) => {
        const { token } = req.params;
        await authService.verifyEmail(token);

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    });

    /**
     * Request password reset
     */
    requestPasswordReset = asyncHandler(async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        await authService.requestPasswordReset(email);

        res.json({
            success: true,
            message: 'If email exists, password reset link has been sent'
        });
    });

    /**
     * Google OAuth failure handler
     */
    googleAuthFailure = asyncHandler(async (req, res) => {
        if (req.query.mobile === 'true') {
            return res.status(400).json({
                success: false,
                message: 'Google authentication failed'
            });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
    });

    /**
     * Get user dashboard statistics
     */
    getDashboardStats = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const userRole = req.user.role;

        let stats = {};

        if (userRole === 'PENGELOLA') {
            const [
                totalKost,
                approvedKost,
                totalKamar,
                occupiedKamar,
                totalReservasi,
                pendingReservasi
            ] = await Promise.all([
                prisma.kost.count({
                    where: { pengelola_id: userId }
                }),
                prisma.kost.count({
                    where: { pengelola_id: userId, is_approved: true }
                }),
                prisma.kamar.count({
                    where: {
                        kost: { pengelola_id: userId }
                    }
                }),
                prisma.kamar.count({
                    where: {
                        kost: { pengelola_id: userId },
                        status: 'TERISI'
                    }
                }),
                prisma.reservasi.count({
                    where: {
                        kamar: {
                            kost: { pengelola_id: userId }
                        }
                    }
                }),
                prisma.reservasi.count({
                    where: {
                        kamar: {
                            kost: { pengelola_id: userId }
                        },
                        status: 'WAITING_VALIDATION'
                    }
                })
            ]);

            stats = {
                kost: {
                    total: totalKost,
                    approved: approvedKost,
                    pending: totalKost - approvedKost
                },
                kamar: {
                    total: totalKamar,
                    occupied: occupiedKamar,
                    available: totalKamar - occupiedKamar
                },
                reservasi: {
                    total: totalReservasi,
                    pending: pendingReservasi
                }
            };
        } else if (userRole === 'PENGHUNI') {
            const [
                totalReservasi,
                activeReservasi,
                totalPesananCatering,
                totalPesananLaundry
            ] = await Promise.all([
                prisma.reservasi.count({
                    where: { user_id: userId }
                }),
                prisma.reservasi.count({
                    where: { user_id: userId, status: 'APPROVED' }
                }),
                prisma.pesananCatering.count({
                    where: { user_id: userId }
                }),
                prisma.pesananLaundry.count({
                    where: { user_id: userId }
                })
            ]);

            stats = {
                reservasi: {
                    total: totalReservasi,
                    active: activeReservasi
                },
                pesanan: {
                    catering: totalPesananCatering,
                    laundry: totalPesananLaundry
                }
            };
        } else if (userRole === 'ADMIN') {
            const [
                totalUsers,
                pendingUsers,
                totalKost,
                pendingKost,
                totalReservasi,
                pendingReservasi
            ] = await Promise.all([
                prisma.users.count(),
                prisma.users.count({ where: { is_approved: false } }),
                prisma.kost.count(),
                prisma.kost.count({ where: { is_approved: false } }),
                prisma.reservasi.count(),
                prisma.reservasi.count({ where: { status: 'WAITING_VALIDATION' } })
            ]);

            stats = {
                users: {
                    total: totalUsers,
                    pending: pendingUsers
                },
                kost: {
                    total: totalKost,
                    pending: pendingKost
                },
                reservasi: {
                    total: totalReservasi,
                    pending: pendingReservasi
                }
            };
        }

        res.json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: { stats }
        });
    });

    /**
     * Get user activity history
     */
    getActivity = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const limit = parseInt(req.query.limit) || 10;
        const activities = [];

        const reservations = await prisma.reservasi.findMany({
            where: { user_id: userId },
            select: {
                reservasi_id: true,
                status: true,
                created_at: true,
                kamar: {
                    select: {
                        nomor_kamar: true,
                        kost: {
                            select: {
                                nama_kost: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 5
        });

        reservations.forEach(r => {
            activities.push({
                type: 'reservation',
                action: `Reservation ${r.status.toLowerCase()}`,
                description: `Room ${r.kamar.nomor_kamar} at ${r.kamar.kost.nama_kost}`,
                timestamp: r.created_at,
                status: r.status
            });
        });

        const cateringOrders = await prisma.pesananCatering.findMany({
            where: { user_id: userId },
            select: {
                pesanan_id: true,
                status: true,
                jumlah_porsi: true,
                created_at: true,
                menu: {
                    select: {
                        nama_menu: true,
                        catering: {
                            select: {
                                nama_catering: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 3
        });

        cateringOrders.forEach(o => {
            activities.push({
                type: 'catering',
                action: 'Food order',
                description: `${o.jumlah_porsi}x ${o.menu.nama_menu} from ${o.menu.catering.nama_catering}`,
                timestamp: o.created_at,
                status: o.status
            });
        });

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            message: 'User activity retrieved successfully',
            data: { activities: activities.slice(0, limit) }
        });
    });



    /**
     * Get user profile with full avatar URL
     */
    getProfile = asyncHandler(async (req, res) => {
        const user = req.user;

        const fullUserData = await prisma.users.findUnique({
            where: { user_id: user.user_id },
            select: {
                user_id: true,
                email: true,
                username: true,
                full_name: true,
                role: true,
                phone: true,
                whatsapp_number: true,
                is_approved: true,
                is_guest: true,
                avatar: true,
                email_verified: true,
                last_login: true,
                created_at: true,
                updated_at: true
            }
        });

        if (fullUserData.avatar && !fullUserData.avatar.startsWith('http')) {
            fullUserData.avatar_url = fileService.generateFileUrl(fullUserData.avatar);
        } else {
            fullUserData.avatar_url = fullUserData.avatar;
        }

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user: fullUserData }
        });
    });
}

module.exports = new AuthController();