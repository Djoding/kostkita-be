const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class HistoryService {
    /**
     * Get user's reservation history
     */
    async getReservationHistory(userId, pagination = {}) {
        const { page = 1, limit = 10, offset = 0 } = pagination;

        const [reservations, total] = await Promise.all([
            prisma.reservasi.findMany({
                where: { user_id: userId },
                include: {
                    kost: {
                        select: {
                            nama_kost: true,
                            alamat: true,
                            foto_kost: true
                        }
                    },
                    validator: {
                        select: {
                            full_name: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip: offset,
                take: limit
            }),
            prisma.reservasi.count({
                where: { user_id: userId }
            })
        ]);

        return {
            reservations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get user's catering order history
     */
    async getCateringHistory(userId, pagination = {}) {
        const { page = 1, limit = 10, offset = 0 } = pagination;

        const [orders, total] = await Promise.all([
            prisma.pesananCatering.findMany({
                where: { user_id: userId },
                include: {
                    detail_pesanan: {
                        include: {
                            menu: {
                                select: {
                                    nama_menu: true,
                                    kategori: true,
                                    foto_menu: true,
                                    catering: {
                                        select: {
                                            nama_catering: true,
                                            alamat: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    pembayaran: {
                        select: {
                            metode: true,
                            status: true,
                            verified_at: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip: offset,
                take: limit
            }),
            prisma.pesananCatering.count({
                where: { user_id: userId }
            })
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get user's laundry order history
     */
    async getLaundryHistory(userId, pagination = {}) {
        const { page = 1, limit = 10, offset = 0 } = pagination;

        const [orders, total] = await Promise.all([
            prisma.pesananLaundry.findMany({
                where: { user_id: userId },
                include: {
                    laundry: {
                        select: {
                            nama_laundry: true,
                            alamat: true
                        }
                    },
                    detail_pesanan_laundry: {
                        include: {
                            layanan: {
                                select: {
                                    nama_layanan: true,
                                    satuan: true
                                }
                            }
                        }
                    },
                    pembayaran: {
                        select: {
                            metode: true,
                            status: true,
                            verified_at: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip: offset,
                take: limit
            }),
            prisma.pesananLaundry.count({
                where: { user_id: userId }
            })
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get complete user history (all activities)
     */
    async getCompleteHistory(userId, pagination = {}) {
        const { page = 1, limit = 20, offset = 0 } = pagination;

        // Get all histories in parallel
        const [reservations, cateringOrders, laundryOrders] = await Promise.all([
            prisma.reservasi.findMany({
                where: { user_id: userId },
                select: {
                    reservasi_id: true,
                    status: true,
                    total_harga: true,
                    tanggal_check_in: true,
                    tanggal_keluar: true,
                    created_at: true,
                    kost: {
                        select: {
                            nama_kost: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.pesananCatering.findMany({
                where: { user_id: userId },
                select: {
                    pesanan_id: true,
                    status: true,
                    total_harga: true,
                    created_at: true,
                    detail_pesanan: {
                        select: {
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
                        take: 1
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.pesananLaundry.findMany({
                where: { user_id: userId },
                select: {
                    pesanan_id: true,
                    status: true,
                    total_estimasi: true,
                    total_final: true,
                    created_at: true,
                    laundry: {
                        select: {
                            nama_laundry: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            })
        ]);

        // Combine and format all activities
        const activities = [];

        // Add reservations
        reservations.forEach(item => {
            activities.push({
                id: item.reservasi_id,
                type: 'reservation',
                title: `Reservasi ${item.kost.nama_kost}`,
                status: item.status,
                amount: item.total_harga,
                date: item.created_at,
                details: {
                    check_in: item.tanggal_check_in,
                    check_out: item.tanggal_keluar,
                    kost_name: item.kost.nama_kost
                }
            });
        });

        // Add catering orders
        cateringOrders.forEach(item => {
            const firstMenu = item.detail_pesanan[0]?.menu;
            activities.push({
                id: item.pesanan_id,
                type: 'catering',
                title: `Order ${firstMenu?.catering.nama_catering || 'Catering'}`,
                status: item.status,
                amount: item.total_harga,
                date: item.created_at,
                details: {
                    menu: firstMenu?.nama_menu,
                    catering_name: firstMenu?.catering.nama_catering
                }
            });
        });

        // Add laundry orders
        laundryOrders.forEach(item => {
            activities.push({
                id: item.pesanan_id,
                type: 'laundry',
                title: `Laundry ${item.laundry.nama_laundry}`,
                status: item.status,
                amount: item.total_final || item.total_estimasi,
                date: item.created_at,
                details: {
                    laundry_name: item.laundry.nama_laundry
                }
            });
        });

        // Sort by date and paginate
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const paginatedActivities = activities.slice(offset, offset + limit);

        return {
            activities: paginatedActivities,
            pagination: {
                page,
                limit,
                total: activities.length,
                totalPages: Math.ceil(activities.length / limit)
            }
        };
    }

    /**
     * Get history statistics for dashboard
     */
    async getHistoryStats(userId) {
        const [
            totalReservations,
            totalCateringOrders,
            totalLaundryOrders,
            totalSpent,
            recentActivity
        ] = await Promise.all([
            prisma.reservasi.count({
                where: { user_id: userId }
            }),
            prisma.pesananCatering.count({
                where: { user_id: userId }
            }),
            prisma.pesananLaundry.count({
                where: { user_id: userId }
            }),
            prisma.$queryRaw`
                SELECT 
                    COALESCE(SUM(r.total_harga), 0) as reservasi_total,
                    COALESCE(SUM(pc.total_harga), 0) as catering_total,
                    COALESCE(SUM(COALESCE(pl.total_final, pl.total_estimasi)), 0) as laundry_total
                FROM users u
                LEFT JOIN reservasi r ON u.user_id = r.user_id
                LEFT JOIN pesanan_catering pc ON u.user_id = pc.user_id
                LEFT JOIN pesanan_laundry pl ON u.user_id = pl.user_id
                WHERE u.user_id = ${userId}::uuid
            `,
            prisma.reservasi.findFirst({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
                select: {
                    created_at: true,
                    status: true,
                    kost: {
                        select: {
                            nama_kost: true
                        }
                    }
                }
            })
        ]);

        const totalSpentAmount = totalSpent[0] ?
            Number(totalSpent[0].reservasi_total) +
            Number(totalSpent[0].catering_total) +
            Number(totalSpent[0].laundry_total) : 0;

        return {
            totalReservations,
            totalCateringOrders,
            totalLaundryOrders,
            totalSpent: totalSpentAmount,
            recentActivity
        };
    }
}

module.exports = new HistoryService();