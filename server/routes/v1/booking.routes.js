const router = require("express").Router();
const ctrl = require("../../controllers/bookingController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.post("/room", authenticate, ctrl.createRoomBooking);
router.post("/table", authenticate, ctrl.createTableBooking);
router.get("/my", authenticate, ctrl.getMyBookings);
router.get("/", authenticate, authorize("admin", "manager", "receptionist"), ctrl.list);
router.get("/available-rooms", ctrl.availableRooms);
router.get("/available-tables", ctrl.availableTables);
router.get("/:id", authenticate, authorize("admin", "manager", "receptionist"), ctrl.getById);
router.put("/:id/confirm", authenticate, authorize("admin", "manager", "receptionist"), ctrl.confirm);
router.put("/:id/checkin", authenticate, authorize("admin", "manager", "receptionist"), ctrl.checkIn);
router.put("/:id/checkout", authenticate, authorize("admin", "manager", "receptionist"), ctrl.checkOut);
router.put("/:id/cancel", authenticate, ctrl.cancel);

module.exports = router;
