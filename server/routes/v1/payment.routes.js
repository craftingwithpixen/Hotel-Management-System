const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/paymentController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

// Webhook must use express.raw() for HMAC-SHA256 signature verification
router.post("/webhook", express.raw({ type: "application/json" }), ctrl.webhook);

router.post("/create-order", authenticate, ctrl.createOrder);
router.post("/verify", authenticate, ctrl.verify);
router.post("/cash", authenticate, authorize("admin", "receptionist"), ctrl.cash);
router.post("/refund", authenticate, authorize("admin", "receptionist"), ctrl.refund);
router.get("/:id", authenticate, authorize("admin", "receptionist"), ctrl.getById);

module.exports = router;
