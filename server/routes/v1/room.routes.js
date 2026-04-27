const router = require("express").Router();
const ctrl = require("../../controllers/roomController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", authenticate, authorize("admin", "manager", "receptionist"), ctrl.create);
router.put("/:id", authenticate, authorize("admin", "manager", "receptionist"), ctrl.update);
router.delete("/:id", authenticate, authorize("admin", "manager"), ctrl.delete);
router.put("/:id/status", authenticate, authorize("admin", "manager", "receptionist"), ctrl.updateStatus);
router.put("/:id/cleaning", authenticate, authorize("admin", "manager", "receptionist"), ctrl.updateCleaning);
router.get("/:id/bookings", authenticate, authorize("admin", "manager", "receptionist"), ctrl.getRoomBookings);

module.exports = router;
