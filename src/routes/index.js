const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const orderCateringRoutes = require("./orderCateringRoutes");
const orderLaundryRoutes = require("./orderLaundryRoutes");
const masterRoutes = require("./masterRoutes");
const kostRoutes = require("./kostRoutes");
const reservasiRoutes = require("./reservasiRoutes");
const cateringRoutes = require("./cateringRoutes");
const laundryRoutes = require("./laundryRoutes");
const historyRoutes = require("./historyRoutes");

const router = express.Router();

router.get("/docs", (req, res) => {
  res.json({
    success: true,
    message: "API Documentation",
    version: "v1",
    endpoints: {
      authentication: {
        base: "/auth",
        description: "User authentication and authorization",
        routes: [
          "POST /auth/register - Register new user",
          "POST /auth/login - User login",
          "POST /auth/refresh-token - Refresh access token",
          "GET /auth/google - Google OAuth login",
          "GET /auth/google/callback - Google OAuth callback",
          "GET /auth/profile - Get user profile (Protected)",
          "PUT /auth/profile - Update user profile (Protected)",
          "POST /auth/change-password - Change password (Protected)",
          "POST /auth/logout - User logout (Protected)",
          "POST /auth/request-password-reset - Request password reset",
          "GET /auth/verify-email/:token - Verify email address",
        ],
      },
      users: {
        base: "/users",
        description: "User management (Admin only)",
        routes: [
          "GET /users - Get all users with pagination",
          "GET /users/stats - Get user statistics",
          "GET /users/search - Search users",
          "GET /users/:id - Get user by ID",
          "PUT /users/:id - Update user",
          "DELETE /users/:id - Delete user",
          "PATCH /users/:id/approve - Approve/reject user",
        ],
      },
      master: {
        base: "/master",
        description: "Master data management",
        routes: [
          "GET /master/all - Get all master data (Public)",
          "GET /master/fasilitas - Get all fasilitas (Public)",
          "GET /master/tipe-kamar - Get all tipe kamar (Public)",
          "GET /master/peraturan - Get all peraturan (Public)",
          "GET /master/layanan-laundry - Get all layanan laundry (Public)",
          "GET /master/summary - Get master data summary (Admin only)",
          "POST /master/fasilitas - Create fasilitas (Admin only)",
          "PUT /master/fasilitas/:id - Update fasilitas (Admin only)",
          "DELETE /master/fasilitas/:id - Delete fasilitas (Admin only)",
        ],
      },
      kost: {
        base: "/kost",
        description: "Kost management",
        routes: [
          "GET /kost - Get all kost (Public)",
          "GET /kost/:id - Get kost by ID (Public)",
          'GET /kost/:id/fasilitas - Get kost fasilitas (Public)',
          'GET /kost/:kost_id/peraturan - Get kost peraturan (Public)',
          "GET /kost/owner - Get kost by logged-in owner (Pengelola only)",
          "POST /kost - Create kost (Pengelola/Admin)",
          "PUT /kost/:id - Update kost (Pengelola/Admin)",
          "DELETE /kost/:id - Delete kost (Admin only)",
        ],
      },
      catering: {
        base: "/catering",
        description: "Catering management",
        routes: [
          "GET /catering?kost_id=uuid - Get catering list by kost (Pengelola & Penghuni)",
          "POST /catering - Create catering (Pengelola only)",
          "GET /catering/:id/menu - Get catering menu (Pengelola & Penghuni)",
          "POST /catering/:id/menu - Add catering menu item (Pengelola only)",
          "PUT /catering/:catering_id/menu/:menu_id - Update catering menu item (Pengelola only)",
          "DELETE /catering/:catering_id/menu/:menu_id - Delete catering menu item (Pengelola only)",
          "GET /catering/orders - Get user orders (Pengelola only)",
          "GET /catering/orders/:id - Get user order detail (Pengelola only)",
          "PATCH /catering/orders/:id/status - Update order status (Pengelola only)",
          "GET /order/catering/:id - Get catering order detail (Authenticated)",
          "PATCH /order/catering/:id/status - Update order status (Pengelola only)",
          "POST /order/catering/:id/cancel - Cancel order (Penghuni only)",
        ],
      },
      laundry: {
        base: "/laundry",
        description: "Laundry management",
        routes: [
          "GET /laundry?kost_id=uuid - Get laundry list by kost (Pengelola & Penghuni)",
          "POST /laundry - Create laundry (Pengelola only)",
          "GET /laundry/:id/services - Get laundry services & pricing (Pengelola & Penghuni)",
          "POST /laundry/:id/services - Create laundry service & pricing (Pengelola only)",
          "PUT /laundry/:id/services/:layanan_id - Update laundry service & pricing (Pengelola only)",
          "DELETE /laundry/:id/services/:layanan_id - Delete laundry service & pricing (Pengelola only)",
          "GET /laundry/orders - Get all user orders (Pengelola only)",
          "GET /laundry/orders/:id - Get user order detail (Pengelola only)",
          "PATCH /laundry/orders/:id/status - Update order status (Pengelola only)",
          "GET /order/laundry/:id - Get laundry order detail (Authenticated)",
          "PATCH /order/laundry/:id/status - Update order status (Pengelola only)",
          "POST /order/laundry/:id/cancel - Cancel order (Penghuni only)",
          "POST /order/laundry/:id/pickup - Mark as picked up (Pengelola only)",
        ],
      },
      history: {
        base: "/history",
        description: "User activity history",
        routes: [
          "GET /history/reservations - Get user reservation history (Authenticated)",
          "GET /history/catering - Get user catering order history (Authenticated)",
          "GET /history/laundry - Get user laundry order history (Authenticated)",
          "GET /history/complete - Get complete user activity history (Authenticated)",
          "GET /history/stats - Get user history statistics (Authenticated)",
        ],
      },
    },
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer <token>",
      note: "Include access token in Authorization header for protected routes",
    },
    responses: {
      success: {
        format: {
          success: true,
          message: "string",
          data: "object|array",
        },
      },
      error: {
        format: {
          success: false,
          message: "string",
          errors: "array (optional)",
        },
      },
    },
  });
});

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Kosan Management API v1",
    timestamp: new Date().toISOString(),
    available_endpoints: [
      "/auth - Authentication routes",
      "/users - User management routes",
      "/master - Master data routes",
      "/docs - API documentation",
      "/kost - Kost management routes",
      "/order/catering - Catering order routes",
      "/order/laundry - Laundry order routes",
      "/reservasi - Reservasi routes",
      "/catering - Catering management routes",
      "/laundry - Laundry management routes",
      "/history - User activity history routes",
    ],
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/master", masterRoutes);
router.use("/order/catering", orderCateringRoutes);
router.use("/order/laundry", orderLaundryRoutes);
router.use("/kost", kostRoutes);
router.use("/reservasi", reservasiRoutes);
router.use("/catering", cateringRoutes);
router.use("/laundry", laundryRoutes);
router.use("/history", historyRoutes);

router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    available_endpoints: [
      "/api/v1/auth",
      "/api/v1/users",
      "/api/v1/master",
      "/api/v1/docs",
      "/api/v1/kost",
      "/api/v1/order/catering",
      "/api/v1/order/laundry",
      "/api/v1/reservasi",
      "/api/v1/catering",
      "/api/v1/laundry",
      "/api/v1/history",
    ],
  });
});

module.exports = router;