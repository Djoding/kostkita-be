const { body, param } = require("express-validator");

const orderIdValidator = [
    param("id").isUUID().withMessage("Valid order ID (UUID) is required"),
];

const updateCateringOrderStatusValidator = [
    param("id").isUUID().withMessage("Valid order ID (UUID) is required"),

    body("status")
        .isIn(["PENDING", "PROSES", "DITERIMA", "SELESAI", "DIBATALKAN"])
        .withMessage("Invalid status. Must be PENDING, PROSES, DITERIMA, SELESAI, or DIBATALKAN"),

    body("notes")
        .optional()
        .isString()
        .withMessage("Notes must be a string")
        .isLength({ max: 500 })
        .withMessage("Notes must not exceed 500 characters"),
];

const cancelCateringOrderValidator = [
    param("id").isUUID().withMessage("Valid order ID (UUID) is required"),

    body("reason")
        .optional()
        .isString()
        .withMessage("Reason must be a string")
        .isLength({ min: 10, max: 500 })
        .withMessage("Reason must be between 10 and 500 characters"),
];

module.exports = {
    orderIdValidator,
    updateCateringOrderStatusValidator,
    cancelCateringOrderValidator,
};