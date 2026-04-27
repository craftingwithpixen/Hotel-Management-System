const router = require("express").Router();
const ctrl = require("../../controllers/billingController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.post("/generate", authenticate, authorize("admin", "receptionist"), ctrl.generate);
router.get("/my", authenticate, ctrl.myBills);
router.get("/", authenticate, authorize("admin", "receptionist"), ctrl.list);
router.get("/:id", authenticate, ctrl.getById);
router.get("/:id/pdf", authenticate, ctrl.getPdf);
router.post("/:id/discount", authenticate, authorize("admin", "receptionist"), ctrl.applyDiscount);
router.post("/:id/coupon", authenticate, ctrl.applyCoupon);
router.post("/:id/loyalty", authenticate, ctrl.applyLoyalty);
router.post("/:id/split", authenticate, authorize("admin", "receptionist"), ctrl.split);

module.exports = router;
