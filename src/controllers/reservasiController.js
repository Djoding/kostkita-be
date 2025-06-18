const reservasiService = require("../services/reservasiService");
const fileService = require("../services/fileService");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

module.exports = {
  createReservation: asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.user_id;
    const { kost_id, tanggal_check_in, durasi_bulan, metode_bayar, catatan } =
      req.body;

    if (!req.file) {
      throw new AppError("Bukti pembayaran reservasi wajib diunggah.", 400);
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

      const newReservation = await reservasiService.createReservation(
        userIdFromToken,
        { kost_id, tanggal_check_in, durasi_bulan, metode_bayar, catatan },
        buktiBayarFile
      );

      const buktiBayarFullUrl = newReservation.bukti_bayar
        ? fileService.generateFileUrl(newReservation.bukti_bayar)
        : null;

      res.status(201).json({
        message:
          "Reservasi kost berhasil dibuat. Menunggu konfirmasi pengelola.",
        data: {
          reservation: {
            ...newReservation,
            bukti_bayar_url: buktiBayarFullUrl,
            tanggal_check_in: newReservation.tanggal_check_in
              .toISOString()
              .split("T")[0],
            tanggal_keluar: newReservation.tanggal_keluar
              ? newReservation.tanggal_keluar.toISOString().split("T")[0]
              : null,
          },
        },
        uploaded_file_info: {
          original_name: req.file.originalname,
          filename: newReservation.bukti_bayar.split("/").pop(),
          url: buktiBayarFullUrl,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      throw error;
    }
  }),

  getReservations: asyncHandler(async (req, res) => {
    const userId = req.query.userId || req.user.user_id;
    const filters = {
      status: req.query.status,
      kostId: req.query.kostId,
    };

    if (req.user.role === "PENGHUNI" && userId !== req.user.user_id) {
      throw new AppError(
        "Anda tidak diizinkan melihat reservasi pengguna lain.",
        403
      );
    }

    const reservations = await reservasiService.getKostandReservedData(
      userId,
      filters
    );

    res.status(200).json({
      message: "Daftar reservasi berhasil diambil",
      data: reservations,
    });
  }),

  updateReservationStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    const validatedByUserId = req.user.user_id;

    if (
      !id ||
      !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
    ) {
      throw new AppError("ID Reservasi tidak valid.", 400);
    }

    try {
      const updatedReservation = await reservasiService.updateReservationStatus(
        id,
        status,
        validatedByUserId,
        rejection_reason
      );

      res.status(200).json({
        message: `Status reservasi berhasil diperbarui menjadi ${updatedReservation.status}.`,
        data: updatedReservation,
      });
    } catch (error) {
      throw error;
    }
  }),
  extendReservation: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { durasi_perpanjangan_bulan, metode_bayar, catatan } = req.body;

    if (
      !id ||
      !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
    ) {
      throw new AppError("ID Reservasi tidak valid.", 400);
    }

    if (!req.file) {
      throw new AppError("Bukti pembayaran perpanjangan wajib diunggah.", 400);
    }

    const buktiBayarFile = req.file;

    try {
      const updatedReservation = await reservasiService.extendReservation(
        id,
        userId,
        {
          durasi_perpanjangan_bulan: parseInt(durasi_perpanjangan_bulan, 10),
          metode_bayar,
          catatan,
        },
        buktiBayarFile
      );

      res.status(200).json({
        message: `Reservasi berhasil diperpanjang. Durasi baru: ${updatedReservation.durasi_bulan} bulan.`,
        data: updatedReservation,
      });
    } catch (error) {
      throw error;
    }
  }),
  getManagedKostReservations: asyncHandler(async (req, res) => {
    const { kostId } = req.params;
    const pengelolaId = req.user.user_id;
    const userRole = req.user.role; 

    if (userRole !== "PENGELOLA" && userRole !== "ADMIN") {
      throw new AppError(
        "Akses ditolak. Anda tidak memiliki izin untuk melihat data ini.",
        403
      );
    }

    if (!pengelolaId) {
      throw new AppError(
        "User ID pengelola tidak ditemukan. Pastikan Anda sudah login.",
        401
      );
    }

    const kostReservationsData =
      await reservasiService.getManagedKostReservations(
        kostId,
        pengelolaId,
        userRole
      );

    res.status(200).json({
      message: `Data reservasi untuk Kost '${kostReservationsData.nama_kost}' berhasil diambil.`,
      data: kostReservationsData,
    });
  }),
};
