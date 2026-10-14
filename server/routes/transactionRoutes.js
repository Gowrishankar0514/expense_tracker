const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const validateOrigin = require("../middleware/validateOrigin");
const validateTransaction = require("../middleware/validateTransaction");
const controller = require("../controllers/transactionController");

const router = express.Router();

router.use(validateOrigin);
router.use(requireAuth);

router.post("/", validateTransaction, controller.create);
router.get("/", controller.list);
router.put("/:id", validateTransaction, controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
