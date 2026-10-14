const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const validateOrigin = require("../middleware/validateOrigin");
const { getSummary } = require("../controllers/dashboardController");

const router = express.Router();

router.use(validateOrigin);
router.use(requireAuth);

router.get("/summary", getSummary);

module.exports = router;
