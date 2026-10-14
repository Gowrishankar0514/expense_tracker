function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  const details = [];

  if (typeof email !== "string" || !email.trim()) {
    details.push({
      field: "email",
      message: "Email is required.",
    });
  } else if (email.trim().length > 255) {
    details.push({
      field: "email",
      message: "Email is too long.",
    });
  }

  if (typeof password !== "string" || !password.length) {
    details.push({
      field: "password",
      message: "Password is required.",
    });
  } else if (password.length < 8) {
    details.push({
      field: "password",
      message: "Password must contain at least 8 characters.",
    });
  } else if (password.length > 72) {
    details.push({
      field: "password",
      message: "Password must not exceed 72 characters.",
    });
  } else {
    if (!/[A-Z]/.test(password)) {
      details.push({
        field: "password",
        message: "Password must contain at least one uppercase letter.",
      });
    }

    if (!/[^A-Za-z0-9\s]/.test(password)) {
      details.push({
        field: "password",
        message: "Password must contain at least one special character.",
      });
    }
  }

  if (details.length > 0) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please check the submitted fields.",
        details,
      },
    });
  }

  next();
}

module.exports = validateLogin;
