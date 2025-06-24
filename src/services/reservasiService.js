const prisma = require("../config/database");
const { Prisma } = require("@prisma/client");
const fileService = require("./fileService");
const { AppError } = require("../middleware/errorHandler");
const path = require("path");
const { ReservasiStatus, PenghuniStatus } = require("@prisma/client");

const createReservation = async (userId, reservationDetails, buktiBayarFile) => {
  const { kost_id, tanggal_check_in, durasi_bulan, metode_bayar, catatan } = reservationDetails;
  const parsedDurasiBulan = parseInt(durasi_bulan, 10);

  if (isNaN(parsedDurasiBulan) || parsedDurasiBulan < 1) {
    throw new AppError("Durasi bulan harus berupa angka positif.", 400);
  }

  try {
    const kost = await prisma.kost.findUnique({
      where: { kost_id },
      select: {
        total_kamar: true,
        harga_bulanan: true,
        deposit: true,
        harga_final: true,
        is_approved: true,
      },
    });

    if (!kost) throw new AppError("Kost tidak ditemukan.", 404);
    if (!kost.is_approved) throw new AppError("Kost belum disetujui.", 400);

    const total_harga = new Prisma.Decimal(kost.harga_final).mul(parsedDurasiBulan);
    const deposit_amount = kost.deposit;

    const tanggalCheckInDate = new Date(tanggal_check_in);
    const tanggalKeluarDate = new Date(tanggalCheckInDate);
    tanggalKeluarDate.setMonth(tanggalKeluarDate.getMonth() + parsedDurasiBulan);

    const activeReservationsCount = await prisma.reservasi.count({
      where: {
        kost_id,
        status: { in: ["PENDING", "APPROVED"] },
        status_penghunian: "AKTIF",
      },
    });

    if (activeReservationsCount >= kost.total_kamar) {
      throw new AppError("Tidak ada kamar tersedia untuk kost ini.", 409);
    }

    const existingActiveReservation = await prisma.reservasi.findFirst({
      where: {
        user_id: userId,
        kost_id,
        status: "APPROVED",
        status_penghunian: "AKTIF",
      },
    });

    if (existingActiveReservation) {
      throw new AppError("Anda sudah memiliki reservasi aktif di kost ini.", 409);
    }

    const newReservation = await prisma.reservasi.create({
      data: {
        user_id: userId,
        kost_id,
        tanggal_check_in: tanggalCheckInDate,
        durasi_bulan: parsedDurasiBulan,
        total_harga,
        deposit_amount,
        bukti_bayar: buktiBayarFile.path,
        metode_bayar,
        catatan,
        status: "PENDING",
        tanggal_keluar: tanggalKeluarDate,
      },
    });

    return newReservation;
  } catch (error) {
    throw error instanceof AppError ? error : new AppError(`Gagal membuat reservasi kost: ${error.message}`, 500);
  }
};

const extendReservation = async (reservasiId, userId, extensionDetails, buktiBayarFile) => {
  const { durasi_perpanjangan_bulan, metode_bayar, catatan } = extensionDetails;

  try {
    const existing = await prisma.reservasi.findUnique({
      where: { reservasi_id: reservasiId },
      include: { kost: { select: { harga_final: true, kost_id: true } } },
    });

    if (!existing) throw new AppError("Reservasi tidak ditemukan.", 404);
    if (existing.user_id !== userId) throw new AppError("Akses ditolak.", 403);
    if (existing.status !== "APPROVED") throw new AppError("Reservasi belum disetujui.", 400);
    if (new Date(existing.tanggal_keluar || Date.now()) < new Date()) {
      throw new AppError("Reservasi sudah berakhir.", 400);
    }

    const currentTanggalKeluar = existing.tanggal_keluar || existing.tanggal_check_in;
    const newTanggalKeluar = new Date(currentTanggalKeluar);
    newTanggalKeluar.setMonth(newTanggalKeluar.getMonth() + durasi_perpanjangan_bulan);

    const pricePerMonth = existing.kost.harga_final;
    const additionalCost = pricePerMonth.mul(durasi_perpanjangan_bulan);
    const newTotalHarga = new Prisma.Decimal(existing.total_harga).add(additionalCost);

    const updated = await prisma.reservasi.update({
      where: { reservasi_id: reservasiId },
      data: {
        durasi_bulan: existing.durasi_bulan + durasi_perpanjangan_bulan,
        total_harga: newTotalHarga,
        tanggal_keluar: newTanggalKeluar,
        bukti_bayar: buktiBayarFile.path, // URL langsung
        metode_bayar,
        catatan,
        updated_at: new Date(),
      },
    });

    return updated;
  } catch (error) {
    throw error instanceof AppError ? error : new AppError(`Gagal memperpanjang reservasi: ${error.message}`, 500);
  }
};

