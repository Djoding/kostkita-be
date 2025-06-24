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

  const newOrder = await prisma.laundryOrder.create({
    data: {
      user_id: userId,
      reservasi_id,
      laundry_id,
      catatan,
    },
  });

  const newDetailOrders = await prisma.laundryOrderDetail.createMany({
    data: items.map((item) => ({
      laundry_order_id: newOrder.id,
      item_name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  });

  const newPayment = await prisma.laundryPayment.create({
    data: {
      laundry_order_id: newOrder.id,
      metode_bayar,
      bukti_bayar: bukti_bayar,
    },
  });

  return { newOrder, newDetailOrders, newPayment };
};

module.exports = {
  getLaundryHistoryForTenant,
  createLaundryOrderWithPayment,
};
