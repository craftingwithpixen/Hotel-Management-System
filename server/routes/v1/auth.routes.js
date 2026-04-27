const router = require("express").Router();
const auth = require("../../controllers/authController");
const authenticate = require("../../middleware/authenticate");

router.post("/register", auth.register);
router.post("/verify-otp", auth.verifyOTP);
router.post("/resend-otp", auth.resendOTP);
router.post("/login", auth.login);
router.post("/staff-login", auth.staffLogin);
router.post("/logout", authenticate, auth.logout);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);
router.get("/me", authenticate, auth.getMe);
router.put("/me", authenticate, auth.updateMe);

module.exports = router;
