const pool = require("../config/db");
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

async function me(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE id = $1`,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load profile.",
    });
  }
}

function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
}

module.exports = { register, login, me, logout };
