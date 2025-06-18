const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const { Prisma } = require('@prisma/client');


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
            foto_kost, qris_image, rekening_info,
            harga_bulanan, deposit, harga_final,
            tipe_id,
            fasilitas_ids = [],
            peraturan_data = []
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

        const tipeKamar = await prisma.masterTipeKamar.findFirst({
            where: {
                tipe_id,
                is_active: true
            }
        });

        if (!tipeKamar) {
            throw new AppError('Tipe kamar not found or inactive', 404);
        }

        if (fasilitas_ids.length > 0) {
            const fasilitasCount = await prisma.masterFasilitas.count({
                where: {
                    fasilitas_id: { in: fasilitas_ids },
                    is_active: true
                }
            });

            if (fasilitasCount !== fasilitas_ids.length) {
                throw new AppError('Some fasilitas not found or inactive', 400);
            }
        }

        if (peraturan_data.length > 0) {
            const peraturanIds = peraturan_data.map(p => p.peraturan_id);
            const peraturanCount = await prisma.masterPeraturan.count({
                where: {
                    peraturan_id: { in: peraturanIds },
                    is_active: true
                }
            });

            if (peraturanCount !== peraturanIds.length) {
                throw new AppError('Some peraturan not found or inactive', 400);
            }
        }

        const existingKost = await prisma.kost.findFirst({
            where: {
                nama_kost,
                alamat,
                pengelola_id
            }
        });

        if (existingKost) {
            throw new AppError('Kost with same name and address already exists', 409);
        }

        const result = await prisma.$transaction(async (tx) => {
            const kost = await tx.kost.create({
                data: {
                    pengelola_id,
                    tipe_id,
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
                    biaya_tambahan: biaya_tambahan ? new Prisma.Decimal(biaya_tambahan) : null,
                    jam_survey,
                    foto_kost: foto_kost || [],
                    qris_image,
                    rekening_info,
                    harga_bulanan: new Prisma.Decimal(harga_bulanan),
                    deposit: deposit ? new Prisma.Decimal(deposit) : null,
                    harga_final: new Prisma.Decimal(harga_final),
                    is_approved: false
                }
            });

            if (fasilitas_ids.length > 0) {
                const kostFasilitasData = fasilitas_ids.map(fasilitas_id => ({
                    kost_id: kost.kost_id,
                    fasilitas_id: fasilitas_id
                }));

                await tx.kostFasilitas.createMany({
                    data: kostFasilitasData
                });
            }

            if (peraturan_data.length > 0) {
                const kostPeraturanData = peraturan_data.map(item => ({
                    kost_id: kost.kost_id,
                    peraturan_id: item.peraturan_id,
                    keterangan_tambahan: item.keterangan_tambahan || null
                }));

                await tx.kostPeraturan.createMany({
                    data: kostPeraturanData
                });
            }

            return await tx.kost.findUnique({
                where: { kost_id: kost.kost_id },
                include: {
                    pengelola: {
                        select: {
                            full_name: true,
                            phone: true,
                            whatsapp_number: true
                        }
                    },
                    tipe: {
                        select: {
                            nama_tipe: true,
                            ukuran: true,
                            kapasitas: true
                        }
                    },
                    kost_fasilitas: {
                        include: {
                            fasilitas: {
                                select: {
                                    fasilitas_id: true,
                                    nama_fasilitas: true,
                                    kategori: true,
                                    icon: true
                                }
                            }
                        }
                    },
                    kost_peraturan: {
                        include: {
                            peraturan: {
                                select: {
                                    peraturan_id: true,
                                    nama_peraturan: true,
                                    kategori: true,
                                    icon: true
                                }
                            }
                        }
                    }
                }
            });
        });

        logger.info(`New kost created: ${nama_kost} by ${pengelola.full_name}`);
        return result;
    }


    /**
     * Update Kost
     */
    async updateKost(kostId, data) {
        const {
            nama_kost, alamat, gmaps_link, deskripsi, total_kamar,
            daya_listrik, sumber_air, wifi_speed,
            kapasitas_parkir_motor, kapasitas_parkir_mobil,
            kapasitas_parkir_sepeda, biaya_tambahan, jam_survey,
            foto_kost, qris_image, rekening_info,
            harga_bulanan, deposit, harga_final,
            tipe_id,
            fasilitas_ids,
            peraturan_data
        } = data;

        const existingKost = await prisma.kost.findUnique({
            where: { kost_id: kostId }
        });

        if (!existingKost) {
            throw new AppError('Kost not found', 404);
        }

        if (tipe_id) {
            const tipeKamar = await prisma.masterTipeKamar.findFirst({
                where: {
                    tipe_id,
                    is_active: true
                }
            });

            if (!tipeKamar) {
                throw new AppError('Tipe kamar not found or inactive', 404);
            }
        }
        const result = await prisma.$transaction(async (tx) => {
            const updateData = {};

            if (nama_kost !== undefined) updateData.nama_kost = nama_kost;
            if (alamat !== undefined) updateData.alamat = alamat;
            if (gmaps_link !== undefined) updateData.gmaps_link = gmaps_link;
            if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
            if (total_kamar !== undefined) updateData.total_kamar = total_kamar;
            if (daya_listrik !== undefined) updateData.daya_listrik = daya_listrik;
            if (sumber_air !== undefined) updateData.sumber_air = sumber_air;
            if (wifi_speed !== undefined) updateData.wifi_speed = wifi_speed;
            if (kapasitas_parkir_motor !== undefined) updateData.kapasitas_parkir_motor = kapasitas_parkir_motor;
            if (kapasitas_parkir_mobil !== undefined) updateData.kapasitas_parkir_mobil = kapasitas_parkir_mobil;
            if (kapasitas_parkir_sepeda !== undefined) updateData.kapasitas_parkir_sepeda = kapasitas_parkir_sepeda;
            if (biaya_tambahan !== undefined) updateData.biaya_tambahan = biaya_tambahan ? new Prisma.Decimal(biaya_tambahan) : null;
            if (jam_survey !== undefined) updateData.jam_survey = jam_survey;
            if (foto_kost !== undefined) updateData.foto_kost = foto_kost;
            if (qris_image !== undefined) updateData.qris_image = qris_image;
            if (rekening_info !== undefined) updateData.rekening_info = rekening_info;
            if (harga_bulanan !== undefined) updateData.harga_bulanan = new Prisma.Decimal(harga_bulanan);
            if (deposit !== undefined) updateData.deposit = deposit ? new Prisma.Decimal(deposit) : null;
            if (harga_final !== undefined) updateData.harga_final = new Prisma.Decimal(harga_final);
            if (tipe_id !== undefined) updateData.tipe_id = tipe_id;

            const updatedKost = await tx.kost.update({
                where: { kost_id: kostId },
                data: updateData
            });

            if (fasilitas_ids !== undefined) {
                await tx.kostFasilitas.deleteMany({
                    where: { kost_id: kostId }
                });

                if (fasilitas_ids.length > 0) {
                    const kostFasilitasData = fasilitas_ids.map(fasilitas_id => ({
                        kost_id: kostId,
                        fasilitas_id: fasilitas_id
                    }));

                    await tx.kostFasilitas.createMany({
                        data: kostFasilitasData
                    });
                }
            }

            if (peraturan_data !== undefined) {
                await tx.kostPeraturan.deleteMany({
                    where: { kost_id: kostId }
                });

                if (peraturan_data.length > 0) {
                    const kostPeraturanData = peraturan_data.map(item => ({
                        kost_id: kostId,
                        peraturan_id: item.peraturan_id,
                        keterangan_tambahan: item.keterangan_tambahan || null
                    }));

                    await tx.kostPeraturan.createMany({
                        data: kostPeraturanData
                    });
                }
            }

            return await tx.kost.findUnique({
                where: { kost_id: kostId },
                include: {
                    pengelola: {
                        select: {
                            full_name: true,
                            phone: true,
                            whatsapp_number: true
                        }
                    },
                    tipe: {
                        select: {
                            nama_tipe: true,
                            ukuran: true,
                            kapasitas: true
                        }
                    },
                    kost_fasilitas: {
                        include: {
                            fasilitas: {
                                select: {
                                    fasilitas_id: true,
                                    nama_fasilitas: true,
                                    kategori: true,
                                    icon: true
                                }
                            }
                        }
                    },
                    kost_peraturan: {
                        include: {
                            peraturan: {
                                select: {
                                    peraturan_id: true,
                                    nama_peraturan: true,
                                    kategori: true,
                                    icon: true
                                }
                            }
                        }
                    }
                }
            });
        });

        logger.info(`Kost updated: ${kostId}`);
        return result;
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
                tipe: {
                    select: {
                        nama_tipe: true,
                        ukuran: true,
                        kapasitas: true
                    }
                }
            }
        });

        if (!kost) {
            throw new AppError('Kost not found', 404);
        }

        return kost;
    }

    /**
     * Get Kost by Owner (Pengelola)
     */

    async getKostByOwner(user_id, query) {
        const { nama_kost } = query; // ambil dari query string jika ada
        const where = {
            pengelola_id: user_id,
        };

        if (nama_kost) {
            where.nama_kost = {
                contains: nama_kost,
                mode: 'insensitive'
            };
        }

        const kost = await prisma.kost.findMany({
            where,
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
}

module.exports = new KostService();