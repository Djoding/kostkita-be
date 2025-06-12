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

        // hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // create user
        const user = await prisma.users.create({
            data: {
                email,
                username,
                password: hashedPassword,
                full_name,
                role,
                phone,
                whatsapp_number,
                is_approved: role === 'PENGHUNI' // Auto-approve regular users
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

        // generate tokens
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

        // check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AppError('Invalid email or password', 401);
        }

        // update last login
        await prisma.users.update({
            where: { user_id: user.user_id },
            data: { last_login: new Date() }
        });

        // generate tokens
        const tokens = jwtService.generateTokens({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        // remove password from response
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
            // update last login
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
            // check if user exists with same email
            const existingUser = await prisma.users.findUnique({
                where: { email: profile.emails[0].value }
            });

            if (existingUser) {
                // link Google account
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
                // create new user
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

        // generate tokens
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

        // skip  password and checking for google users
        if (!user.google_id) {
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                throw new AppError('Current password is incorrect', 400);
            }
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // update password
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
        // email verification
        throw new AppError('Email verification not implemented yet', 501);
    }

    /**
     * Request password reset (placeholder for future implementation)
     */
    async requestPasswordReset(email) {
        // password reset
        throw new AppError('Password reset not implemented yet', 501);
    }
}

module.exports = new AuthService();