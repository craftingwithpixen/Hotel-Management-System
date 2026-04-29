const router = require("express").Router();
const ctrl = require("../../controllers/roomController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const upload = require("../../middleware/uploadMiddleware");

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", authenticate, authorize("admin", "manager"), ctrl.create);
router.put("/:id", authenticate, authorize("admin", "manager"), ctrl.update);
router.delete("/:id", authenticate, authorize("admin", "manager"), ctrl.delete);
router.put("/:id/status", authenticate, authorize("admin", "manager"), ctrl.updateStatus);
router.put("/:id/cleaning", authenticate, authorize("admin", "manager"), ctrl.updateCleaning);
router.post("/:id/image", authenticate, authorize("admin", "manager"), upload.single("image"), ctrl.uploadImage);
router.get("/:id/bookings", authenticate, authorize("admin", "manager"), ctrl.getRoomBookings);

module.exports = router;
