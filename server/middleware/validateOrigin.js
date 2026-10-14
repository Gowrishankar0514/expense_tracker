function validateOrigin(req, res, next) {
  const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

  const origin = req.get("Origin");

  // Allow non-browser development tools such as Thunder Client.
  if (!origin && process.env.NODE_ENV !== "production") {
    return next();
  }

  if (!origin || origin !== allowedOrigin) {
    return res.status(403).json({
      error: {
        code: "INVALID_ORIGIN",
        message: "This request origin is not allowed.",
        details: [],
      },
    });
  }

  next();
}

module.exports = validateOrigin;
