const Billing = require("../models/Billing");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const { generateInvoice } = require("../services/pdfService");
const { computeRoomBill } = require("../services/billingCalcService");
const { Types } = require("mongoose");

const getGuestCustomerId = async () => {
  const guestEmail = "guest@gmail.com";
  let guest = await User.findOne({ email: guestEmail, role: "customer", isDeleted: false }).select("_id");
  if (guest) return guest._id;

  try {
    guest = await User.create({
      name: "Guest Customer",
      email: guestEmail,
      password: `guest-${Date.now()}`,
      role: "customer",
      isVerified: true,
    });
    return guest._id;
  } catch (error) {
    if (error.code === 11000) {
      guest = await User.findOne({ email: guestEmail }).select("_id");
      if (guest) return guest._id;
    }
    throw error;
  }
};

exports.generate = async (req, res, next) => {
  try {
    const { orderId, bookingId } = req.body;
    const hotel = await Hotel.findOne();
    let items = [], type = "restaurant", customer, order, booking;
    let resolvedOrderId = null;
    let resolvedBookingId = null;
    let roomServiceOrderIds = [];

    if (orderId) {
      order = Types.ObjectId.isValid(orderId)
        ? await Order.findById(orderId).populate("items.menuItem customer")
        : await Order.findOne({ orderCode: String(orderId).trim().toUpperCase() }).populate("items.menuItem customer");
      if (!order) return res.status(404).json({ message: "Order not found" });
      items = order.items.map(i => ({
        name: i.menuItem.name, quantity: i.quantity,
        unitPrice: i.price, total: i.price * i.quantity,
      }));
      customer = order.customer || req.body.customerId;
      type = "restaurant";
      resolvedOrderId = order._id;
    } else if (bookingId) {
      booking = Types.ObjectId.isValid(bookingId)
        ? await Booking.findById(bookingId).populate("room customer")
        : await Booking.findOne({ bookingCode: String(bookingId).trim().toUpperCase() }).populate("room customer");
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      const roomBill = await computeRoomBill(booking, hotel);
      items = roomBill.items;
      customer = roomBill.customerId;
      type = roomBill.type;
      resolvedBookingId = booking._id;
      roomServiceOrderIds = roomBill.roomServiceOrderIds || [];
    } else {
      return res.status(400).json({ message: "orderId or bookingId is required" });
    }

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const gstRate = hotel?.gstRate || 18;
    const gstAmount = (subtotal * gstRate) / 100;
    const total = subtotal + gstAmount;
    const resolvedCustomer = customer || req.body.customerId || await getGuestCustomerId();

    const bill = await Billing.create({
      hotel: hotel?._id, type, order: resolvedOrderId, booking: resolvedBookingId,
      customer: resolvedCustomer, items, subtotal, gstRate, gstAmount, total,
      generatedBy: req.user._id,
    });
    if (resolvedOrderId) await Order.findByIdAndUpdate(resolvedOrderId, { billing: bill._id, overallStatus: "billed" });
    if (roomServiceOrderIds.length) {
      await Order.updateMany(
        { _id: { $in: roomServiceOrderIds } },
        { billing: bill._id, overallStatus: "billed" }
      );
    }
    if (resolvedBookingId) await Booking.findByIdAndUpdate(resolvedBookingId, { billing: bill._id });

    res.status(201).json({ billing: bill });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id).populate("customer order booking coupon payment");
    res.json({ billing: bill });
  } catch (error) { next(error); }
};

exports.getPdf = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id).populate("customer");
    const buffer = await generateInvoice(bill);
    res.set({ "Content-Type": "application/pdf", "Content-Disposition": "inline" });
    res.send(buffer);
  } catch (error) { next(error); }
};

exports.applyDiscount = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id);
    bill.discount = req.body.discount;
    bill.total = bill.subtotal + bill.gstAmount - bill.discount - bill.loyaltyPointsUsed;
    await bill.save();
    res.json({ billing: bill });
  } catch (error) { next(error); }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id);
    const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });
    if (new Date() > coupon.validTill) return res.status(400).json({ message: "Coupon expired" });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: "Coupon usage limit reached" });

    let discount = coupon.type === "flat" ? coupon.value : (bill.subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

    bill.coupon = coupon._id;
    bill.discount = discount;
    bill.total = bill.subtotal + bill.gstAmount - discount - bill.loyaltyPointsUsed;
    await bill.save();
    coupon.usedCount += 1;
    await coupon.save();
    res.json({ billing: bill });
  } catch (error) { next(error); }
};

exports.applyLoyalty = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id);
    const user = await User.findById(bill.customer);
    const points = Math.min(req.body.points, user.loyaltyPoints);
    bill.loyaltyPointsUsed = points;
    bill.total = bill.subtotal + bill.gstAmount - bill.discount - points;
    await bill.save();
    res.json({ billing: bill });
  } catch (error) { next(error); }
};

exports.split = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id);
    bill.splitBetween = req.body.splitBetween;
    bill.amountPerPerson = bill.total / bill.splitBetween;
    await bill.save();
    res.json({ billing: bill });
  } catch (error) { next(error); }
};

exports.myBills = async (req, res, next) => {
  try {
    const bills = await Billing.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ bills });
  } catch (error) { next(error); }
};

exports.list = async (req, res, next) => {
  try {
    const { date, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    const bills = await Billing.find(filter).populate("customer", "name email")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Billing.countDocuments(filter);
    res.json({ bills, total });
  } catch (error) { next(error); }
};
