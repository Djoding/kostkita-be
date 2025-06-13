const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const jwtService = require('../config/jwt');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class AuthService {
    /**
     * Register new user
     */
    async register(userData) {
        const { email, username, password, full_name, role = 'PENGHUNI', phone, whatsapp_number } = userData;

        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                throw new AppError('Email already registered', 409);
            }
            if (existingUser.username === username) {
                throw new AppError('Username already taken', 409);
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.users.create({
            data: {
                email,
                username,
                password: hashedPassword,
                full_name,
                role,
                phone,
                whatsapp_number,
                is_approved: role === 'PENGHUNI'
            },
            select: {
                user_id: true,
                email: true,
                username: true,
                full_name: true,
                role: true,
                is_approved: true,
                created_at: true
            }
        });

        const tokens = jwtService.generateTokens({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        logger.info(`New user registered: ${email}`);

        return {
            user,
            ...tokens
        };
    }

    /**
     * Login user
     */
    async login(email, password) {
        const user = await prisma.users.findUnique({
            where: { email },
            select: {
                user_id: true,
                email: true,
                username: true,
                password: true,
                full_name: true,
                role: true,
                is_approved: true,
                avatar: true
            }
        });

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AppError('Invalid email or password', 401);
        }

        await prisma.users.update({
            where: { user_id: user.user_id },
            data: { last_login: new Date() }
        });

        const tokens = jwtService.generateTokens({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        const { password: _, ...userWithoutPassword } = user;

        logger.info(`User logged in: ${email}`);

        return {
            user: userWithoutPassword,
            ...tokens
        };
    }

    /**
     * Google OAuth login/register
     */
    async googleAuth(profile) {
        let user = await prisma.users.findUnique({
            where: { google_id: profile.id }
        });

        if (user) {
            user = await prisma.users.update({
                where: { user_id: user.user_id },
                data: {
                    last_login: new Date(),
                    email_verified: true
                },
                select: {
                    user_id: true,
                    email: true,
                    username: true,
                    full_name: true,
                    role: true,
                    is_approved: true,
                    avatar: true
                }
            });
        } else {
            const existingUser = await prisma.users.findUnique({
                where: { email: profile.emails[0].value }
            });

            if (existingUser) {
                user = await prisma.users.update({
                    where: { user_id: existingUser.user_id },
                    data: {
                        google_id: profile.id,
                        avatar: profile.photos[0]?.value,
                        email_verified: true,
                        last_login: new Date()
                    },
                    select: {
                        user_id: true,
                        email: true,
                        username: true,
                        full_name: true,
                        role: true,
                        is_approved: true,
                        avatar: true
                    }
                });
            } else {
                const username = await this.generateUniqueUsername(profile.emails[0].value.split('@')[0]);

                user = await prisma.users.create({
                    data: {
                        email: profile.emails[0].value,
                        username,
                        full_name: profile.displayName,
                        google_id: profile.id,
                        role: 'PENGHUNI',
                        avatar: profile.photos[0]?.value,
                        email_verified: true,
                        is_approved: true,
                        last_login: new Date()
                    },
                    select: {
                        user_id: true,
                        email: true,
                        username: true,
                        full_name: true,
                        role: true,
                        is_approved: true,
                        avatar: true
                    }
                });

                logger.info(`New Google user registered: ${profile.emails[0].value}`);
            }
        }

        const tokens = jwtService.generateTokens({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        return {
            user,
            ...tokens
        };
    }

    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            select: { password: true, google_id: true }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (!user.google_id) {
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                throw new AppError('Current password is incorrect', 400);
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.users.update({
            where: { user_id: userId },
            data: { password: hashedPassword }
        });

        logger.info(`Password changed for user: ${userId}`);
    }

    /**
     * Generate unique username
     */
    async generateUniqueUsername(baseUsername) {
        let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
        let counter = 1;

        while (await prisma.users.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        return username;
    }

    /**
     * Verify email token (placeholder for future implementation)
     */
    async verifyEmail(token) {
        throw new AppError('Email verification not implemented yet', 501);
    }

    /**
     * Request password reset (placeholder for future implementation)
     */
    async requestPasswordReset(email) {
        throw new AppError('Password reset not implemented yet', 501);
    }
}

module.exports = new AuthService();