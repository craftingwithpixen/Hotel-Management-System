const router = require("express").Router();
const ctrl = require("../../controllers/hotelController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.get("/", ctrl.getHotel);
router.put("/", authenticate, authorize("admin", "manager"), ctrl.updateHotel);
router.post("/photos", authenticate, authorize("admin", "manager"), ctrl.uploadPhotos);
router.delete("/photos/:index", authenticate, authorize("admin", "manager"), ctrl.deletePhoto);
router.put("/availability", authenticate, authorize("admin", "manager"), ctrl.toggleAvailability);
// Signed upload params for client-side Cloudinary uploads
router.get("/cloudinary-sign", authenticate, ctrl.getCloudinarySign);

module.exports = router;

