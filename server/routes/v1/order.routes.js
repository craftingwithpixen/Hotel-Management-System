const router = require("express").Router();
const ctrl = require("../../controllers/orderController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.post("/", authenticate, ctrl.create);
router.get("/", authenticate, authorize("admin", "manager", "receptionist", "waiter"), ctrl.list);
router.get("/kitchen", authenticate, authorize("admin", "chef"), ctrl.kitchen);
router.get("/:id", authenticate, ctrl.getById);
router.get("/table/:tableId", authenticate, authorize("admin", "manager", "receptionist", "waiter"), ctrl.getByTable);
router.put("/:id/items", authenticate, authorize("admin", "waiter"), ctrl.updateItems);
router.put("/:id/status", authenticate, authorize("admin", "chef"), ctrl.updateStatus);
router.put("/:id/item-status", authenticate, authorize("admin", "chef"), ctrl.updateItemStatus);
router.post("/:id/kot", authenticate, authorize("admin", "waiter"), ctrl.printKOT);
router.get("/:id/track", authenticate, ctrl.track);

module.exports = router;
