const router = require("express").Router();
const ctrl = require("../../controllers/reportController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get("/daily", authenticate, authorize("admin"), ctrl.daily);
router.get("/monthly", authenticate, authorize("admin"), ctrl.monthly);
router.get("/occupancy", authenticate, authorize("admin"), ctrl.occupancy);
router.get("/table-usage", authenticate, authorize("admin"), ctrl.tableUsage);
router.get("/inventory", authenticate, authorize("admin"), ctrl.inventory);
router.get("/staff-performance", authenticate, authorize("admin"), ctrl.staffPerformance);
router.get("/top-menu-items", authenticate, authorize("admin"), ctrl.topMenuItems);

module.exports = router;
