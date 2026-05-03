const router = require("express").Router();
const ctrl = require("../../controllers/inventoryController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get("/", authenticate, authorize("admin", "manager", "chef"), ctrl.list);
router.get("/alerts", authenticate, authorize("admin", "manager"), ctrl.alerts);
router.get("/requests", authenticate, authorize("admin", "manager"), ctrl.listRequests);
router.post("/requests", authenticate, authorize("chef"), ctrl.createRequest);
router.post("/consume-today", authenticate, authorize("admin", "manager", "chef"), ctrl.consumeToday);
router.patch("/requests/:id", authenticate, authorize("admin", "manager"), ctrl.updateRequest);
router.get("/:id", authenticate, authorize("admin", "manager", "chef"), ctrl.getById);
router.post("/", authenticate, authorize("admin", "manager"), ctrl.create);
router.put("/:id", authenticate, authorize("admin", "manager"), ctrl.update);
router.delete("/:id", authenticate, authorize("admin", "manager"), ctrl.delete);
router.post("/:id/restock", authenticate, authorize("admin", "manager"), ctrl.restock);
router.post("/:id/consume", authenticate, authorize("admin", "manager", "chef"), ctrl.consume);

module.exports = router;
