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
  upload.single("bukti_bayar", "temp"),
  validateCreateReservation,
  handleValidationErrors,
  reservasiController.createReservation
);

router.get(
  "/penghuni",
  handleValidationErrors,
  reservasiController.getReservations
);

router.patch(
  "/:id/status",
  validateUpdateReservationStatus,
  handleValidationErrors,
  reservasiController.updateReservationStatus
);

router.put(
  "/:id/extend",
  upload.single("bukti_bayar", "temp"),
  validateExtendReservation,
  handleValidationErrors,
  reservasiController.extendReservation
);

router.get(
  "/pengelola/:kostId",
  handleValidationErrors,
  reservasiController.getManagedKostReservations
);

module.exports = router;
