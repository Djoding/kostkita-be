const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const fileService = require("./fileService");

class DetailOrderLaundryService {
    /**
     * Get laundry order detail by order ID
     */
    async getLaundryOrderDetail(orderId, userId, userRole) {
        const whereClause = {
            pesanan_id: orderId,
        };

        if (userRole === "PENGHUNI") {
            whereClause.user_id = userId;
        } else if (userRole === "PENGELOLA") {
            whereClause.laundry = {
                kost: {
                    pengelola_id: userId,
                },
            };
        }

        const order = await prisma.pesananLaundry.findFirst({
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
                laundry: {
                    include: {
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
                detail_pesanan_laundry: {
                    include: {
                        layanan: {
                            select: {
                                layanan_id: true,
                                nama_layanan: true,
                                satuan: true,
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

        if (!order) {
            throw new AppError("Order not found or you don't have access", 404);
        }

        const formattedOrder = {
            ...order,
            laundry: {
                ...order.laundry,
                qris_image_url: order.laundry.qris_image
                    ? fileService.generateFileUrl(order.laundry.qris_image)
                    : null,
            },
            detail_pesanan_laundry: order.detail_pesanan_laundry.map((detail) => ({
                ...detail,
                subtotal_estimasi: detail.jumlah_satuan * detail.harga_per_satuan,
                subtotal_final: order.berat_actual
                    ? (detail.jumlah_satuan * detail.harga_per_satuan * (order.berat_actual / order.detail_pesanan_laundry.reduce((sum, d) => sum + d.jumlah_satuan, 0)))
                    : null,
            })),
            pembayaran: order.pembayaran
                ? {
                    ...order.pembayaran,
                    bukti_bayar_url: order.pembayaran.bukti_bayar
                        ? fileService.generateFileUrl(order.pembayaran.bukti_bayar)
                        : null,
                }
                : null,
            service_count: order.detail_pesanan_laundry.length,
            total_satuan: order.detail_pesanan_laundry.reduce(
                (sum, detail) => sum + detail.jumlah_satuan,
                0
            ),
            estimated_completion: order.estimasi_selesai
                ? order.estimasi_selesai.toISOString().split("T")[0]
                : null,
        };

        return formattedOrder;
    }

    /**
     * Update laundry order status with additional details 
     */
    async updateLaundryOrderStatus(orderId, updateData, pengelolaId) {
        const { status, berat_actual, total_final, estimasi_selesai, notes } = updateData;

        const order = await prisma.pesananLaundry.findFirst({
            where: {
                pesanan_id: orderId,
                laundry: {
                    kost: {
                        pengelola_id: pengelolaId,
                    },
                },
            },
        });

        if (!order) {
            throw new AppError("Order not found or you are not authorized", 404);
        }

        const validStatuses = ["PENDING", "DITERIMA", "PROSES", "SELESAI", "DIAMBIL", "DIBATALKAN"];
        if (!validStatuses.includes(status)) {
            throw new AppError("Invalid status", 400);
        }

        const updateObj = {
            status,
            updated_at: new Date(),
        };

        if (status === "DITERIMA" || status === "PROSES") {
            if (berat_actual !== undefined) updateObj.berat_actual = berat_actual;
            if (total_final !== undefined) updateObj.total_final = total_final;
            if (estimasi_selesai) updateObj.estimasi_selesai = new Date(estimasi_selesai);
        }

        if (notes) {
            updateObj.catatan_pengelola = notes;
        }

        if (status === "DITERIMA") {
            updateObj.accepted_at = new Date();
        } else if (status === "SELESAI") {
            updateObj.completed_at = new Date();
        } else if (status === "DIAMBIL") {
            updateObj.picked_up_at = new Date();
        }

        const updatedOrder = await prisma.pesananLaundry.update({
            where: { pesanan_id: orderId },
            data: updateObj,
        });

        return updatedOrder;
    }

    /**
     * Cancel laundry order
     */
    async cancelLaundryOrder(orderId, userId, reason = null) {
        const order = await prisma.pesananLaundry.findFirst({
            where: {
                pesanan_id: orderId,
                user_id: userId,
            },
        });

        if (!order) {
            throw new AppError("Order not found", 404);
        }

        if (!["PENDING", "DITERIMA"].includes(order.status)) {
            throw new AppError("Order cannot be cancelled at this stage", 400);
        }

        const updatedOrder = await prisma.pesananLaundry.update({
            where: { pesanan_id: orderId },
            data: {
                status: "DIBATALKAN",
                catatan: reason ? `${order.catatan || ""}\nDibatalkan: ${reason}` : order.catatan,
                updated_at: new Date(),
            },
        });

        return updatedOrder;
    }

    /**
     * Mark laundry order as picked up 
     */
    async markAsPickedUp(orderId, pengelolaId) {
        const order = await prisma.pesananLaundry.findFirst({
            where: {
                pesanan_id: orderId,
                laundry: {
                    kost: {
                        pengelola_id: pengelolaId,
                    },
                },
            },
        });

        if (!order) {
            throw new AppError("Order not found or you are not authorized", 404);
        }

        if (order.status !== "SELESAI") {
            throw new AppError("Order must be completed before marking as picked up", 400);
        }

        const updatedOrder = await prisma.pesananLaundry.update({
            where: { pesanan_id: orderId },
            data: {
                status: "DIAMBIL",
                picked_up_at: new Date(),
                updated_at: new Date(),
            },
        });

        return updatedOrder;
    }
}

module.exports = new DetailOrderLaundryService();