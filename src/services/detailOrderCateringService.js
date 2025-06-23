const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const fileService = require("./fileService");

class DetailOrderCateringService {
    /**
     * Get catering order detail by order ID
     */
    async getCateringOrderDetail(orderId, userId, userRole) {
        const whereClause = { pesanan_id: orderId };

        if (userRole === "PENGHUNI") {
            whereClause.user_id = userId;
        } else if (userRole === "PENGELOLA") {
            whereClause.detail_pesanan = {
                some: {
                    menu: {
                        catering: {
                            kost: {
                                pengelola_id: userId,
                            },
                        },
                    },
                },
            };
        }

        const order = await prisma.pesananCatering.findFirst({
            where: whereClause,
            include: {
                user: {
                    select: {
                        user_id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                        whatsapp_number: true,
                    },
                },
                detail_pesanan: {
                    include: {
                        menu: {
                            include: {
                                catering: {
                                    select: {
                                        catering_id: true,
                                        nama_catering: true,
                                        alamat: true,
                                        whatsapp_number: true,
                                        qris_image: true,
                                        rekening_info: true,
                                        kost: {
                                            select: {
                                                kost_id: true,
                                                nama_kost: true,
                                                alamat: true,
                                                pengelola: {
                                                    select: {
                                                        full_name: true,
                                                        phone: true,
                                                        whatsapp_number: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                pembayaran: {
                    select: {
                        pembayaran_id: true,
                        jumlah: true,
                        metode: true,
                        bukti_bayar: true,
                        status: true,
                        verified_at: true,
                        created_at: true,
                    },
                },
            },
        });

        if (!order) throw new AppError("Order not found or you don't have access", 404);

        return {
            ...order,
            detail_pesanan: order.detail_pesanan.map((detail) => ({
                ...detail,
                subtotal: detail.jumlah_porsi * detail.harga_satuan,
            })),
            item_count: order.detail_pesanan.length,
            total_items: order.detail_pesanan.reduce(
                (sum, detail) => sum + detail.jumlah_porsi,
                0
            ),
        };
    }

    /**
     * Update catering order status 
     */
    async updateCateringOrderStatus(orderId, status, pengelolaId, notes = null) {
        const order = await prisma.pesananCatering.findFirst({
            where: {
                pesanan_id: orderId,
                detail_pesanan: {
                    some: {
                        menu: {
                            catering: {
                                kost: {
                                    pengelola_id: pengelolaId,
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new AppError("Order not found or you are not authorized", 404);
        }

        const validStatuses = ["PENDING", "PROSES", "DITERIMA", "SELESAI", "DIBATALKAN"];
        if (!validStatuses.includes(status)) {
            throw new AppError("Invalid status", 400);
        }

        const updateData = {
            status,
            updated_at: new Date(),
        };

        if (notes) {
            updateData.catatan_pengelola = notes;
        }

        if (status === "DITERIMA") {
            updateData.accepted_at = new Date();
        } else if (status === "SELESAI") {
            updateData.completed_at = new Date();
        }

        const updatedOrder = await prisma.pesananCatering.update({
            where: { pesanan_id: orderId },
            data: updateData,
        });

        return updatedOrder;
    }

    /**
     * Cancel catering order 
     */
    async cancelCateringOrder(orderId, userId, reason = null) {
        const order = await prisma.pesananCatering.findFirst({
            where: {
                pesanan_id: orderId,
                user_id: userId,
            },
        });

        if (!order) {
            throw new AppError("Order not found", 404);
        }

        if (order.status !== "PENDING") {
            throw new AppError("Only pending orders can be cancelled", 400);
        }

        const updatedOrder = await prisma.pesananCatering.update({
            where: { pesanan_id: orderId },
            data: {
                status: "DIBATALKAN",
                catatan: reason ? `${order.catatan || ""}\nDibatalkan: ${reason}` : order.catatan,
                updated_at: new Date(),
            },
        });

        return updatedOrder;
    }
}

module.exports = new DetailOrderCateringService();