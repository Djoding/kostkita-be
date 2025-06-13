const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class kostService{
    
    /**
     * Get All Kost
     */
    async getAllKost(){
        const where = {};
        if (nama_kost) where.nama_kost = nama_kost;

        const kost = await prisma.kost.findMany({
            where: {
                ...where,
                is_approved: true
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
    async createKost(data){
        const { nama_kost, alamat, gmaps_link, deskripsi, total_kamar,
            daya_listrik, sumber_air, wifi_speed,
            kapasitas_parkir_motor, kapasitas_parkir_mobil,
            kapasitas_parkir_sepeda, biaya_tambahan, jam_survey,
            foto_kost, qris_image, rekening_info
        } = data;

        const existingKost = await prisma.kost.findFirst({
            where:{
                nama_kost,
                alamat
            }
        });

        if (existingKost){
            throw new AppError('Kost already exists', 409);
        }

        const kost = await prisma.kost.create({
            data: {
                nama_kost,
                alamat,
                gmaps_link,
                deskripsi,
                total_kamar,
                daya_listrik,
                sumber_air,
                wifi_speed,
                kapasitas_parkir_motor,
                kapasitas_parkir_mobil,
                kapasitas_parkir_sepeda,
                biaya_tambahan,
                jam_survey,
                foto_kost,
                qris_image,
                rekening_info
            }
        });

        logger.info(`New kost created: ${nama_kost}`);
        return kost;
    }

    /**
     * Update Kost
     */

    async updateKost(kostId, data){
        const kost = await prisma.kost.findUnique({
            where: {kost_id: kostId}
        });

        if (!kost){
            throw new AppError('Kost not found', 404);
        }

        const updateKost = await prisma.kost.update({
            where: {kost_id: kostId},
            data
        });

        return updateKost;
    }

    /**
     * Delete Kost
     */

    async deleteKost(kostId){
        const kost = await prisma.kost.findUnique({
            where: {kost_id: kostId}
        });

        if (!kost){
            throw new AppError('Kost not found', 404);
        }

        await prisma.kost.delete({
            where: {kost_id: kostId},
            data: {is_approved: false}
        });

        logger.info(`Kost deleted: ${kostId}`);
        return true;

    }
}