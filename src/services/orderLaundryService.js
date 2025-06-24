const prisma = require("../config/database");
const { Prisma } = require("@prisma/client");
const fileService = require("./fileService");
const { AppError } = require("../middleware/errorHandler");
const path = require("path");

const getLaundryHistoryForTenant = async (userId, kostId) => {
  try {
    if (kostId) {
      const active = await prisma.reservasi.findFirst({
        where: {
          user_id: userId,
          kost_id: kostId,
          status: "APPROVED",
        },
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

    return orders.map((o) => ({
      ...o,
      pembayaran: o.pembayaran
        ? {
          ...o.pembayaran,
          bukti_bayar_url: o.pembayaran.bukti_bayar
            ? fileService.generateFileUrl(o.pembayaran.bukti_bayar)
            : null,
        }
        : null,
    }));
  } catch (error) {
    console.error("Error in getLaundryHistoryForTenant:", error);
    throw error;
  }
};

const createLaundryOrderWithPayment = async (
  userId,
  orderDetails,
  buktiBayarFile
) => {
  const { items, catatan, metode_bayar, reservasi_id, laundry_id } =
    orderDetails;
  let buktiBayarUrl = null;
  let resultFileMove = null;

  try {
    if (!buktiBayarFile) {
      throw new AppError("Bukti pembayaran harus diunggah.", 400);
    }
    const processedFilePath = await fileService.processImage(
      buktiBayarFile.path,
      {
        width: 800,
        height: 600,
        quality: 80,
        format: "jpeg",
      }
    );

    resultFileMove = await fileService.moveFile(
      processedFilePath,
      "laundry_payment"
    );
    buktiBayarUrl = resultFileMove.url;

    let calculatedTotalEstimasi = new Prisma.Decimal(0);
    const serviceDetailsToCreate = [];
    const uniqueLayananIds = [...new Set(items.map((item) => item.layanan_id))];

    const laundryHargaItems = await prisma.laundryHarga.findMany({
      where: {
        layanan_id: { in: uniqueLayananIds },
        is_available: true,
        laundry: {
          laundry_id: laundry_id,
          is_active: true,
        },
      },
      include: {
        laundry: {
          select: {
            laundry_id: true,
            kost_id: true,
            is_active: true,
            nama_laundry: true,
          },
        },
        layanan: {
          select: {
            layanan_id: true,
            nama_layanan: true,
            satuan: true,
          },
        },
      },
    });

    if (laundryHargaItems.length !== uniqueLayananIds.length) {
      const foundLayananIds = new Set(
        laundryHargaItems.map((lh) => lh.layanan_id)
      );
      const missingOrInvalidLayananIds = uniqueLayananIds.filter(
        (id) => !foundLayananIds.has(id)
      );

      if (resultFileMove && resultFileMove.filename) {
        await fileService.deleteFile(
          path.join(
            fileService.uploadPath,
            "laundry_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        `Salah satu atau lebih layanan laundry tidak ditemukan, tidak tersedia, atau bukan dari laundry_id yang diberikan: ${missingOrInvalidLayananIds.join(
          ", "
        )}.`,
        404
      );
    }

    const laundryHargaMap = new Map(
      laundryHargaItems.map((lh) => [lh.layanan_id, lh])
    );

    let laundryIdFromItems = null;
    let kostIdForOrder = null;

    for (const item of items) {
      const hargaItem = laundryHargaMap.get(item.layanan_id);

      if (!hargaItem.laundry.is_active) {
        if (resultFileMove && resultFileMove.filename) {
          await fileService.deleteFile(
            path.join(
              fileService.uploadPath,
              "laundry_payment",
              resultFileMove.filename
            )
          );
        }
        throw new AppError(
          `Penyedia laundry (${hargaItem.laundry.nama_laundry}) tidak aktif.`,
          400
        );
      }

      if (laundryIdFromItems === null) {
        laundryIdFromItems = hargaItem.laundry.laundry_id;
      } else if (laundryIdFromItems !== hargaItem.laundry.laundry_id) {
        if (resultFileMove && resultFileMove.filename) {
          await fileService.deleteFile(
            path.join(
              fileService.uploadPath,
              "laundry_payment",
              resultFileMove.filename
            )
          );
        }
        throw new AppError(
          "Semua layanan dalam satu pesanan laundry harus berasal dari satu penyedia laundry yang sama.",
          400
        );
      }

      if (kostIdForOrder === null) {
        kostIdForOrder = hargaItem.laundry.kost_id;
      } else if (kostIdForOrder !== hargaItem.laundry.kost_id) {
        if (resultFileMove && resultFileMove.filename) {
          await fileService.deleteFile(
            path.join(
              fileService.uploadPath,
              "laundry_payment",
              resultFileMove.filename
            )
          );
        }
        throw new AppError(
          "Semua layanan dalam satu pesanan laundry harus berasal dari kost yang sama.",
          400
        );
      }

      const itemEstimasiHarga = hargaItem.harga_per_satuan.mul(
        item.jumlah_satuan
      );
      calculatedTotalEstimasi = calculatedTotalEstimasi.add(itemEstimasiHarga);

      serviceDetailsToCreate.push({
        layanan_id: item.layanan_id,
        jumlah_satuan: item.jumlah_satuan,
        harga_per_satuan: hargaItem.harga_per_satuan,
      });
    }

    if (serviceDetailsToCreate.length === 0) {
      if (resultFileMove && resultFileMove.filename) {
        await fileService.deleteFile(
          path.join(
            fileService.uploadPath,
            "laundry_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        "Tidak ada layanan valid yang ditemukan untuk dipesan.",
        400
      );
    }

    if (!laundryIdFromItems || !kostIdForOrder) {
      if (resultFileMove && resultFileMove.filename) {
        await fileService.deleteFile(
          path.join(
            fileService.uploadPath,
            "laundry_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        "Gagal menentukan penyedia laundry atau kost terkait dari layanan yang dipesan.",
        400
      );
    }

    const activeReservation = await prisma.reservasi.findFirst({
      where: {
        user_id: userId,
        kost_id: kostIdForOrder,
        status: "APPROVED",
        status_penghunian: "AKTIF",
      },
      select: {
        reservasi_id: true,
      },
    });

    if (!activeReservation) {
      if (resultFileMove && resultFileMove.filename) {
        await fileService.deleteFile(
          path.join(
            fileService.uploadPath,
            "laundry_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        "Anda tidak memiliki reservasi aktif di kost yang menyediakan layanan laundry ini.",
        403
      );
    }

    if (reservasi_id && activeReservation.reservasi_id !== reservasi_id) {
      if (resultFileMove && resultFileMove.filename) {
        await fileService.deleteFile(
          path.join(
            fileService.uploadPath,
            "laundry_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        "ID Reservasi tidak sesuai dengan reservasi aktif pengguna di kost ini.",
        400
      );
    }
    if (laundry_id && laundryIdFromItems !== laundry_id) {
      if (resultFileMove && resultFileMove.filename) {
        await fileService.deleteFile(
          path.join(
            fileService.uploadPath,
            "laundry_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        "ID Laundry tidak sesuai dengan layanan yang dipesan.",
        400
      );
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.pesananLaundry.create({
        data: {
          user_id: userId,
          reservasi_id: activeReservation.reservasi_id,
          laundry_id: laundryIdFromItems,
          total_estimasi: calculatedTotalEstimasi,
          status: "PENDING",
          catatan: catatan,
          tanggal_antar: new Date(),
          estimasi_selesai: new Date(
            new Date().setDate(new Date().getDate() + 2)
          ),
        },
      });

      const detailOrderData = serviceDetailsToCreate.map((detail) => ({
        ...detail,
        pesanan_id: newOrder.pesanan_id,
      }));

      await tx.detailPesananLaundry.createMany({
        data: detailOrderData,
      });

      const fetchedDetailOrders = await tx.detailPesananLaundry.findMany({
        where: {
          pesanan_id: newOrder.pesanan_id,
        },
        include: {
          layanan: {
            select: {
              layanan_id: true,
              nama_layanan: true,
              satuan: true,
            },
          },
        },
      });

      const newPayment = await tx.pembayaranLaundry.create({
        data: {
          pesanan_id: newOrder.pesanan_id,
          jumlah: calculatedTotalEstimasi,
          metode: metode_bayar,
          bukti_bayar: buktiBayarUrl,
          status: "PENDING",
        },
      });

      return { newOrder, newDetailOrders: fetchedDetailOrders, newPayment };
    });

    return transactionResult;
  } catch (error) {
    if (resultFileMove && resultFileMove.filename) {
      await fileService.deleteFile(
        path.join(
          fileService.uploadPath,
          "laundry_payment",
          resultFileMove.filename
        )
      );
    }
    console.error(
      "Error in createLaundryOrderWithPayment (multi-service):",
      error
    );
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Gagal membuat pesanan laundry dan pembayaran: ${error.message}`,
      500
    );
  }
};

module.exports = {
  getLaundryHistoryForTenant,
  createLaundryOrderWithPayment,
};
