const router = require("express").Router();
const ctrl = require("../../controllers/helpController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.post("/", authenticate, authorize("customer"), ctrl.create);
router.get("/mine", authenticate, authorize("customer"), ctrl.myHistory);
router.get("/active", authenticate, authorize("waiter", "admin", "manager", "receptionist"), ctrl.active);
router.patch("/:id/resolve", authenticate, authorize("customer", "waiter", "admin", "manager", "receptionist"), ctrl.resolve);

module.exports = router;
