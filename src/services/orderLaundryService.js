const prisma = require("../config/database");
const { Prisma } = require("@prisma/client");
const fileService = require("./fileService");
const { AppError } = require("../middleware/errorHandler");
const path = require("path");

const getLaundryHistoryForTenant = async (userId, kostId) => {
  try {
    if (kostId) {
      const active = await prisma.reservasi.findFirst({
        where: { user_id: userId, kost_id: kostId, status: "APPROVED" },
      });
      if (!active) {
        throw new AppError("Penghuni tidak memiliki reservasi aktif di kost ini.", 403);
      }
    } else {
      const active = await prisma.reservasi.findMany({
        where: { user_id: userId, status: "APPROVED" },
        select: { kost_id: true },
      });
      if (active.length === 0) {
        throw new AppError("Penghuni tidak memiliki reservasi aktif di kost manapun.", 404);
      }
    }

    const orders = await prisma.pesananLaundry.findMany({
      where: {
        user_id: userId,
        ...(kostId && {
          laundry: { kost_id: kostId },
        }),
      },
      include: {
        detail_pesanan_laundry: {
          select: {
            detail_id: true,
            jumlah_satuan: true,
            harga_per_satuan: true,
            layanan: {
              select: {
                layanan_id: true,
                nama_layanan: true,
                satuan: true,
              },
            },
          },
        },
        laundry: {
          select: {
            laundry_id: true,
            nama_laundry: true,
            kost: {
              select: {
                kost_id: true,
                nama_kost: true,
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
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return orders.map((order) => ({
      ...order,
      pembayaran: order.pembayaran
        ? {
          ...order.pembayaran,
          bukti_bayar_url: order.pembayaran.bukti_bayar
            ? fileService.generateFileUrl(order.pembayaran.bukti_bayar)
            : null,
        }
        : null,
    }));
  } catch (error) {
    console.error("Error in getLaundryHistoryForTenant:", error);
    throw error;
  }
};

const createLaundryOrderWithPayment = async (
  userId,
  orderDetails,
  buktiBayarFile
) => {
  const { items, catatan, metode_bayar, reservasi_id, laundry_id } = orderDetails;
  let buktiBayarUrl = null;
  let resultFileMove = null;

  try {
    if (!buktiBayarFile) {
      throw new AppError("Bukti pembayaran harus diunggah.", 400);
    }

    const processedFilePath = await fileService.processImage(buktiBayarFile.path, {
      width: 800,
      height: 600,
      quality: 80,
      format: "jpeg",
    });

    resultFileMove = await fileService.moveFile(processedFilePath, "laundry_payment");
    buktiBayarUrl = resultFileMove.url;

    let calculatedTotalEstimasi = new Prisma.Decimal(0);
    const serviceDetailsToCreate = [];
    const uniqueLayananIds = [...new Set(items.map((item) => item.layanan_id))];

    const laundryHargaItems = await prisma.laundryHarga.findMany({
      where: {
        layanan_id: { in: uniqueLayananIds },
        is_available: true,
        laundry: {
          laundry_id: laundry_id,
          is_active: true,
        },
      },
      include: {
        laundry: true,
        layanan: true,
      },
    });

    if (laundryHargaItems.length !== uniqueLayananIds.length) {
      const foundLayananIds = new Set(laundryHargaItems.map((lh) => lh.layanan_id));
      const missing = uniqueLayananIds.filter(id => !foundLayananIds.has(id));
      if (resultFileMove?.filename) {
        await fileService.deleteFile(path.join(fileService.uploadPath, "laundry_payment", resultFileMove.filename));
      }
      throw new AppError(`Layanan laundry tidak valid: ${missing.join(", ")}.`, 404);
    }

    const laundryHargaMap = new Map(laundryHargaItems.map((lh) => [lh.layanan_id, lh]));

    let laundryIdFromItems = null;
    let kostIdForOrder = null;

    for (const item of items) {
      const hargaItem = laundryHargaMap.get(item.layanan_id);
      if (!hargaItem.laundry.is_active) throw new AppError("Laundry tidak aktif", 400);

      laundryIdFromItems = laundryIdFromItems || hargaItem.laundry.laundry_id;
      kostIdForOrder = kostIdForOrder || hargaItem.laundry.kost_id;

      const itemEstimasiHarga = hargaItem.harga_per_satuan.mul(item.jumlah_satuan);
      calculatedTotalEstimasi = calculatedTotalEstimasi.add(itemEstimasiHarga);

      serviceDetailsToCreate.push({
        layanan_id: item.layanan_id,
        jumlah_satuan: item.jumlah_satuan,
        harga_per_satuan: hargaItem.harga_per_satuan,
      });
    }

    const activeReservation = await prisma.reservasi.findFirst({
      where: {
        user_id: userId,
        kost_id: kostIdForOrder,
        status: "APPROVED",
        status_penghunian: "AKTIF",
      },
    });

    if (!activeReservation) {
      if (resultFileMove?.filename) {
        await fileService.deleteFile(path.join(fileService.uploadPath, "laundry_payment", resultFileMove.filename));
      }
      throw new AppError("Tidak ada reservasi aktif di kost ini.", 403);
    }

    if (reservasi_id && activeReservation.reservasi_id !== reservasi_id) {
      throw new AppError("ID Reservasi tidak cocok dengan reservasi aktif.", 400);
    }

    if (laundry_id && laundryIdFromItems !== laundry_id) {
      throw new AppError("ID Laundry tidak sesuai dengan layanan yang dipesan.", 400);
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.pesananLaundry.create({
        data: {
          user_id: userId,
          reservasi_id: activeReservation.reservasi_id,
          laundry_id: laundryIdFromItems,
          total_estimasi: calculatedTotalEstimasi,
          status: "PENDING",
          catatan: catatan,
          tanggal_antar: new Date(),
          estimasi_selesai: new Date(Date.now() + 2 * 86400000),
        },
      });

      await tx.detailPesananLaundry.createMany({
        data: serviceDetailsToCreate.map(detail => ({
          ...detail,
          pesanan_id: newOrder.pesanan_id,
        })),
      });

      const newPayment = await tx.pembayaranLaundry.create({
        data: {
          pesanan_id: newOrder.pesanan_id,
          jumlah: calculatedTotalEstimasi,
          metode: metode_bayar,
          bukti_bayar: buktiBayarUrl,
          status: "PENDING",
        },
      });

      return {
        newOrder,
        newDetailOrders: serviceDetailsToCreate,
        newPayment,
      };
    });

    return transactionResult;
  } catch (error) {
    if (resultFileMove?.filename) {
      await fileService.deleteFile(path.join(fileService.uploadPath, "laundry_payment", resultFileMove.filename));
    }
    console.error("Error in createLaundryOrderWithPayment:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Terjadi kesalahan saat membuat pesanan laundry.", 500);
  }
};

module.exports = {
  getLaundryHistoryForTenant,
  createLaundryOrderWithPayment,
};
