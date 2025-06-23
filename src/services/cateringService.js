const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");
const fileService = require("./fileService");

class CateringService {
  /**
   * Get catering list by kost - accessible by both Pengelola & Penghuni
   */
  async getCateringsByKost(kostId, userRole, userId) {
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

    const caterings = await prisma.catering.findMany({
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
            menu: {
              where: { is_available: true },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return caterings.map((catering) => ({
      ...catering,
      qris_image_url: catering.qris_image
        ? fileService.generateFileUrl(catering.qris_image)
        : null,
      menu_count: catering._count.menu,
    }));
  }

  /**
   * Create catering - Pengelola only
   */
  async createCatering(data, pengelolaId) {
    const {
      kost_id,
      nama_catering,
      alamat,
      whatsapp_number,
      qris_image,
      rekening_info,
      is_partner,
    } = data;

    const kost = await prisma.kost.findFirst({
      where: { kost_id, pengelola_id: pengelolaId },
    });

    if (!kost) {
      throw new AppError("You are not authorized to add catering to this kost", 403);
    }

    const existingCatering = await prisma.catering.findFirst({
      where: {
        kost_id,
        nama_catering,
        is_active: true,
      },
    });

    if (existingCatering) {
      throw new AppError("Catering with this name already exists in this kost", 409);
    }

    const catering = await prisma.catering.create({
      data: {
        kost_id,
        nama_catering,
        alamat,
        whatsapp_number,
        qris_image, // save path directly
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

    logger.info(`New catering created: ${nama_catering} for kost: ${kost_id}`);
    return catering;
  }

  /**
   * Get catering menu - accessible by both Pengelola & Penghuni
   */
  async getCateringMenu(cateringId, userRole, userId) {
    const catering = await prisma.catering.findUnique({
      where: { catering_id: cateringId },
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

    if (!catering) throw new AppError("Catering not found", 404);

    if (userRole === "PENGELOLA") {
      if (catering.kost.pengelola_id !== userId) {
        throw new AppError("You are not authorized to access this catering", 403);
      }
    } else if (userRole === "PENGHUNI") {
      const activeReservation = await prisma.reservasi.findFirst({
        where: {
          user_id: userId,
          kost_id: catering.kost.kost_id,
          status: "APPROVED",
          status_penghunian: "AKTIF",
        },
      });

      if (!activeReservation) {
        throw new AppError("You do not have active reservation in this kost", 403);
      }
    }

    const menus = await prisma.cateringMenu.findMany({
      where: {
        catering_id: cateringId,
        ...(userRole === "PENGHUNI" && { is_available: true }),
      },
      orderBy: [{ kategori: "asc" }, { nama_menu: "asc" }],
    });

    return {
      catering,
      menus,
    };
  }

  /**
   * Add catering menu item - Pengelola only
   */
  async addCateringMenuItem(cateringId, menuData, pengelolaId) {
    const { nama_menu, kategori, harga, foto_menu, is_available } = menuData;

    // Verify catering belongs to pengelola
    const catering = await prisma.catering.findFirst({
      where: {
        catering_id: cateringId,
        kost: {
          pengelola_id: pengelolaId,
        },
      },
    });

    if (!catering) {
      throw new AppError("Catering not found or you are not authorized", 403);
    }

    // Check if menu with same name exists
    const existingMenu = await prisma.cateringMenu.findFirst({
      where: {
        catering_id: cateringId,
        nama_menu,
      },
    });

    if (existingMenu) {
      throw new AppError("Menu with this name already exists", 409);
    }

    const menu = await prisma.cateringMenu.create({
      data: {
        catering_id: cateringId,
        nama_menu,
        kategori,
        harga,
        foto_menu,
        is_available: is_available !== undefined ? is_available : true,
      },
    });

    logger.info(`New menu item added: ${nama_menu} to catering: ${cateringId}`);

    return {
      ...menu,
      foto_menu_url: menu.foto_menu
        ? fileService.generateFileUrl(menu.foto_menu)
        : null,
    };
  }

  /**
   * Update catering menu item - Pengelola only
   */
  async updateCateringMenuItem(menuId, updateData, pengelolaId) {
    // Verify menu belongs to pengelola's catering
    const menu = await prisma.cateringMenu.findFirst({
      where: {
        menu_id: menuId,
        catering: {
          kost: {
            pengelola_id: pengelolaId,
          },
        },
      },
    });

    if (!menu) {
      throw new AppError("Menu not found or you are not authorized", 403);
    }

    const updatedMenu = await prisma.cateringMenu.update({
      where: { menu_id: menuId },
      data: updateData,
    });

    return {
      ...updatedMenu,
      foto_menu_url: updatedMenu.foto_menu
        ? fileService.generateFileUrl(updatedMenu.foto_menu)
        : null,
    };
  }

  /**
   * Delete catering menu item - Pengelola only
   */
  async deleteCateringMenuItem(menuId, pengelolaId) {
    // Verify menu belongs to pengelola's catering
    const menu = await prisma.cateringMenu.findFirst({
      where: {
        menu_id: menuId,
        catering: {
          kost: {
            pengelola_id: pengelolaId,
          },
        },
      },
    });

    if (!menu) {
      throw new AppError("Menu not found or you are not authorized", 403);
    }

    // Soft delete by setting is_available to false
    await prisma.cateringMenu.update({
      where: { menu_id: menuId },
      data: { is_available: false },
    });

    logger.info(`Menu item deleted: ${menuId}`);
    return true;
  }

  /**
   * Get catering orders for pengelola
   */
  async getCateringOrders(pengelolaId, filters = {}) {
    const { status, catering_id, start_date, end_date } = filters;

    const where = {
      detail_pesanan: {
        some: {
          menu: {
            catering: {
              kost: {
                pengelola_id: pengelolaId,
              },
            },
          },
        },
      },
    };

    if (status) where.status = status;
    if (catering_id) {
      where.detail_pesanan.some.menu.catering_id = catering_id;
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at.gte = new Date(start_date);
      if (end_date) where.created_at.lte = new Date(end_date);
    }

    const orders = await prisma.pesananCatering.findMany({
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
        detail_pesanan: {
          include: {
            menu: {
              include: {
                catering: {
                  select: {
                    catering_id: true,
                    nama_catering: true,
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
      orderBy: { created_at: "desc" },
    });

    return orders.map((order) => ({
      ...order,
      detail_pesanan: order.detail_pesanan.map((detail) => ({
        ...detail,
        menu: {
          ...detail.menu,
          foto_menu_url: detail.menu.foto_menu
            ? fileService.generateFileUrl(detail.menu.foto_menu)
            : null,
        },
      })),
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
   * Get catering order detail for pengelola
   */
  async getCateringOrderDetail(orderId, pengelolaId) {
    const order = await prisma.pesananCatering.findFirst({
      where: {
        pesanan_id: orderId,
        detail_pesanan: {
          some: {
            menu: {
              catering: {
                kost: {
                  pengelola_id: pengelolaId,
                },
              },
            },
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
        detail_pesanan: {
          include: {
            menu: {
              include: {
                catering: {
                  select: {
                    catering_id: true,
                    nama_catering: true,
                    alamat: true,
                    whatsapp_number: true,
                  },
                },
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
      detail_pesanan: order.detail_pesanan.map((detail) => ({
        ...detail,
        menu: {
          ...detail.menu,
          foto_menu_url: detail.menu.foto_menu
            ? fileService.generateFileUrl(detail.menu.foto_menu)
            : null,
        },
      })),
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
  async updateOrderStatus(orderId, status, pengelolaId) {
    // Verify order belongs to pengelola's catering
    const order = await prisma.pesananCatering.findFirst({
      where: {
        pesanan_id: orderId,
        detail_pesanan: {
          some: {
            menu: {
              catering: {
                kost: {
                  pengelola_id: pengelolaId,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found or you are not authorized", 404);
    }

    const updatedOrder = await prisma.pesananCatering.update({
      where: { pesanan_id: orderId },
      data: { status },
    });

    logger.info(`Order status updated: ${orderId} to ${status}`);
    return updatedOrder;
  }
}

module.exports = new CateringService();
