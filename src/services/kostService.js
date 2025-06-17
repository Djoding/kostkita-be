const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class KostService {

    /**
     * Get All Kost
     */
    async getAllKost(nama_kost) { 
        const where = {};
        if (nama_kost) {
            where.nama_kost = {
                contains: nama_kost,
                mode: 'insensitive'
            };
        }

        const kost = await prisma.kost.findMany({
            where: {
                ...where,
                is_approved: true
            },
            include: {
                pengelola: {
                    select: {
                        full_name: true,
                        phone: true,
                        whatsapp_number: true
                    }
                },
                kost_fasilitas: {
                    include: {
                        fasilitas: true
                    }
                }
            },
            orderBy: [
                { nama_kost: 'asc' },
                { alamat: 'asc' }
            ]
        });
        return kost;
    }

    /**
     * Create Kost
     */
    async createKost(data) {
        const {
            pengelola_id, nama_kost, alamat, gmaps_link, deskripsi, total_kamar,
            daya_listrik, sumber_air, wifi_speed,
            kapasitas_parkir_motor, kapasitas_parkir_mobil,
            kapasitas_parkir_sepeda, biaya_tambahan, jam_survey,
            foto_kost, qris_image, rekening_info
        } = data;

        const pengelola = await prisma.users.findFirst({
            where: {
                user_id: pengelola_id,
                role: 'PENGELOLA'
            }
        });

        if (!pengelola) {
            throw new AppError('Pengelola not found or invalid role', 404);
        }

        const existingKost = await prisma.kost.findFirst({
            where: {
                nama_kost,
                alamat
            }
        });

        if (existingKost) {
            throw new AppError('Kost already exists at this location', 409);
        }

        const kost = await prisma.kost.create({
            data: {
                pengelola_id,
                nama_kost,
                alamat,
                gmaps_link,
                deskripsi,
                total_kamar,
                daya_listrik,
                sumber_air,
                wifi_speed,
                kapasitas_parkir_motor: kapasitas_parkir_motor || 0,
                kapasitas_parkir_mobil: kapasitas_parkir_mobil || 0,
                kapasitas_parkir_sepeda: kapasitas_parkir_sepeda || 0,
                biaya_tambahan,
                jam_survey,
                foto_kost: foto_kost || [],
                qris_image,
                rekening_info,
                is_approved: false 
            },
            include: {
                pengelola: {
                    select: {
                        full_name: true,
                        phone: true
                    }
                }
            }
        });

        logger.info(`New kost created: ${nama_kost} by ${pengelola.full_name}`);
        return kost;
    }

    /**
     * Update Kost
     */
    async updateKost(kostId, data) {
        const kost = await prisma.kost.findUnique({
            where: { kost_id: kostId }
        });

        if (!kost) {
            throw new AppError('Kost not found', 404);
        }

        const updatedKost = await prisma.kost.update({
            where: { kost_id: kostId },
            data,
            include: {
                pengelola: {
                    select: {
                        full_name: true,
                        phone: true
                    }
                }
            }
        });

        logger.info(`Kost updated: ${kostId}`);
        return updatedKost;
    }

    /**
     * Delete Kost 
     */
    async deleteKost(kostId) {
        const kost = await prisma.kost.findUnique({
            where: { kost_id: kostId }
        });

        if (!kost) {
            throw new AppError('Kost not found', 404);
        }

        await prisma.kost.update({
            where: { kost_id: kostId },
            data: { is_approved: false }
        });

        logger.info(`Kost soft deleted: ${kostId}`);
        return true;
    }

    /**
     * Get Kost by ID
     */
    async getKostById(kostId) {
        const kost = await prisma.kost.findUnique({
            where: { kost_id: kostId },
            include: {
                pengelola: {
                    select: {
                        full_name: true,
                        phone: true,
                        whatsapp_number: true
                    }
                },
                kost_fasilitas: {
                    include: {
                        fasilitas: true
                    }
                },
                kamar: {
                    include: {
                        tipe: true
                    }
                }
            }
        });

        if (!kost) {
            throw new AppError('Kost not found', 404);
        }

        return kost;
    }
}

module.exports = new KostService();