const prisma = require("../config/database");
const { Prisma } = require("@prisma/client");
const fileService = require("./fileService");
const { AppError } = require("../middleware/errorHandler");
const path = require("path");

const getLaundryHistoryForTenant = async (userId, kostId) => {
  try {
    if (kostId) {
      const activeReservation = await prisma.reservasi.findFirst({
        where: {
          user_id: userId,
          kost_id: kostId,
          status: "APPROVED",
          status_penghunian: "AKTIF",
        },
      });

      if (!activeReservation) {
        throw new AppError(
          "Penghuni tidak memiliki reservasi aktif di kost ini atau kostId tidak valid.",
          403
        );
      }
    } else {
      const activeReservations = await prisma.reservasi.findMany({
        where: {
          user_id: userId,
          status: "APPROVED",
          status_penghunian: "AKTIF",
        },
        select: {
          kost_id: true,
        },
      });

      if (activeReservations.length === 0) {
        throw new AppError(
          "Penghuni tidak memiliki reservasi aktif di kost manapun.",
          404
        );
      }
    }

    const laundryOrders = await prisma.pesananLaundry.findMany({
      where: {
        user_id: userId,
        ...(kostId && {
          laundry: {
            kost_id: kostId,
          },
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
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedOrders = laundryOrders.map((order) => ({
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

    return formattedOrders;
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
  const { items, catatan, metode_bayar } = orderDetails;
  let buktiBayarUrl = null;
  let resultFileMove = null;

  try {
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
    const layananIds = items.map((item) => item.layanan_id);

    const laundryHargaItems = await prisma.laundryHarga.findMany({
      where: {
        layanan_id: { in: layananIds },
        is_available: true,
      },
      include: {
        laundry: {
          select: {
            laundry_id: true,
            kost_id: true,
            is_active: true,
          },
        },
        layanan: {
          select: {
            layanan_id: true,
            satuan: true,
          },
        },
      },
    });

    if (laundryHargaItems.length !== layananIds.length) {
      const foundLayananIds = new Set(
        laundryHargaItems.map((lh) => lh.layanan_id)
      );
      const missingLayananIds = layananIds.filter(
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
        `Salah satu atau lebih layanan laundry tidak ditemukan atau tidak tersedia: ${missingLayananIds.join(
          ", "
        )}.`,
        404
      );
    }

    let laundryIdForOrder = null;
    let kostIdForOrder = null;

    for (const item of items) {
      const hargaItem = laundryHargaItems.find(
        (lh) => lh.layanan_id === item.layanan_id
      );

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
          `Layanan laundry dari ${hargaItem.laundry.nama_laundry} tidak aktif.`
        );
      }

      if (laundryIdForOrder === null) {
        laundryIdForOrder = hargaItem.laundry.laundry_id;
        kostIdForOrder = hargaItem.laundry.kost_id;
      } else if (
        laundryIdForOrder !== hargaItem.laundry.laundry_id ||
        kostIdForOrder !== hargaItem.laundry.kost_id
      ) {
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
          "Semua layanan dalam satu pesanan laundry harus berasal dari penyedia laundry yang sama dan kost yang sama.",
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

    const activeReservation = await prisma.reservasi.findFirst({
      where: {
        user_id: userId,
        kost_id: kostIdForOrder,
        status: "APPROVED",
        status_penghunian: "AKTIF",
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

    const transactionResult = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.pesananLaundry.create({
        data: {
          user_id: userId,
          laundry_id: laundryIdForOrder,
          total_estimasi: calculatedTotalEstimasi,
          status: "PENDING",
          catatan: catatan,
          tanggal_antar: new Date(),
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
