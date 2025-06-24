const prisma = require("../config/database");
const { Prisma } = require("@prisma/client");
const fileService = require("./fileService");
const { AppError } = require("../middleware/errorHandler");
const path = require("path");

const getCateringHistoryForTenant = async (userId, kostId) => {
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

    const orders = await prisma.pesananCatering.findMany({
      where: {
        user_id: userId,
        ...(kostId && {
          detail_pesanan: {
            some: {
              menu: { catering: { kost_id: kostId } },
            },
          },
        }),
      },
      include: {
        detail_pesanan: {
          select: {
            detail_id: true,
            jumlah_porsi: true,
            harga_satuan: true,
            menu: {
              select: {
                menu_id: true,
                nama_menu: true,
                kategori: true,
                foto_menu: true,
                catering: {
                  select: {
                    catering_id: true,
                    nama_catering: true,
                    kost: {
                      select: { kost_id: true, nama_kost: true },
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
      detail_pesanan: order.detail_pesanan.map((detail) => ({
        ...detail,
        menu: {
          ...detail.menu,
          foto_menu_url: detail.menu.foto_menu
            ? fileService.generateFileUrl(detail.menu.foto_menu)
            : null,
        },
      })),
    }));
  } catch (error) {
    console.error("Error in getCateringHistoryForTenant:", error);
    throw error;
  }
};

const createCateringOrderWithPayment = async (userId, orderDetails) => {
  const {
    items,
    catatan,
    metode_bayar,
    reservasi_id,
    catering_id,
    bukti_bayar,
  } = orderDetails;
  try {
    const menuIds = items.map((item) => item.menu_id);
    const menus = await prisma.cateringMenu.findMany({
      where: {
        menu_id: { in: menuIds },
        catering_id: catering_id,
      },
      select: {
        menu_id: true,
        harga: true,
      },
    });

    if (menus.length !== menuIds.length) {
      throw new AppError(
        "Satu atau lebih menu tidak ditemukan atau bukan bagian dari catering yang dipilih.",
        400
      );
    }

    let totalHargaDecimal = new Prisma.Decimal(0);
    const detailOrderData = [];

    for (const item of items) {
      const menu = menus.find((m) => m.menu_id === item.menu_id);
      if (!menu) {
        throw new AppError(
          `Menu dengan ID ${item.menu_id} tidak ditemukan.`,
          400
        );
      }

      const quantity = new Prisma.Decimal(item.jumlah_porsi);
      const hargaPerPorsi = new Prisma.Decimal(menu.harga);

      const subtotal = quantity.mul(hargaPerPorsi);
      totalHargaDecimal = totalHargaDecimal.plus(subtotal);

      detailOrderData.push({
        menu_id: item.menu_id,
        quantity: item.jumlah_porsi,
        subtotal: subtotal,
      });
    }

    const newOrder = await prisma.pesananCatering.create({
      data: {
        user_id: userId,
        reservasi_id,
        catatan,
        total_harga: totalHargaDecimal,
        status: "PENDING",
      },
    });

    const finalDetailOrderData = detailOrderData.map((detail) => ({
      ...detail,
      pesanan_id: newOrder.pesanan_id,
    }));

    await prisma.detailPesananCatering.createMany({
      data: finalDetailOrderData,
    });

    const newDetailOrders = await prisma.detailPesananCatering.findMany({
      where: {
        pesanan_id: newOrder.pesanan_id,
      },
      include: {
        menu: true,
      },
    });

    const newPayment = await prisma.pembayaranCatering.create({
      data: {
        pesanan_id: newOrder.pesanan_id,
        metode_bayar,
        bukti_bayar: bukti_bayar,
      },
    });

    return { newOrder, newDetailOrders, newPayment };
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError(
          `Gagal membuat pesanan catering dan pembayaran: ${error.message}`,
          500
        );
  }
};

module.exports = {
  getCateringHistoryForTenant,
  createCateringOrderWithPayment,
};
