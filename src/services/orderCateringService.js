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

const createCateringOrderWithPayment = async (userId, orderDetails, buktiBayarFile) => {
  const { items, catatan, metode_bayar, reservasi_id, catering_id } = orderDetails;

  const newOrder = await prisma.cateringOrder.create({
    data: {
      user_id: userId,
      reservasi_id,
      catering_id,
      catatan,
    },
  });

  const newDetailOrders = await prisma.cateringOrderDetail.createMany({
    data: items.map((item) => ({
      catering_order_id: newOrder.id,
      menu_id: item.menu_id,
      quantity: item.quantity,
    })),
  });

  const newPayment = await prisma.cateringPayment.create({
    data: {
      catering_order_id: newOrder.id,
      metode_bayar,
      bukti_bayar: buktiBayarFile.path, // ⬅️ langsung URL final
    },
  });

  return { newOrder, newDetailOrders, newPayment };
};

module.exports = {
  getCateringHistoryForTenant,
  createCateringOrderWithPayment,
};
