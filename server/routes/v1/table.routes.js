const router = require("express").Router();
const ctrl = require("../../controllers/tableController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get("/", authenticate, ctrl.list);
router.get("/:id", authenticate, ctrl.getById);
router.post("/", authenticate, authorize("admin", "manager"), ctrl.create);
router.put("/:id", authenticate, authorize("admin", "manager"), ctrl.update);
router.delete("/:id", authenticate, authorize("admin", "manager"), ctrl.delete);
router.put("/:id/status", authenticate, authorize("admin", "manager", "receptionist"), ctrl.updateStatus);
router.post("/:id/qr", authenticate, authorize("admin", "manager"), ctrl.regenerateQR);
router.get("/:id/qr/download", authenticate, authorize("admin", "manager"), ctrl.downloadQR);

module.exports = router;
