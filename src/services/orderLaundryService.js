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
        throw new AppError(
          "Penghuni tidak memiliki reservasi aktif di kost ini.",
          403
        );
      }
    } else {
      const active = await prisma.reservasi.findMany({
        where: { user_id: userId, status: "APPROVED" },
        select: { kost_id: true },
      });
      if (active.length === 0) {
        throw new AppError(
          "Penghuni tidak memiliki reservasi aktif di kost manapun.",
          404
        );
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

const createLaundryOrderWithPayment = async (userId, orderDetails) => {
  const {
    items,
    catatan,
    metode_bayar,
    reservasi_id,
    laundry_id,
    bukti_bayar,
  } = orderDetails;

  try {
    const layananIds = items.map((item) => item.layanan_id);
    const layananDetails = await prisma.masterLayananLaundry.findMany({
      where: {
        layanan_id: { in: layananIds },
        laundry_id: laundry_id,
      },
      select: {
        layanan_id: true,
        harga_per_satuan: true,
      },
    });

    if (layananDetails.length !== layananIds.length) {
      throw new AppError(
        "Satu atau lebih layanan laundry tidak ditemukan atau bukan bagian dari laundry yang dipilih.",
        400
      );
    }

    let totalEstimasiDecimal = new Prisma.Decimal(0);
    const detailOrderRawData = [];

    for (const item of items) {
      const layanan = layananDetails.find(
        (ld) => ld.layanan_id === item.layanan_id
      );
      if (!layanan) {
        throw new AppError(
          `Layanan dengan ID ${item.layanan_id} tidak ditemukan.`,
          400
        );
      }

      const jumlahSatuanValue = new Prisma.Decimal(item.jumlah_satuan);
      const hargaPerSatuanValue = new Prisma.Decimal(layanan.harga_per_satuan);

      const subtotal = jumlahSatuanValue.mul(hargaPerSatuanValue);
      totalEstimasiDecimal = totalEstimasiDecimal.plus(subtotal);

      detailOrderRawData.push({
        layanan_id: item.layanan_id,
        jumlah_satuan: item.jumlah_satuan,
        harga_per_satuan: hargaPerSatuanValue,
      });
    }
    const today = new Date();
    const tanggalAntar = new Date(today);

    const estimasiSelesai = new Date(today);
    estimasiSelesai.setDate(today.getDate() + 2);

    const newOrder = await prisma.pesananLaundry.create({
      data: {
        user_id: userId,
        laundry_id: laundry_id,
        reservasi_id: reservasi_id,
        total_estimasi: totalEstimasiDecimal,
        tanggal_antar: tanggalAntar, 
        estimasi_selesai: estimasiSelesai,
        status: "PENDING",
        catatan: catatan,
      },
    });

    const finalDetailOrderData = detailOrderRawData.map((detail) => ({
      ...detail,
      pesanan_id: newOrder.pesanan_id,
    }));

    await prisma.detailPesananLaundry.createMany({
      data: finalDetailOrderData,
    });

    const newDetailOrders = await prisma.detailPesananLaundry.findMany({
      where: {
        pesanan_id: newOrder.pesanan_id,
      },
      include: {
        layanan: true,
      },
    });

    const newPayment = await prisma.pembayaranLaundry.create({
      data: {
        pesanan_id: newOrder.pesanan_id,
        jumlah: totalEstimasiDecimal,
        metode: metode_bayar,
        bukti_bayar: bukti_bayar,
        status: "PENDING",
      },
    });

    return { newOrder, newDetailOrders, newPayment };
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError(`Gagal membuat pesanan laundry: ${error.message}`, 500);
  }
};

module.exports = {
  getLaundryHistoryForTenant,
  createLaundryOrderWithPayment,
};
