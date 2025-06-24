const express = require("express");
const router = express.Router();
const reservasiController = require("../controllers/reservasiController");
const {
  validateCreateReservation,
  validateUpdateReservationStatus,
  validateExtendReservation,
  validateGetKostReservations,
} = require("../validators/reservasiValidator");
const { authenticateJWT } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { handleValidationErrors } = require("../middleware/validation");

router.use(authenticateJWT);

router.post(
  "/",
  upload.single("bukti_bayar", "reservation_payment"),
  validateCreateReservation,
  handleValidationErrors,
  reservasiController.createReservation
);

router.put(
  "/:id/extend",
  upload.single("bukti_bayar", "reservation_payment"),
  validateExtendReservation,
  handleValidationErrors,
  reservasiController.extendReservation
);

router.get(
  "/penghuni",
  handleValidationErrors,
  reservasiController.getReservations
);

router.get(
  "/:kostId",
  handleValidationErrors,
  reservasiController.getReservationsForSpecificKostByUser
);

router.get(
  "/detail/:id",
  validateUUID("id"),
  handleValidationErrors,
  reservasiController.getReservationDetailById
);

router.patch(
  "/:id/status",
  validateUpdateReservationStatus,
  handleValidationErrors,
  reservasiController.updateReservationStatus
);

router.get(
  "/pengelola/:kostId",
  handleValidationErrors,
  reservasiController.getManagedKostReservations
);

module.exports = router;
