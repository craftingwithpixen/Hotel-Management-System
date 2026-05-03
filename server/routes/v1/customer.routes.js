const router = require("express").Router();
const ctrl = require("../../controllers/customerController");
const authenticate = require("../../middleware/authenticate");

router.get("/profile", authenticate, ctrl.profile);
router.put("/profile", authenticate, ctrl.updateProfile);
router.get("/bookings", authenticate, ctrl.bookings);
router.get("/orders", authenticate, ctrl.orders);
router.get("/bills", authenticate, ctrl.bills);
router.get("/loyalty", authenticate, ctrl.loyalty);
router.post("/feedback", authenticate, ctrl.submitFeedback);
router.post("/complaints", authenticate, ctrl.submitComplaint);
router.get("/complaints", authenticate, ctrl.getComplaints);
router.get("/scan/table/:tableId", ctrl.scanTable);
router.get("/room-service/:bookingId", authenticate, ctrl.roomService);

module.exports = router;
