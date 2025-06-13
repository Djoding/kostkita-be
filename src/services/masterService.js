const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class MasterService {
    /**
     * Get all fasilitas
     */
    async getAllFasilitas(kategori = null) {
        const where = {};
        if (kategori) where.kategori = kategori;

        const fasilitas = await prisma.masterFasilitas.findMany({
            where: {
                ...where,
                is_active: true
            },
            orderBy: [
                { kategori: 'asc' },
                { nama_fasilitas: 'asc' }
            ]
        });

        return fasilitas;
    }

    /**
     * Get all tipe kamar
     */
    async getAllTipeKamar() {
        const tipeKamar = await prisma.masterTipeKamar.findMany({
            where: { is_active: true },
            orderBy: { nama_tipe: 'asc' }
        });

        return tipeKamar;
    }

    /**
     * Get all peraturan
     */
    async getAllPeraturan(kategori = null) {
        const where = {};
        if (kategori) where.kategori = kategori;

        const peraturan = await prisma.masterPeraturan.findMany({
            where: {
                ...where,
                is_active: true
            },
            orderBy: [
                { kategori: 'asc' },
                { nama_peraturan: 'asc' }
            ]
        });

        return peraturan;
    }

    /**
     * Get all layanan laundry
     */
    async getAllLayananLaundry() {
        const layanan = await prisma.masterLayananLaundry.findMany({
            where: { is_active: true },
            orderBy: { nama_layanan: 'asc' }
        });

        return layanan;
    }

    /**
     * Create fasilitas
     */
    async createFasilitas(data) {
        const { nama_fasilitas, kategori, icon } = data;

        const existingFasilitas = await prisma.masterFasilitas.findFirst({
            where: {
                nama_fasilitas,
                kategori
            }
        });

        if (existingFasilitas) {
            throw new AppError('Fasilitas with same name and category already exists', 409);
        }

        const fasilitas = await prisma.masterFasilitas.create({
            data: {
                nama_fasilitas,
                kategori,
                icon
            }
        });

        logger.info(`New fasilitas created: ${nama_fasilitas}`);
        return fasilitas;
    }

    /**
     * Create tipe kamar
     */
    async createTipeKamar(data) {
        const { nama_tipe, ukuran, kapasitas, deskripsi } = data;

        const existingTipe = await prisma.masterTipeKamar.findFirst({
            where: { nama_tipe }
        });

        if (existingTipe) {
            throw new AppError('Tipe kamar already exists', 409);
        }

        const tipeKamar = await prisma.masterTipeKamar.create({
            data: {
                nama_tipe,
                ukuran,
                kapasitas,
                deskripsi
            }
        });

        logger.info(`New tipe kamar created: ${nama_tipe}`);
        return tipeKamar;
    }

    /**
     * Create peraturan
     */
    async createPeraturan(data) {
        const { nama_peraturan, kategori, icon } = data;

        const existingPeraturan = await prisma.masterPeraturan.findFirst({
            where: {
                nama_peraturan,
                kategori
            }
        });

        if (existingPeraturan) {
            throw new AppError('Peraturan with same name and category already exists', 409);
        }

        const peraturan = await prisma.masterPeraturan.create({
            data: {
                nama_peraturan,
                kategori,
                icon
            }
        });

        logger.info(`New peraturan created: ${nama_peraturan}`);
        return peraturan;
    }

    /**
     * Create layanan laundry
     */
    async createLayananLaundry(data) {
        const { nama_layanan, satuan } = data;

        const existingLayanan = await prisma.masterLayananLaundry.findFirst({
            where: { nama_layanan }
        });

        if (existingLayanan) {
            throw new AppError('Layanan laundry already exists', 409);
        }

        const layanan = await prisma.masterLayananLaundry.create({
            data: {
                nama_layanan,
                satuan
            }
        });

        logger.info(`New layanan laundry created: ${nama_layanan}`);
        return layanan;
    }

    /**
     * Update fasilitas
     */
    async updateFasilitas(fasilitasId, data) {
        const fasilitas = await prisma.masterFasilitas.findUnique({
            where: { fasilitas_id: fasilitasId }
        });

        if (!fasilitas) {
            throw new AppError('Fasilitas not found', 404);
        }

        const updatedFasilitas = await prisma.masterFasilitas.update({
            where: { fasilitas_id: fasilitasId },
            data
        });

        return updatedFasilitas;
    }

    /**
     * Delete fasilitas (soft delete)
     */
    async deleteFasilitas(fasilitasId) {
        const fasilitas = await prisma.masterFasilitas.findUnique({
            where: { fasilitas_id: fasilitasId }
        });

        if (!fasilitas) {
            throw new AppError('Fasilitas not found', 404);
        }

        await prisma.masterFasilitas.update({
            where: { fasilitas_id: fasilitasId },
            data: { is_active: false }
        });

        logger.info(`Fasilitas deactivated: ${fasilitasId}`);
        return true;
    }

    /**
     * Get master data summary
     */
    async getMasterDataSummary() {
        const [
            totalFasilitas,
            totalTipeKamar,
            totalPeraturan,
            totalLayananLaundry,
            fasilitasKategori,
            peraturanKategori
        ] = await Promise.all([
            prisma.masterFasilitas.count({ where: { is_active: true } }),
            prisma.masterTipeKamar.count({ where: { is_active: true } }),
            prisma.masterPeraturan.count({ where: { is_active: true } }),
            prisma.masterLayananLaundry.count({ where: { is_active: true } }),
            prisma.masterFasilitas.groupBy({
                by: ['kategori'],
                _count: { kategori: true },
                where: { is_active: true }
            }),
            prisma.masterPeraturan.groupBy({
                by: ['kategori'],
                _count: { kategori: true },
                where: { is_active: true }
            })
        ]);

        return {
            totalFasilitas,
            totalTipeKamar,
            totalPeraturan,
            totalLayananLaundry,
            fasilitasKategori: fasilitasKategori.reduce((acc, item) => {
                acc[item.kategori] = item._count.kategori;
                return acc;
            }, {}),
            peraturanKategori: peraturanKategori.reduce((acc, item) => {
                acc[item.kategori] = item._count.kategori;
                return acc;
            }, {})
        };
    }
}

module.exports = new MasterService();