const express = require("express");

const {
  register,
  login,
  me,
  logout,
} = require("../controllers/authController");

const validateRegistration = require("../middleware/validateRegistration");
const validateLogin = require("../middleware/validateLogin");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

module.exports = router;
