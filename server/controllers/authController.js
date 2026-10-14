const { generateToken } = require("../utils/jwt");
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

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user,
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

function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
}

module.exports = { register, login, me, logout };