const getKostandReservedData = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activatedReservations = await prisma.reservasi.updateMany({
      where: {
        status: ReservasiStatus.APPROVED,
        tanggal_check_in: {
          lte: today,
        },
        status_penghunian: {
          not: PenghuniStatus.AKTIF,
        },
        OR: [{ tanggal_keluar: null }, { tanggal_keluar: { gt: today } }],
      },
      data: {
        status_penghunian: PenghuniStatus.AKTIF,
        updated_at: new Date(),
      },
    });

    const deactivatedReservations = await prisma.reservasi.updateMany({
      where: {
        status: ReservasiStatus.APPROVED,
        status_penghunian: PenghuniStatus.AKTIF,
        tanggal_keluar: {
          lte: today,
        },
      },
      data: {
        status_penghunian: PenghuniStatus.KELUAR,
        updated_at: new Date(),
      },
    });

    const allApprovedKost = await prisma.kost.findMany({
      where: {
        is_approved: true,
      },
      select: {
        kost_id: true,
        nama_kost: true,
        alamat: true,
        foto_kost: true,
        harga_bulanan: true,
        harga_final: true,
        tipe: {
          select: {
            nama_tipe: true,
          },
        },
      },
    });

    const formattedAllApprovedKost = allApprovedKost.map((kost) => ({
      ...kost,
      foto_kost: kost.foto_kost?.map((path) => fileService.generateFileUrl(path)) || [],
    }));

    const userReservations = await prisma.reservasi.findMany({
      where: { user_id: userId },
      include: {
        kost: {
          select: {
            kost_id: true,
            nama_kost: true,
            alamat: true,
            foto_kost: true,
            harga_bulanan: true,
            harga_final: true,
            tipe: {
              select: { nama_tipe: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const pendingUpcomingKost = [];
    const activeKost = [];
    const historyKost = [];
    const reservedKostIds = new Set();

    for (const res of userReservations) {
      const kostData = {
        reservasi_id: res.reservasi_id,
        status_reservasi: res.status,
        status_penghunian: res.status_penghunian,
        tanggal_check_in: res.tanggal_check_in.toISOString().split("T")[0],
        tanggal_keluar: res.tanggal_keluar
          ? res.tanggal_keluar.toISOString().split("T")[0]
          : null,
        total_harga: res.total_harga,
        deposit_amount: res.deposit_amount,
        catatan: res.catatan,
        ...res.kost,
        foto_kost: res.kost.foto_kost?.map((path) => fileService.generateFileUrl(path)) || [],
      };

      const checkIn = new Date(res.tanggal_check_in).setHours(0, 0, 0, 0);
      const checkOut = res.tanggal_keluar ? new Date(res.tanggal_keluar).setHours(0, 0, 0, 0) : null;

      const isCheckInReached = checkIn <= today;
      const isCheckOutPassed = checkOut && checkOut < today;

      if (
        res.status === ReservasiStatus.PENDING ||
        (res.status === ReservasiStatus.APPROVED && !isCheckInReached)
      ) {
        pendingUpcomingKost.push(kostData);
        reservedKostIds.add(res.kost.kost_id);
      } else if (
        res.status === ReservasiStatus.APPROVED &&
        res.status_penghunian === PenghuniStatus.AKTIF &&
        isCheckInReached &&
        !isCheckOutPassed
      ) {
        activeKost.push(kostData);
        reservedKostIds.add(res.kost.kost_id);
      } else {
        historyKost.push(kostData);
      }
    }

    const availableKost = formattedAllApprovedKost.filter(
      (kost) => !reservedKostIds.has(kost.kost_id)
    );

    return {
      all_kost: availableKost,
      pending_upcoming_reservations: pendingUpcomingKost,
      active_reservations: activeKost,
      history_reservations: historyKost,
    };
  } catch (error) {
    console.error("Error in getKostandReservedData:", error);
    throw new AppError(`Gagal mengambil data dashboard: ${error.message}`, 500);
  }
};

const updateReservationStatus = async (
  reservasiId,
  newStatus,
  validatedByUserId,
  rejectionReason = null
) => {
  try {
    const existingReservation = await prisma.reservasi.findUnique({
      where: { reservasi_id: reservasiId },
      select: {
        status: true,
        kost_id: true,
        user_id: true,
      },
    });

    if (!existingReservation) {
      throw new AppError("Reservasi tidak ditemukan.", 404);
    }

    const validatorUser = await prisma.users.findUnique({
      where: { user_id: validatedByUserId },
      select: { role: true, kost_managed: { select: { kost_id: true } } },
    });

    if (
      !validatorUser ||
      (validatorUser.role !== "PENGELOLA" && validatorUser.role !== "ADMIN")
    ) {
      throw new AppError(
        "Akses ditolak. Hanya pengelola atau admin yang dapat memperbarui status reservasi.",
        403
      );
    }

    if (validatorUser.role === "PENGELOLA") {
      const managesThisKost = validatorUser.kost_managed.some(
        (kost) => kost.kost_id === existingReservation.kost_id
      );
      if (!managesThisKost) {
        throw new AppError(
          "Anda tidak memiliki izin untuk mengelola reservasi di kost ini.",
          403
        );
      }
    }

    if (existingReservation.status !== ReservasiStatus.PENDING) {
      throw new AppError(
        `Status reservasi sudah ${existingReservation.status}. Hanya reservasi PENDING yang bisa diubah.`,
        400
      );
    }

    const updatedReservation = await prisma.$transaction(async (tx) => {
      const dataToUpdate = {
        status: newStatus,
        validated_by: validatedByUserId,
        validated_at: new Date(),
        updated_at: new Date(),
      };

      if (newStatus === ReservasiStatus.REJECTED) {
        dataToUpdate.rejection_reason =
          rejectionReason || "Tidak ada alasan spesifik.";
        dataToUpdate.status_penghunian = null;
      } else if (newStatus === ReservasiStatus.APPROVED) {
        dataToUpdate.rejection_reason = null;
      }

      const res = await tx.reservasi.update({
        where: { reservasi_id: reservasiId },
        data: dataToUpdate,
        select: {
          reservasi_id: true,
          user_id: true,
          kost_id: true,
          status: true,
          status_penghunian: true,
          tanggal_check_in: true,
          tanggal_keluar: true,
          total_harga: true,
          metode_bayar: true,
          bukti_bayar: true,
          rejection_reason: true,
          validated_by: true,
          validated_at: true,
          catatan: true,
          created_at: true,
          updated_at: true,
          kost: {
            select: {
              nama_kost: true,
            },
          },
          user: {
            select: {
              full_name: true,
              email: true,
            },
          },
        },
      });
      return res;
    });

    const buktiBayarFullUrl = updatedReservation.bukti_bayar
      ? fileService.generateFileUrl(updatedReservation.bukti_bayar)
      : null;

    return {
      ...updatedReservation,
      bukti_bayar_url: buktiBayarFullUrl,
      tanggal_check_in: updatedReservation.tanggal_check_in
        .toISOString()
        .split("T")[0],
      tanggal_keluar: updatedReservation.tanggal_keluar
        ? updatedReservation.tanggal_keluar.toISOString().split("T")[0]
        : null,
    };
  } catch (error) {
    console.error("Error in updateReservationStatus:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Gagal memperbarui status reservasi: ${error.message}`,
      500
    );
  }
};

const getManagedKostReservations = async (kostId, pengelolaId, userRole) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Pembaruan Status OTOMATIS (tetap di sini)
    await prisma.reservasi.updateMany({
      where: {
        status: ReservasiStatus.APPROVED,
        tanggal_check_in: { lte: today },
        status_penghunian: { not: PenghuniStatus.AKTIF },
        OR: [{ tanggal_keluar: null }, { tanggal_keluar: { gt: today } }],
      },
      data: { status_penghunian: PenghuniStatus.AKTIF, updated_at: new Date() },
    });

    await prisma.reservasi.updateMany({
      where: {
        status: ReservasiStatus.APPROVED,
        status_penghunian: PenghuniStatus.AKTIF,
        tanggal_keluar: { lte: today },
      },
      data: {
        status_penghunian: PenghuniStatus.KELUAR,
        updated_at: new Date(),
      },
    });

    const kost = await prisma.kost.findUnique({
      where: {
        kost_id: kostId,
      },
      include: {
        tipe: {
          select: {
            nama_tipe: true,
          },
        },
        pengelola: {
          select: {
            user_id: true,
          },
        },
        reservasi: {
          include: {
            user: {
              select: {
                user_id: true,
                full_name: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!kost) {
      throw new AppError("Kost tidak ditemukan.", 404);
    }

    if (userRole === "PENGELOLA" && kost.pengelola.user_id !== pengelolaId) {
      throw new AppError("Akses ditolak. Anda tidak mengelola kost ini.", 403);
    }

    const pendingUpcomingReservations = [];
    const activeReservations = [];
    const historyReservations = [];
    let totalOccupiedRoomsCount = 0;

    for (const res of kost.reservasi) {
      const reservasiData = {
        reservasi_id: res.reservasi_id,
        user: res.user,
        status_reservasi: res.status,
        status_penghunian: res.status_penghunian,
        tanggal_check_in: res.tanggal_check_in.toISOString().split("T")[0],
        tanggal_keluar: res.tanggal_keluar
          ? res.tanggal_keluar.toISOString().split("T")[0]
          : null,
        total_harga: res.total_harga,
        deposit_amount: res.deposit_amount,
        catatan: res.catatan,
        bukti_bayar: res.bukti_bayar
          ? fileService.generateFileUrl(res.bukti_bayar)
          : null,
      };

      const resTanggalCheckIn = new Date(res.tanggal_check_in);
      resTanggalCheckIn.setHours(0, 0, 0, 0);
      const resTanggalKeluar = res.tanggal_keluar
        ? new Date(res.tanggal_keluar)
        : null;
      if (resTanggalKeluar) resTanggalKeluar.setHours(0, 0, 0, 0);

      const isCheckInDateReached = resTanggalCheckIn <= today;
      const isCheckOutDatePassed = resTanggalKeluar && resTanggalKeluar < today;

      if (
        res.status === ReservasiStatus.PENDING ||
        (res.status === ReservasiStatus.APPROVED && !isCheckInDateReached)
      ) {
        pendingUpcomingReservations.push(reservasiData);
      } else if (
        res.status === ReservasiStatus.APPROVED &&
        res.status_penghunian === PenghuniStatus.AKTIF &&
        isCheckInDateReached &&
        !isCheckOutDatePassed
      ) {
        activeReservations.push(reservasiData);
      } else if (
        res.status === ReservasiStatus.REJECTED ||
        (res.status === ReservasiStatus.APPROVED &&
          res.status_penghunian === PenghuniStatus.KELUAR) ||
        (res.status === ReservasiStatus.APPROVED && isCheckOutDatePassed)
      ) {
        historyReservations.push(reservasiData);
      }
      if (
        res.status === ReservasiStatus.APPROVED &&
        (res.status_penghunian === null ||
          res.status_penghunian === PenghuniStatus.AKTIF) &&
        (!resTanggalKeluar || resTanggalKeluar >= today)
      ) {
        totalOccupiedRoomsCount++;
      }
    }

    const availableRooms = kost.total_kamar - totalOccupiedRoomsCount;

    return {
      kost_id: kost.kost_id,
      nama_kost: kost.nama_kost,
      alamat: kost.alamat,
      foto_kost: kost.foto_kost
        ? kost.foto_kost.map((url) => fileService.generateFileUrl(url))
        : [],
      total_kamar: kost.total_kamar,
      tipe_kost: kost.tipe.nama_tipe,
      total_occupied_rooms: totalOccupiedRoomsCount,
      available_rooms: availableRooms,
      reservations: {
        pending_upcoming: pendingUpcomingReservations,
        active: activeReservations,
        history: historyReservations,
      },
    };
  } catch (error) {
    console.error("Error in getManagedKostReservations:", error);
    throw new AppError(
      `Gagal mengambil data reservasi kost: ${error.message}`,
      500
    );
  }
};

const getReservationsByKostAndUser = async (kostId, userId) => {
  try {
    const reservations = await prisma.reservasi.findMany({
      where: {
        kost_id: kostId,
        user_id: userId,
      },
      include: {
        kost: {
          select: {
            kost_id: true,
            nama_kost: true,
            alamat: true,
            foto_kost: true,
            harga_bulanan: true,
            harga_final: true,
            tipe: {
              select: {
                nama_tipe: true,
              },
            },
          },
        },
        user: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedReservations = reservations.map((res) => ({
      reservasi_id: res.reservasi_id,
      status_reservasi: res.status,
      status_penghunian: res.status_penghunian,
      tanggal_check_in: res.tanggal_check_in.toISOString().split("T")[0],
      tanggal_keluar: res.tanggal_keluar
        ? res.tanggal_keluar.toISOString().split("T")[0]
        : null,
      durasi_bulan: res.durasi_bulan,
      total_harga: res.total_harga,
      deposit_amount: res.deposit_amount,
      metode_bayar: res.metode_bayar,
      catatan: res.catatan,
      bukti_bayar: res.bukti_bayar
        ? fileService.generateFileUrl(res.bukti_bayar)
        : null,
      rejection_reason: res.rejection_reason,
      validated_by: res.validated_by,
      validated_at: res.validated_at,
      created_at: res.created_at,
      updated_at: res.updated_at,
      kost: {
        kost_id: res.kost.kost_id,
        nama_kost: res.kost.nama_kost,
        alamat: res.kost.alamat,
        foto_kost: res.kost.foto_kost
          ? res.kost.foto_kost.map((url) => fileService.generateFileUrl(url))
          : [],
        harga_bulanan: res.kost.harga_bulanan,
        harga_final: res.kost.harga_final,
        tipe_kost: res.kost.tipe.nama_tipe,
      },
      user: res.user,
    }));

    return formattedReservations;
  } catch (error) {
    console.error("Error in getReservationsByKostAndUser:", error);
    throw new AppError(
      `Gagal mengambil data reservasi untuk kost dan user ini: ${error.message}`,
      500
    );
  }
};

const getReservationDetailById = async (
  reservasiId,
  userId = null,
  userRole = null
) => {
  try {
    const reservation = await prisma.reservasi.findUnique({
      where: { reservasi_id: reservasiId },
      include: {
        kost: {
          select: {
            kost_id: true,
            nama_kost: true,
            alamat: true,
            foto_kost: true,
            harga_bulanan: true,
            harga_final: true,
            deposit: true,
            total_kamar: true,
            qris_image: true,
            rekening_info: true,
            biaya_tambahan: true,
            tipe: {
              select: {
                nama_tipe: true,
              },
            },
            pengelola: {
              select: {
                user_id: true,
                full_name: true,
                email: true,
                phone: true,
              },
            },
            catering: {
              select: {
                catering_id: true,
                nama_catering: true,
                alamat: true,
                whatsapp_number: true,
                is_partner: true,
                is_active: true,
                qris_image: true,
                rekening_info: true,
              },
            },
            laundry: {
              select: {
                laundry_id: true,
                nama_laundry: true,
                alamat: true,
                whatsapp_number: true,
                is_partner: true,
                is_active: true,
                qris_image: true,
                rekening_info: true,
              },
            },
          },
        },
        user: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        validator: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new AppError("Detail reservasi tidak ditemukan.", 404);
    }

    const isOwner = userId && reservation.user_id === userId;
    const isRelatedPengelola =
      userId &&
      userRole === "PENGELOLA" &&
      reservation.kost.pengelola.user_id === userId;
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isRelatedPengelola && !isAdmin) {
      throw new AppError(
        "Akses ditolak. Anda tidak memiliki izin untuk melihat detail reservasi ini.",
        403
      );
    }

    const formattedReservation = {
      reservasi_id: reservation.reservasi_id,
      status_reservasi: reservation.status,
      status_penghunian: reservation.status_penghunian,
      tanggal_check_in: reservation.tanggal_check_in
        .toISOString()
        .split("T")[0],
      tanggal_keluar: reservation.tanggal_keluar
        ? reservation.tanggal_keluar.toISOString().split("T")[0]
        : null,
      durasi_bulan: reservation.durasi_bulan,
      total_harga: reservation.total_harga,
      deposit_amount: reservation.deposit_amount,
      metode_bayar: reservation.metode_bayar,
      catatan: reservation.catatan,
      bukti_bayar_url: reservation.bukti_bayar
        ? fileService.generateFileUrl(reservation.bukti_bayar)
        : null,
      rejection_reason: reservation.rejection_reason,
      validated_by: reservation.validated_by,
      validated_at: reservation.validated_at,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at,
      kost: {
        kost_id: reservation.kost.kost_id,
        nama_kost: reservation.kost.nama_kost,
        alamat: reservation.kost.alamat,
        foto_kost: reservation.kost.foto_kost
          ? reservation.kost.foto_kost.map((url) =>
            fileService.generateFileUrl(url)
          )
          : [],
        qris_image: reservation.kost.qris_image
          ? fileService.generateFileUrl(reservation.kost.qris_image)
          : null,
        rekening_info: reservation.kost.rekening_info,
        biaya_tambahan: reservation.kost.biaya_tambahan,
        harga_bulanan: reservation.kost.harga_bulanan,
        harga_final: reservation.kost.harga_final,
        deposit: reservation.kost.deposit,
        total_kamar: reservation.kost.total_kamar,
        tipe_kost: reservation.kost.tipe.nama_tipe,
        pengelola: reservation.kost.pengelola,
        catering_services: reservation.kost.catering
          ? reservation.kost.catering.map((c) => ({
            ...c,
            qris_image: c.qris_image
              ? fileService.generateFileUrl(c.qris_image)
              : null,
          }))
          : [],
        laundry_services: reservation.kost.laundry
          ? reservation.kost.laundry.map((l) => ({
            ...l,
            qris_image: l.qris_image
              ? fileService.generateFileUrl(l.qris_image)
              : null,
          }))
          : [],
      },
      user: reservation.user,
      validator: reservation.validator,
    };

    return formattedReservation;
  } catch (error) {
    console.error("Error in getReservationDetailById:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Gagal mengambil detail reservasi: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createReservation,
  getKostandReservedData,
  updateReservationStatus,
  extendReservation,
  getManagedKostReservations,
  getReservationsByKostAndUser,
  getReservationDetailById,
};
