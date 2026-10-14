function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed" && err.status === 400) {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "The request body contains invalid JSON.",
        details: [],
      },
    });
  }

  if (err.statusCode === 409 && err.code === "EMAIL_ALREADY_EXISTS") {
    return res.status(409).json({
      error: {
        code: err.code,
        message: err.message,
        details: [],
      },
    });
  }
  if (err.statusCode === 401 && err.code === "INVALID_CREDENTIALS") {
    return res.status(401).json({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password.",
        details: [],
      },
    });
  }

  // Log internal details on the server only.
  console.error("Request error:", err.message);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
      details: [],
    },
  });
}

module.exports = errorHandler;
