const reservasiService = require("../services/reservasiService");
const fileService = require("../services/fileService");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

module.exports = {
  createReservation: asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.user_id;
    const {
      kost_id,
      tanggal_check_in,
      durasi_bulan,
      metode_bayar,
      catatan,
      bukti_bayar,
    } = req.body;

    if (!bukti_bayar) {
      throw new new AppError(
        "Bukti pembayaran reservasi wajib disertakan (berupa URL atau data Base64).",
        400
      )();
    }

    if (!userIdFromToken) {
      throw new AppError(
        "User ID tidak ditemukan dari token. Pastikan Anda sudah login.",
        401
      );
    }

    const reservationData = {
      kost_id,
      tanggal_check_in,
      durasi_bulan,
      metode_bayar,
      catatan,
      bukti_bayar,
    };

    try {
      const newReservation = await reservasiService.createReservation(
        userIdFromToken,
        reservationData
      );

      res.status(201).json({
        message:
          "Reservasi kost berhasil dibuat. Menunggu konfirmasi pengelola.",
        data: {
          reservation: {
            ...newReservation,
            bukti_bayar_url: bukti_bayar,
            tanggal_check_in: newReservation.tanggal_check_in
              .toISOString()
              .split("T")[0],
            tanggal_keluar: newReservation.tanggal_keluar
              ? newReservation.tanggal_keluar.toISOString().split("T")[0]
              : null,
          },
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
    const {
      durasi_perpanjangan_bulan,
      metode_bayar,
      catatan,
      bukti_bayar_perpanjangan,
    } = req.body;

    if (
      !id ||
      !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
    ) {
      throw new AppError("ID Reservasi tidak valid.", 400);
    }
    if (!bukti_bayar_perpanjangan) {
      throw new AppError(
        "Bukti pembayaran perpanjangan wajib disertakan (berupa URL atau data Base64).",
        400
      );
    }
    try {
      const extensionData = {
        durasi_perpanjangan_bulan: parseInt(durasi_perpanjangan_bulan, 10),
        metode_bayar,
        catatan,
        bukti_bayar_perpanjangan,
      };

      const updatedReservation = await reservasiService.extendReservation(
        id,
        userId,
        extensionData
      );


      res.status(200).json({
        message: `Reservasi berhasil diperpanjang. Durasi baru: ${updatedReservation.durasi_bulan} bulan.`,
        data: {
          ...updatedReservation,
          bukti_bayar_url: bukti_bayar_perpanjangan,
          tanggal_check_in: updatedReservation.tanggal_check_in
            .toISOString()
            .split("T")[0],
          tanggal_keluar: updatedReservation.tanggal_keluar
            ? updatedReservation.tanggal_keluar.toISOString().split("T")[0]
            : null,
        },
        // Hapus uploaded_file_info yang bergantung pada req.file
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

  getReservationsForSpecificKostByUser: asyncHandler(async (req, res) => {
    const { kostId } = req.params;
    const userId = req.user.user_id;

    if (!kostId) {
      throw new AppError("ID Kost diperlukan.", 400);
    }

    if (
      !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(kostId)
    ) {
      throw new AppError("ID Kost tidak valid.", 400);
    }

    try {
      const reservations = await reservasiService.getReservationsByKostAndUser(
        kostId,
        userId
      );

      if (reservations.length === 0) {
        return res.status(404).json({
          message:
            "Tidak ditemukan reservasi untuk kost ini oleh pengguna Anda.",
          data: [],
        });
      }

      res.status(200).json({
        message: "Data reservasi berhasil diambil.",
        data: reservations,
      });
    } catch (error) {
      throw error;
    }
  }),

  getReservationDetailById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    if (
      !id ||
      !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
    ) {
      throw new AppError("ID Reservasi tidak valid.", 400);
    }

    try {
      const reservationDetail = await reservasiService.getReservationDetailById(
        id,
        userId,
        userRole
      );

      res.status(200).json({
        message: "Detail reservasi berhasil diambil.",
        data: reservationDetail,
      });
    } catch (error) {
      throw error;
    }
  }),
};
