const laundryService = require("../services/orderLaundryService");
const fileService = require("../services/fileService");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

module.exports = {

  getLaundryHistory: asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.user_id;
    const { kostId } = req.query;

    if (!userIdFromToken) {
      throw new AppError("User ID tidak ditemukan dari token. Pastikan Anda sudah login.", 401);
    }

    const history = await laundryService.getLaundryHistoryForTenant(userIdFromToken, kostId);

    if (history.length === 0) {
      return res.status(200).json({
        message: "Anda belum memiliki riwayat pesanan laundry di kost ini atau kost manapun.",
        data: [],
      });
    }

    res.status(200).json({
      message: "Riwayat pesanan laundry berhasil diambil",
      data: history,
    });
  }),

  createLaundryOrderAndPayment: asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.user_id;
    const { items, catatan, metode_bayar, reservasi_id, laundry_id } = req.body;

    if (!req.file) {
      throw new AppError("Bukti pembayaran wajib diunggah.", 400);
    }

    const buktiBayarFile = req.file;

    try {
      if (!userIdFromToken) {
        await fileService.deleteFile(buktiBayarFile.path);
        throw new AppError("User ID tidak ditemukan dari token. Pastikan Anda sudah login.", 401);
      }

      const result = await laundryService.createLaundryOrderWithPayment(
        userIdFromToken,
        { items, catatan, metode_bayar, reservasi_id, laundry_id },
        buktiBayarFile
      );

      const buktiBayarFullUrl = fileService.generateFileUrl(result.newPayment.bukti_bayar);

      res.status(201).json({
        message: "Pesanan laundry dan pembayaran berhasil dibuat",
        data: {
          order: result.newOrder,
          detail_orders: result.newDetailOrders,
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
