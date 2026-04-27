const router = require("express").Router();
const ctrl = require("../../controllers/staffController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get("/", authenticate, authorize("admin"), ctrl.list);
router.get("/attendance/calendar", authenticate, authorize("admin"), ctrl.attendanceCalendar);
router.get("/:id", authenticate, authorize("admin"), ctrl.getById);
router.post("/", authenticate, authorize("admin"), ctrl.create);
router.put("/:id", authenticate, authorize("admin"), ctrl.update);
router.delete("/:id", authenticate, authorize("admin"), ctrl.delete);
router.get("/:id/attendance", authenticate, authorize("admin"), ctrl.getAttendance);
router.post("/:id/attendance", authenticate, authorize("admin"), ctrl.markAttendance);
router.put("/:id/attendance/:date", authenticate, authorize("admin"), ctrl.updateAttendance);
router.get("/:id/salary-slip", authenticate, authorize("admin"), ctrl.salarySlip);

module.exports = router;
