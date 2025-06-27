const cateringService = require("../services/orderCateringService");
const fileService = require("../services/fileService");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

module.exports = {
  getCateringHistory: asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.user_id;
    const { kostId } = req.query;

    if (!userIdFromToken) {
      throw new AppError(
        "User ID tidak ditemukan dari token. Pastikan Anda sudah login.",
        401
      );
    }

    const history = await cateringService.getCateringHistoryForTenant(
      userIdFromToken,
      kostId
    );

    if (history.length === 0) {
      return res.status(200).json({
        message:
          "Anda belum memiliki riwayat pesanan catering di kost ini atau kost manapun.",
        data: [],
      });
    }

    res.status(200).json({
      message: "Riwayat pesanan catering berhasil diambil",
      data: history,
    });
  }),

  createCateringOrderAndPayment: asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.user_id;
    const {
      items,
      catatan,
      metode_bayar,
      reservasi_id,
      catering_id,
      bukti_bayar,
    } = req.body;

    if (!bukti_bayar) {
      throw new AppError(
        "Bukti pembayaran wajib disertakan (berupa URL atau data Base64).",
        400
      );
    }

    if (!userIdFromToken) {
      throw new AppError(
        "User ID tidak ditemukan dari token. Pastikan Anda sudah login.",
        401
      );
    }

    const orderData = {
      items,
      catatan,
      metode_bayar,
      reservasi_id,
      catering_id,
      bukti_bayar,
    };

    try {
      const result = await cateringService.createCateringOrderWithPayment(
        userIdFromToken,
        orderData
      );

      const formattedDetailOrders = result.newDetailOrders.map((detail) => ({
        ...detail,
        menu: detail.menu
          ? {
              ...detail.menu,
              foto_menu_url: detail.menu.foto_menu
                ? fileService.generateFileUrl(detail.menu.foto_menu)
                : null,
            }
          : null,
      }));

      res.status(201).json({
        message: "Pesanan catering dan pembayaran berhasil dibuat",
        data: {
          order: result.newOrder,
          detail_orders: formattedDetailOrders,
          payment: {
            ...result.newPayment,
            bukti_bayar_url: bukti_bayar,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }),
};
