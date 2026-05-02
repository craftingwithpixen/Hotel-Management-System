const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateOTP } = require("../utils/generateOTP");
const emailService = require("../services/emailService");

const generateAccessToken = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
  return accessToken;
};

// Customer registration
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: "customer",
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    await emailService.sendOTP(email, otp);

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resend OTP
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await emailService.sendOTP(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

// Shared login for customers and staff
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role === "customer" && !user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first", needsVerification: true });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Staff login
exports.staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      role: { $in: ["admin", "manager", "receptionist", "waiter", "chef"] },
      isDeleted: false,
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// Update profile
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar, preferredLang } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar, preferredLang },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpiry");

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await emailService.sendOTP(email, otp);
    res.json({ message: "Password reset OTP sent" });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired or not requested" });
    }

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};
