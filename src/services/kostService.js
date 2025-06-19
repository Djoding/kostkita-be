const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const fileService = require("./fileService");
const logger = require("../config/logger");
const { ReservasiStatus, PenghuniStatus, Prisma } = require("@prisma/client");

class KostService {
  async getAllKost(nama_kost) {
    const where = {};
    if (nama_kost) {
      where.nama_kost = {
        contains: nama_kost,
        mode: "insensitive",
      };
    }

    const kost = await prisma.kost.findMany({
      where: {
        ...where,
        is_approved: true,
      },
      include: {
        pengelola: {
          select: {
            full_name: true,
            phone: true,
            whatsapp_number: true,
          },
        },
        kost_fasilitas: {
          include: {
            fasilitas: true,
          },
        },
      },
      orderBy: [{ nama_kost: "asc" }, { alamat: "asc" }],
    });
    return kost;
  }

  async createKost(data) {
    const {
      pengelola_id,
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
      rekening_info,
      harga_bulanan,
      deposit,
      harga_final,
      tipe_id,
      fasilitas_ids = [],
      peraturan_data = [],
    } = data;

    const pengelola = await prisma.users.findFirst({
      where: {
        user_id: pengelola_id,
        role: "PENGELOLA",
      },
    });

    if (!pengelola)
      throw new AppError("Pengelola not found or invalid role", 404);

    const tipeKamar = await prisma.masterTipeKamar.findFirst({
      where: {
        tipe_id,
        is_active: true,
      },
    });
    if (!tipeKamar) throw new AppError("Tipe kamar not found or inactive", 404);

    if (fasilitas_ids.length > 0) {
      const fasilitasCount = await prisma.masterFasilitas.count({
        where: {
          fasilitas_id: { in: fasilitas_ids },
          is_active: true,
        },
      });
      if (fasilitasCount !== fasilitas_ids.length) {
        throw new AppError("Some fasilitas not found or inactive", 400);
      }
    }

    if (peraturan_data.length > 0) {
      const peraturanIds = peraturan_data.map((p) => p.peraturan_id);
      const peraturanCount = await prisma.masterPeraturan.count({
        where: {
          peraturan_id: { in: peraturanIds },
          is_active: true,
        },
      });
      if (peraturanCount !== peraturanIds.length) {
        throw new AppError("Some peraturan not found or inactive", 400);
      }
    }

    const existingKost = await prisma.kost.findFirst({
      where: {
        nama_kost,
        alamat,
        pengelola_id,
      },
    });

    if (existingKost) {
      throw new AppError("Kost with same name and address already exists", 409);
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
          biaya_tambahan: biaya_tambahan
            ? new Prisma.Decimal(biaya_tambahan)
            : null,
          jam_survey,
          foto_kost: foto_kost || [],
          qris_image,
          rekening_info,
          harga_bulanan: new Prisma.Decimal(harga_bulanan),
          deposit: deposit ? new Prisma.Decimal(deposit) : null,
          harga_final: new Prisma.Decimal(harga_final),
          is_approved: false,
        },
      });

      if (fasilitas_ids.length > 0) {
        await tx.kostFasilitas.createMany({
          data: fasilitas_ids.map((id) => ({
            kost_id: kost.kost_id,
            fasilitas_id: id,
          })),
        });
      }

      if (peraturan_data.length > 0) {
        await tx.kostPeraturan.createMany({
          data: peraturan_data.map((p) => ({
            kost_id: kost.kost_id,
            peraturan_id: p.peraturan_id,
            keterangan_tambahan: p.keterangan_tambahan || null,
          })),
        });
      }

      return await tx.kost.findUnique({
        where: { kost_id: kost.kost_id },
        include: {
          pengelola: {
            select: { full_name: true, phone: true, whatsapp_number: true },
          },
          tipe: { select: { nama_tipe: true, ukuran: true, kapasitas: true } },
          kost_fasilitas: {
            include: {
              fasilitas: true,
            },
          },
          kost_peraturan: {
            include: {
              peraturan: true,
            },
          },
        },
      });
    });

    logger.info(`New kost created: ${nama_kost} by ${pengelola.full_name}`);
    return result;
  }

  async updateKost(kostId, data) {
    const kost = await prisma.kost.findUnique({ where: { kost_id: kostId } });
    if (!kost) throw new AppError("Kost not found", 404);

    const {
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
      rekening_info,
      harga_bulanan,
      deposit,
      harga_final,
      tipe_id,
      fasilitas_ids,
      peraturan_data,
    } = data;

    const result = await prisma.$transaction(async (tx) => {
      const updateData = {
        ...(nama_kost && { nama_kost }),
        ...(alamat && { alamat }),
        ...(gmaps_link && { gmaps_link }),
        ...(deskripsi && { deskripsi }),
        ...(total_kamar !== undefined && { total_kamar }),
        ...(daya_listrik && { daya_listrik }),
        ...(sumber_air && { sumber_air }),
        ...(wifi_speed && { wifi_speed }),
        ...(kapasitas_parkir_motor !== undefined && { kapasitas_parkir_motor }),
        ...(kapasitas_parkir_mobil !== undefined && { kapasitas_parkir_mobil }),
        ...(kapasitas_parkir_sepeda !== undefined && {
          kapasitas_parkir_sepeda,
        }),
        ...(biaya_tambahan !== undefined && {
          biaya_tambahan: biaya_tambahan
            ? new Prisma.Decimal(biaya_tambahan)
            : null,
        }),
        ...(jam_survey && { jam_survey }),
        ...(foto_kost && { foto_kost }),
        ...(qris_image && { qris_image }),
        ...(rekening_info && { rekening_info }),
        ...(harga_bulanan && {
          harga_bulanan: new Prisma.Decimal(harga_bulanan),
        }),
        ...(deposit !== undefined && {
          deposit: deposit ? new Prisma.Decimal(deposit) : null,
        }),
        ...(harga_final && { harga_final: new Prisma.Decimal(harga_final) }),
        ...(tipe_id && { tipe_id }),
      };

      await tx.kost.update({
        where: { kost_id: kostId },
        data: updateData,
      });

      if (fasilitas_ids !== undefined) {
        await tx.kostFasilitas.deleteMany({ where: { kost_id: kostId } });
        if (fasilitas_ids.length > 0) {
          await tx.kostFasilitas.createMany({
            data: fasilitas_ids.map((id) => ({
              kost_id: kostId,
              fasilitas_id: id,
            })),
          });
        }
      }

      if (peraturan_data !== undefined) {
        await tx.kostPeraturan.deleteMany({ where: { kost_id: kostId } });
        if (peraturan_data.length > 0) {
          await tx.kostPeraturan.createMany({
            data: peraturan_data.map((p) => ({
              kost_id: kostId,
              peraturan_id: p.peraturan_id,
              keterangan_tambahan: p.keterangan_tambahan || null,
            })),
          });
        }
      }

      return await tx.kost.findUnique({
        where: { kost_id: kostId },
        include: {
          pengelola: {
            select: { full_name: true, phone: true, whatsapp_number: true },
          },
          tipe: { select: { nama_tipe: true, ukuran: true, kapasitas: true } },
          kost_fasilitas: { include: { fasilitas: true } },
          kost_peraturan: { include: { peraturan: true } },
        },
      });
    });

    logger.info(`Kost updated: ${kostId}`);
    return result;
  }

  async deleteKost(kostId) {
    const kost = await prisma.kost.findUnique({ where: { kost_id: kostId } });
    if (!kost) throw new AppError("Kost not found", 404);

    await prisma.kost.update({
      where: { kost_id: kostId },
      data: { is_approved: false },
    });

    logger.info(`Kost soft deleted: ${kostId}`);
    return true;
  }

  async getKostById(kostId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.reservasi.updateMany({
      where: {
        status: ReservasiStatus.APPROVED,
        tanggal_check_in: { lte: today },
        status_penghunian: { not: PenghuniStatus.AKTIF },
        OR: [{ tanggal_keluar: null }, { tanggal_keluar: { gt: today } }],
      },
      data: {
        status_penghunian: PenghuniStatus.AKTIF,
        updated_at: new Date(),
      },
    });

    await prisma.reservasi.updateMany({
      where: {
        status: ReservasiStatus.APPROVED,
        status_penghunian: PenghuniStatus.AKTIF,
        tanggal_keluar: { lte: today },
      },
      data: {
        status_penghunian: PenghuniStatus.KELUAR,
        updated_at: new Date(),
      },
    });

    const kost = await prisma.kost.findUnique({
      where: { kost_id: kostId },
      include: {
        pengelola: {
          select: { full_name: true, phone: true, whatsapp_number: true },
        },
        kost_fasilitas: {
          include: { fasilitas: true },
        },
        tipe: {
          select: { nama_tipe: true, ukuran: true, kapasitas: true },
        },
        reservasi: {
          where: {
            status: ReservasiStatus.APPROVED,
            OR: [
              { status_penghunian: null },
              { status_penghunian: PenghuniStatus.AKTIF },
            ],
            AND: [
              {
                OR: [
                  { tanggal_keluar: null },
                  { tanggal_keluar: { gt: today } },
                ],
              },
            ],
          },
          select: { reservasi_id: true },
        },
        kost_peraturan: { include: { peraturan: true } },
      },
    });

    if (!kost) throw new AppError("Kost not found", 404);

    const totalOccupiedRooms = kost.reservasi.length;
    const availableRooms = kost.total_kamar - totalOccupiedRooms;

    const { reservasi, ...kostWithoutReservations } = kost;
    const formattedFotoKost =
      kost.foto_kost?.map((url) => fileService.generateFileUrl(url)) || [];

    return {
      ...kostWithoutReservations,
      foto_kost: formattedFotoKost,
      total_occupied_rooms: totalOccupiedRooms,
      available_rooms: availableRooms,
    };
  }

  async getKostByOwner(user_id, query) {
    const { nama_kost } = query;
    const where = {
      pengelola_id: user_id,
    };

    if (nama_kost) {
      where.nama_kost = {
        contains: nama_kost,
        mode: "insensitive",
      };
    }

    return prisma.kost.findMany({
      where,
      include: {
        pengelola: {
          select: { full_name: true, phone: true, whatsapp_number: true },
        },
        kost_fasilitas: {
          include: { fasilitas: true },
        },
      },
      orderBy: [{ nama_kost: "asc" }, { alamat: "asc" }],
    });
  }
}

module.exports = new KostService();
