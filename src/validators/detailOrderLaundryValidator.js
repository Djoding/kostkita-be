const { body, param } = require("express-validator");

const orderIdValidator = [
    param("id").isUUID().withMessage("Valid order ID (UUID) is required"),
];

const updateLaundryOrderStatusValidator = [
    param("id").isUUID().withMessage("Valid order ID (UUID) is required"),

    body("status")
        .isIn(["PENDING", "DITERIMA", "PROSES", "SELESAI", "DIAMBIL", "DIBATALKAN"])
        .withMessage("Invalid status. Must be PENDING, DITERIMA, PROSES, SELESAI, DIAMBIL, or DIBATALKAN"),

    body("berat_actual")
        .optional()
        .isNumeric()
        .withMessage("Berat actual must be a valid number")
        .custom((value) => {
            if (value !== undefined && parseFloat(value) <= 0) {
                throw new Error("Berat actual must be greater than 0");
            }
            return true;
        }),

    body("total_final")
        .optional()
        .isNumeric()
        .withMessage("Total final must be a valid number")
        .custom((value) => {
            if (value !== undefined && parseFloat(value) <= 0) {
                throw new Error("Total final must be greater than 0");
            }
            return true;
        }),

    body("estimasi_selesai")
        .optional()
        .isISO8601()
        .withMessage("Estimasi selesai must be a valid ISO8601 date")
        .custom((value) => {
            if (value) {
                const inputDate = new Date(value);
                const now = new Date();
                if (inputDate <= now) {
                    throw new Error("Estimasi selesai must be in the future");
                }
            }
            return true;
        }),

    body("notes")
        .optional()
        .isString()
        .withMessage("Notes must be a string")
        .isLength({ max: 500 })
        .withMessage("Notes must not exceed 500 characters"),

    body()
        .custom((body) => {
            const { status, berat_actual, total_final } = body;

            if (status === "PROSES" && (!berat_actual || !total_final)) {
                throw new Error("Berat actual and total final are required when status is PROSES");
            }

            return true;
        }),
];

const cancelLaundryOrderValidator = [
    param("id").isUUID().withMessage("Valid order ID (UUID) is required"),

    body("reason")
        .optional()
        .isString()
        .withMessage("Reason must be a string")
        .isLength({ min: 10, max: 500 })
        .withMessage("Reason must be between 10 and 500 characters"),
];

const markAsPickedUpValidator = [
    param("id").isUUID().withMessage("Valid order ID (UUID) is required"),
];

module.exports = {
    orderIdValidator,
    updateLaundryOrderStatusValidator,
    cancelLaundryOrderValidator,
    markAsPickedUpValidator,
};