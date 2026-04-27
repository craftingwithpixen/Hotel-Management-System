const User = require("../models/User");
const Booking = require("../models/Booking");
const Order = require("../models/Order");
const Billing = require("../models/Billing");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");

exports.profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -otpExpiry");
    res.json({ user });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, preferredLang } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id,
      { name, phone, avatar, preferredLang }, { new: true }
    ).select("-password");
    res.json({ user });
  } catch (error) { next(error); }
};

exports.bookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("room table").sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) { next(error); }
};

exports.orders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("items.menuItem table").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) { next(error); }
};

exports.bills = async (req, res, next) => {
  try {
    const bills = await Billing.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ bills });
  } catch (error) { next(error); }
};

exports.loyalty = async (req, res, next) => {
  try {
    const transactions = await LoyaltyTransaction.find({ customer: req.user._id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user._id).select("loyaltyPoints");
    res.json({ transactions, balance: user.loyaltyPoints });
  } catch (error) { next(error); }
};

exports.submitFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.create({ ...req.body, customer: req.user._id });
    res.status(201).json({ feedback });
  } catch (error) { next(error); }
};

exports.submitComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.create({ ...req.body, customer: req.user._id });
    res.status(201).json({ complaint });
  } catch (error) { next(error); }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (error) { next(error); }
};

exports.scanTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.tableId).populate("hotel", "name");
    if (!table) return res.status(404).json({ message: "Table not found" });
    const menu = await MenuItem.find({ hotel: table.hotel._id, isDeleted: false, isAvailable: true });
    res.json({ table, menu });
  } catch (error) { next(error); }
};
