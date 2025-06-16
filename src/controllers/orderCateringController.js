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
    const { items, catatan, metode_bayar } = req.body;

    if (!req.file) {
      throw new AppError("Bukti pembayaran wajib diunggah.", 400);
    }

    const buktiBayarFile = req.file;

    try {
      if (!userIdFromToken) {
        await fileService.deleteFile(buktiBayarFile.path);
        throw new AppError(
          "User ID tidak ditemukan dari token. Pastikan Anda sudah login.",
          401
        );
      }

      const result = await cateringService.createCateringOrderWithPayment(
        userIdFromToken,
        { items: items, catatan, metode_bayar },
        buktiBayarFile
      );

      const buktiBayarFullUrl = fileService.generateFileUrl(
        result.newPayment.bukti_bayar
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
            bukti_bayar_url: buktiBayarFullUrl,
          },
        },
        uploaded_file_info: {
          original_name: req.file.originalname,
          filename: result.newPayment.bukti_bayar.split("/").pop(),
          url: buktiBayarFullUrl,
          size: req.file.size,
          mimetype: req.file.mimetype, 
        },
      });
    } catch (error) {
      throw error;
    }
  }),
};
