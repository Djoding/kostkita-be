const prisma = require("../config/database");
const { Prisma } = require("@prisma/client");
const fileService = require("./fileService");
const { AppError } = require("../middleware/errorHandler");
const path = require("path");

const getCateringHistoryForTenant = async (userId, kostId) => {
  try {
    if (kostId) {
      const activeReservation = await prisma.reservasi.findFirst({
        where: {
          user_id: userId,
          kost_id: kostId,
          status: "APPROVED",
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

    const cateringOrders = await prisma.pesananCatering.findMany({
      where: {
        user_id: userId,
        ...(kostId && {
          detail_pesanan: {
            some: {
              menu: {
                catering: {
                  kost_id: kostId,
                },
              },
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
                      select: {
                        kost_id: true,
                        nama_kost: true,
                      },
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
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedOrders = cateringOrders.map((order) => ({
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

    return formattedOrders;
  } catch (error) {
    console.error("Error in getCateringHistoryForTenant:", error);
    throw error;
  }
};

const createCateringOrderWithPayment = async (
  userId,
  orderDetails,
  buktiBayarFile
) => {
  const { items, catatan, metode_bayar, reservasi_id, catering_id } =
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
      "catering_payment"
    );
    buktiBayarUrl = resultFileMove.url;

    let calculatedTotalPrice = new Prisma.Decimal(0);
    const menuDetailsToCreate = [];
    const menuIds = items.map((item) => item.menu_id);

    const menusInOrder = await prisma.cateringMenu.findMany({
      where: {
        menu_id: { in: menuIds },
        is_available: true,
        catering_id: catering_id, 
      },
      select: {
        menu_id: true,
        harga: true,
        catering: {
          select: {
            catering_id: true, 
            kost_id: true,
            is_active: true,
          },
        },
      },
    });

    if (menusInOrder.length !== menuIds.length) {
      const foundMenuIds = new Set(menusInOrder.map((m) => m.menu_id));
      const missingOrInvalidCateringMenuIds = menuIds.filter(
        (id) => !foundMenuIds.has(id)
      );

      if (resultFileMove && resultFileMove.filename) {
        await fileService.deleteFile(
          path.join(
            fileService.uploadPath,
            "catering_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        `Salah satu atau lebih menu tidak ditemukan, tidak tersedia, atau bukan dari catering_id yang diberikan: ${missingOrInvalidCateringMenuIds.join(
          ", "
        )}.`,
        404
      );
    }

    let kostIdForOrder = null;
    let actualCateringId = null;

    for (const item of items) {
      const menu = menusInOrder.find((m) => m.menu_id === item.menu_id);

      if (!menu.catering.is_active) {
        if (resultFileMove && resultFileMove.filename) {
          await fileService.deleteFile(
            path.join(
              fileService.uploadPath,
              "catering_payment",
              resultFileMove.filename
            )
          );
        }
        throw new AppError(
          `Catering untuk menu ${menu.menu_id} tidak aktif.`,
          400
        );
      }

      if (actualCateringId === null) {
        actualCateringId = menu.catering.catering_id;
      } else if (actualCateringId !== menu.catering.catering_id) {
        if (resultFileMove && resultFileMove.filename) {
          await fileService.deleteFile(
            path.join(
              fileService.uploadPath,
              "catering_payment",
              resultFileMove.filename
            )
          );
        }
        throw new AppError(
          "Semua menu dalam satu pesanan harus berasal dari satu catering yang sama.",
          400
        );
      }

      if (kostIdForOrder === null) {
        kostIdForOrder = menu.catering.kost_id;
      } else if (kostIdForOrder !== menu.catering.kost_id) {
        if (resultFileMove && resultFileMove.filename) {
          await fileService.deleteFile(
            path.join(
              fileService.uploadPath,
              "catering_payment",
              resultFileMove.filename
            )
          );
        }
        throw new AppError(
          "Semua menu dalam satu pesanan harus berasal dari kost yang sama.",
          400
        );
      }

      const itemPrice = menu.harga.mul(item.jumlah_porsi);
      calculatedTotalPrice = calculatedTotalPrice.add(itemPrice);
      menuDetailsToCreate.push({
        menu_id: item.menu_id,
        jumlah_porsi: item.jumlah_porsi,
        harga_satuan: menu.harga,
      });
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
            "catering_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        "Anda tidak memiliki reservasi aktif di kost yang menyediakan menu ini.",
        403
      );
    }

    if (reservasi_id && activeReservation.reservasi_id !== reservasi_id) {
      if (resultFileMove && resultFileMove.filename) {
        await fileService.deleteFile(
          path.join(
            fileService.uploadPath,
            "catering_payment",
            resultFileMove.filename
          )
        );
      }
      throw new AppError(
        "ID Reservasi tidak sesuai dengan reservasi aktif pengguna di kost ini.",
        400
      );
    }
    const transactionResult = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.pesananCatering.create({
        data: {
          user_id: userId,
          reservasi_id: activeReservation.reservasi_id,
          total_harga: calculatedTotalPrice,
          status: "PENDING",
          catatan: catatan,
        },
      });

      const detailOrderData = menuDetailsToCreate.map((detail) => ({
        ...detail,
        pesanan_id: newOrder.pesanan_id,
      }));

      await tx.detailPesananCatering.createMany({
        data: detailOrderData,
      });

      const fetchedDetailOrders = await tx.detailPesananCatering.findMany({
        where: {
          pesanan_id: newOrder.pesanan_id,
        },
        include: {
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
                    select: {
                      kost_id: true,
                      nama_kost: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const newPayment = await tx.pembayaranCatering.create({
        data: {
          pesanan_id: newOrder.pesanan_id,
          jumlah: calculatedTotalPrice,
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
          "catering_payment",
          resultFileMove.filename
        )
      );
    }
    console.error(
      "Error in createCateringOrderWithPayment (multi-menu):",
      error
    );
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Gagal membuat pesanan catering dan pembayaran: ${error.message}`,
      500
    );
  }
};

module.exports = {
  getCateringHistoryForTenant,
  createCateringOrderWithPayment,
};
