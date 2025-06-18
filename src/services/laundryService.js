const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");
const fileService = require("./fileService");

class LaundryService {
  /**
   * Get laundry list by kost - accessible by both Pengelola & Penghuni
   */
  async getLaundrysByKost(kostId, userRole, userId) {
    // Verify user has access to this kost
    if (userRole === "PENGELOLA") {
      const kost = await prisma.kost.findFirst({
        where: {
          kost_id: kostId,
          pengelola_id: userId,
        },
      });

      if (!kost) {
        throw new AppError("You are not authorized to access this kost", 403);
      }
    } else if (userRole === "PENGHUNI") {
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
          "You do not have active reservation in this kost",
          403
        );
      }
    } else {
      throw new AppError("Unauthorized access", 403);
    }

    const laundries = await prisma.laundry.findMany({
      where: {
        kost_id: kostId,
        is_active: true,
      },
      include: {
        kost: {
          select: {
            kost_id: true,
            nama_kost: true,
            alamat: true,
          },
        },
        _count: {
          select: {
            laundry_harga: {
              where: { is_available: true },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return laundries.map((laundry) => ({
      ...laundry,
      qris_image_url: laundry.qris_image
        ? fileService.generateFileUrl(laundry.qris_image)
        : null,
      services_count: laundry._count.laundry_harga,
    }));
  }

  /**
   * Create laundry - Pengelola only
   */
  async createLaundry(data, pengelolaId) {
    const {
      kost_id,
      nama_laundry,
      alamat,
      whatsapp_number,
      qris_image,
      rekening_info,
      is_partner,
    } = data;

    // Verify pengelola owns the kost
    const kost = await prisma.kost.findFirst({
      where: {
        kost_id,
        pengelola_id: pengelolaId,
      },
    });

    if (!kost) {
      throw new AppError(
        "You are not authorized to add laundry to this kost",
        403
      );
    }

    // Check if laundry with same name exists in this kost
    const existingLaundry = await prisma.laundry.findFirst({
      where: {
        kost_id,
        nama_laundry,
        is_active: true,
      },
    });

    if (existingLaundry) {
      throw new AppError(
        "Laundry with this name already exists in this kost",
        409
      );
    }

    const laundry = await prisma.laundry.create({
      data: {
        kost_id,
        nama_laundry,
        alamat,
        whatsapp_number,
        qris_image,
        rekening_info,
        is_partner: is_partner || false,
        is_active: true,
      },
      include: {
        kost: {
          select: {
            kost_id: true,
            nama_kost: true,
          },
        },
      },
    });

    logger.info(`New laundry created: ${nama_laundry} for kost: ${kost_id}`);

    return {
      ...laundry,
      qris_image_url: laundry.qris_image
        ? fileService.generateFileUrl(laundry.qris_image)
        : null,
    };
  }

  /**
   * Get laundry services & pricing - accessible by both Pengelola & Penghuni
   */
  async getLaundryServices(laundryId, userRole, userId) {
    const laundry = await prisma.laundry.findUnique({
      where: { laundry_id: laundryId },
      include: {
        kost: {
          select: {
            kost_id: true,
            nama_kost: true,
            pengelola_id: true,
          },
        },
      },
    });

    if (!laundry) {
      throw new AppError("Laundry not found", 404);
    }

    // Verify user has access
    if (userRole === "PENGELOLA") {
      if (laundry.kost.pengelola_id !== userId) {
        throw new AppError(
          "You are not authorized to access this laundry",
          403
        );
      }
    } else if (userRole === "PENGHUNI") {
      const activeReservation = await prisma.reservasi.findFirst({
        where: {
          user_id: userId,
          kost_id: laundry.kost.kost_id,
          status: "APPROVED",
          status_penghunian: "AKTIF",
        },
      });

      if (!activeReservation) {
        throw new AppError(
          "You do not have active reservation in this kost",
          403
        );
      }
    }

    const services = await prisma.laundryHarga.findMany({
      where: {
        laundry_id: laundryId,
        ...(userRole === "PENGHUNI" && { is_available: true }),
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
      orderBy: {
        layanan: {
          nama_layanan: "asc",
        },
      },
    });

    return {
      laundry: {
        ...laundry,
        qris_image_url: laundry.qris_image
          ? fileService.generateFileUrl(laundry.qris_image)
          : null,
      },
      services,
    };
  }

  /**
   * Create laundry services & pricing - Pengelola only
   */
  async createLaundryService(laundryId, serviceData, pengelolaId) {
    // Verify laundry belongs to pengelola
    const laundry = await prisma.laundry.findFirst({
      where: {
        laundry_id: laundryId,
        kost: {
          pengelola_id: pengelolaId,
        },
      },
    });

    if (!laundry) {
      throw new AppError("Laundry not found or you are not authorized", 403);
    }

    const { layanan_id, harga_per_satuan, is_available } = serviceData;

    // Check if layanan exists
    const layanan = await prisma.masterLayananLaundry.findUnique({
      where: { layanan_id },
    });

    if (!layanan) {
      throw new AppError(`Layanan with ID ${layanan_id} not found`, 404);
    }

    // Check if service already exists for this laundry
    const existingService = await prisma.laundryHarga.findFirst({
      where: {
        laundry_id: laundryId,
        layanan_id,
      },
    });

    if (existingService) {
      throw new AppError("Service already exists for this laundry", 409);
    }

    // Create the service pricing
    const result = await prisma.laundryHarga.create({
      data: {
        laundry_id: laundryId,
        layanan_id,
        harga_per_satuan,
        is_available: is_available !== undefined ? is_available : true,
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

    logger.info(
      `New laundry service created for laundry: ${laundryId}, layanan: ${layanan_id}`
    );
    return result;
  }

  /**
   * Update single laundry service & pricing - Pengelola only
   */
  async updateLaundryService(laundryId, layananId, serviceData, pengelolaId) {
    // Verify laundry belongs to pengelola
    const laundry = await prisma.laundry.findFirst({
      where: {
        laundry_id: laundryId,
        kost: {
          pengelola_id: pengelolaId,
        },
      },
    });

    if (!laundry) {
      throw new AppError("Laundry not found or you are not authorized", 403);
    }

    // Check if layanan exists
    const layanan = await prisma.masterLayananLaundry.findUnique({
      where: { layanan_id: layananId },
    });

    if (!layanan) {
      throw new AppError(`Layanan with ID ${layananId} not found`, 404);
    }

    // Check if service exists for this laundry
    const existingService = await prisma.laundryHarga.findFirst({
      where: {
        laundry_id: laundryId,
        layanan_id: layananId,
      },
    });

    if (!existingService) {
      throw new AppError("Service not found for this laundry", 404);
    }

    const { harga_per_satuan, is_available } = serviceData;

    // Update the service pricing
    const result = await prisma.laundryHarga.update({
      where: { harga_id: existingService.harga_id },
      data: {
        ...(harga_per_satuan !== undefined && { harga_per_satuan }),
        ...(is_available !== undefined && { is_available }),
        updated_at: new Date(),
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

    logger.info(
      `Laundry service updated: ${existingService.harga_id} for laundry: ${laundryId}`
    );
    return result;
  }

  /**
   * Delete laundry service & pricing - Pengelola only
   */
  async deleteLaundryService(laundryId, layananId, pengelolaId) {
    // Verify laundry belongs to pengelola
    const laundry = await prisma.laundry.findFirst({
      where: {
        laundry_id: laundryId,
        kost: {
          pengelola_id: pengelolaId,
        },
      },
    });

    if (!laundry) {
      throw new AppError("Laundry not found or you are not authorized", 403);
    }

    const service = await prisma.laundryHarga.findFirst({
      where: {
        laundry_id: laundryId,
        layanan_id: layananId,
      },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    // Soft delete by setting is_available to false
    await prisma.laundryHarga.update({
      where: { harga_id: service.harga_id },
      data: {
        is_available: false,
        updated_at: new Date(),
      },
    });

    logger.info(`Laundry service deleted: ${service.harga_id}`);
    return true;
  }

  /**
   * Get laundry orders for pengelola
   */
  async getLaundryOrders(pengelolaId, filters = {}) {
    const { status, laundry_id, start_date, end_date } = filters;

    const where = {
      laundry: {
        kost: {
          pengelola_id: pengelolaId,
        },
      },
    };

    if (status) where.status = status;
    if (laundry_id) where.laundry_id = laundry_id;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at.gte = new Date(start_date);
      if (end_date) where.created_at.lte = new Date(end_date);
    }

    const orders = await prisma.pesananLaundry.findMany({
      where,
      include: {
        user: {
          select: {
            user_id: true,
            full_name: true,
            phone: true,
            whatsapp_number: true,
          },
        },
        laundry: {
          select: {
            laundry_id: true,
            nama_laundry: true,
            alamat: true,
            whatsapp_number: true,
          },
        },
        detail_pesanan_laundry: {
          include: {
            layanan: {
              select: {
                layanan_id: true,
                nama_layanan: true,
                satuan: true,
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
  }

  /**
   * Get laundry order detail for pengelola
   */
  async getLaundryOrderDetail(orderId, pengelolaId) {
    const order = await prisma.pesananLaundry.findFirst({
      where: {
        pesanan_id: orderId,
        laundry: {
          kost: {
            pengelola_id: pengelolaId,
          },
        },
      },
      include: {
        user: {
          select: {
            user_id: true,
            full_name: true,
            phone: true,
            whatsapp_number: true,
            email: true,
          },
        },
        laundry: {
          select: {
            laundry_id: true,
            nama_laundry: true,
            alamat: true,
            whatsapp_number: true,
          },
        },
        detail_pesanan_laundry: {
          include: {
            layanan: {
              select: {
                layanan_id: true,
                nama_layanan: true,
                satuan: true,
              },
            },
          },
        },
        pembayaran: true,
      },
    });

    if (!order) {
      throw new AppError("Order not found or you are not authorized", 404);
    }

    return {
      ...order,
      pembayaran: order.pembayaran
        ? {
            ...order.pembayaran,
            bukti_bayar_url: order.pembayaran.bukti_bayar
              ? fileService.generateFileUrl(order.pembayaran.bukti_bayar)
              : null,
          }
        : null,
    };
  }

  /**
   * Update order status - Pengelola only
   */
  async updateOrderStatus(orderId, statusData, pengelolaId) {
    const { status, total_final, berat_actual, estimasi_selesai } = statusData;

    // Verify order belongs to pengelola's laundry
    const order = await prisma.pesananLaundry.findFirst({
      where: {
        pesanan_id: orderId,
        laundry: {
          kost: {
            pengelola_id: pengelolaId,
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found or you are not authorized", 404);
    }

    const updateData = { status };

    // Only allow setting final values when status is PROSES or DITERIMA
    if (status === "PROSES" || status === "DITERIMA") {
      if (total_final !== undefined) updateData.total_final = total_final;
      if (berat_actual !== undefined) updateData.berat_actual = berat_actual;
      if (estimasi_selesai !== undefined)
        updateData.estimasi_selesai = new Date(estimasi_selesai);
    }

    const updatedOrder = await prisma.pesananLaundry.update({
      where: { pesanan_id: orderId },
      data: updateData,
    });

    logger.info(`Laundry order status updated: ${orderId} to ${status}`);
    return updatedOrder;
  }
}

module.exports = new LaundryService();
