const router = require("express").Router();
const ctrl = require("../../controllers/menuController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get("/", ctrl.list);
router.get("/categories", ctrl.categories);
router.get("/:id", ctrl.getById);
router.post("/", authenticate, authorize("admin", "manager", "chef"), ctrl.create);
router.put("/:id", authenticate, authorize("admin", "manager", "chef"), ctrl.update);
router.delete("/:id", authenticate, authorize("admin", "manager"), ctrl.delete);
router.put("/:id/toggle", authenticate, authorize("admin", "manager", "chef"), ctrl.toggle);
router.post("/combo", authenticate, authorize("admin", "manager"), ctrl.createCombo);

module.exports = router;
