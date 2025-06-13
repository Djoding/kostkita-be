const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class UserService {
    /**
     * Get all users with pagination and filters
     */
    async getAllUsers(filters = {}, pagination = {}) {
        const { page = 1, limit = 10, offset = 0 } = pagination;
        const { role, is_approved, search } = filters;

        const where = {};

        if (role) where.role = role;
        if (is_approved !== undefined) where.is_approved = is_approved;
        if (search) {
            where.OR = [
                { full_name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.users.findMany({
                where,
                skip: offset,
                take: limit,
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
                    created_at: true
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.users.count({ where })
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
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

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, updateData) {
        const allowedFields = ['full_name', 'phone', 'whatsapp_number', 'avatar'];
        const filteredData = {};

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        });

        if (Object.keys(filteredData).length === 0) {
            throw new AppError('No valid fields to update', 400);
        }

        const user = await prisma.users.update({
            where: { user_id: userId },
            data: filteredData,
            select: {
                user_id: true,
                email: true,
                username: true,
                full_name: true,
                role: true,
                phone: true,
                whatsapp_number: true,
                is_approved: true,
                avatar: true
            }
        });

        logger.info(`User profile updated: ${userId}`);
        return user;
    }

    /**
     * Update user by admin
     */
    async updateUser(userId, updateData) {
        const allowedFields = ['full_name', 'email', 'role', 'phone', 'whatsapp_number', 'is_approved'];
        const filteredData = {};

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        });

        if (Object.keys(filteredData).length === 0) {
            throw new AppError('No valid fields to update', 400);
        }

        if (filteredData.email) {
            const existingUser = await prisma.users.findFirst({
                where: {
                    email: filteredData.email,
                    user_id: { not: userId }
                }
            });

            if (existingUser) {
                throw new AppError('Email already exists', 409);
            }
        }

        const user = await prisma.users.update({
            where: { user_id: userId },
            data: filteredData,
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
                avatar: true
            }
        });

        logger.info(`User updated by admin: ${userId}`);
        return user;
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        const user = await prisma.users.findUnique({
            where: { user_id: userId }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        await prisma.users.delete({
            where: { user_id: userId }
        });

        logger.info(`User deleted: ${userId}`);
        return true;
    }

    /**
     * Approve/Reject user
     */
    async approveUser(userId, isApproved) {
        const user = await prisma.users.update({
            where: { user_id: userId },
            data: { is_approved: isApproved },
            select: {
                user_id: true,
                email: true,
                username: true,
                full_name: true,
                role: true,
                is_approved: true
            }
        });

        logger.info(`User ${isApproved ? 'approved' : 'rejected'}: ${userId}`);
        return user;
    }

    /**
     * Get user statistics
     */
    async getUserStats() {
        const stats = await prisma.$transaction(async (tx) => {
            const [
                totalUsers,
                totalPengelola,
                totalPenghuni,
                totalAdmin,
                pendingApproval,
                approvedUsers,
                googleUsers,
                regularUsers
            ] = await Promise.all([
                tx.users.count(),
                tx.users.count({ where: { role: 'PENGELOLA' } }),
                tx.users.count({ where: { role: 'PENGHUNI' } }),
                tx.users.count({ where: { role: 'ADMIN' } }),
                tx.users.count({ where: { is_approved: false } }),
                tx.users.count({ where: { is_approved: true } }),
                tx.users.count({ where: { google_id: { not: null } } }),
                tx.users.count({ where: { google_id: null } })
            ]);

            return {
                totalUsers,
                byRole: {
                    admin: totalAdmin,
                    pengelola: totalPengelola,
                    penghuni: totalPenghuni
                },
                byStatus: {
                    approved: approvedUsers,
                    pending: pendingApproval
                },
                byAuthMethod: {
                    google: googleUsers,
                    regular: regularUsers
                }
            };
        });

        return stats;
    }

    /**
     * Search users
     */
    async searchUsers(query, pagination = {}) {
        const { page = 1, limit = 10, offset = 0 } = pagination;

        const where = {
            OR: [
                { full_name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { username: { contains: query, mode: 'insensitive' } }
            ]
        };

        const [users, total] = await Promise.all([
            prisma.users.findMany({
                where,
                skip: offset,
                take: limit,
                select: {
                    user_id: true,
                    email: true,
                    username: true,
                    full_name: true,
                    role: true,
                    avatar: true,
                    is_approved: true
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.users.count({ where })
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = new UserService();