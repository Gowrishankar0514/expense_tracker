const { registerUser, loginUser } = require("../services/authService");

async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
}
async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const user = await loginUser(req.body);

    // Prevent session fixation by issuing a new session ID.
    req.session.regenerate((error) => {
      if (error) {
        return next(error);
      }

      req.session.userId = user.id;

      req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }

        return res.status(200).json({
          success: true,
          message: "Login successful.",
          user,
        });
      });
    });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("spendwise.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  });
}

module.exports = { register, login, me, logout };
