const parseJsonFields = (fieldsToParse) => (req, res, next) => {
    fieldsToParse.forEach((field) => {
        if (req.body[field] && typeof req.body[field] === "string") {
            try {
                req.body[field] = JSON.parse(req.body[field]);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: `Format JSON tidak valid untuk field: ${field}`,
                    errors: [
                        { field: field, message: `Format JSON tidak valid: ${e.message}` },
                    ],
                });
            }
        }
    });
    next();
};

module.exports = parseJsonFields;
