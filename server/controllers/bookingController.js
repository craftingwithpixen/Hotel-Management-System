const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Table = require("../models/Table");
const Hotel = require("../models/Hotel");
const Billing = require("../models/Billing");
const Payment = require("../models/Payment");
const { computeRoomBill } = require("../services/billingCalcService");
const { emitNewBooking, emitBookingCancelled } = require("../services/socketService");
const { refundPayment } = require("./paymentController");

exports.createRoomBooking = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guestCount, specialRequests } = req.body;
    const overlap = await Booking.findOne({
      room: roomId, type: "room",
      status: { $in: ["confirmed", "checked_in"] },
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    });
    if (overlap) return res.status(400).json({ message: "Room not available for these dates" });

    const booking = await Booking.create({
      type: "room", customer: req.user._id, room: roomId,
      checkIn, checkOut, guestCount, specialRequests,
      createdBy: req.user.role !== "customer" ? req.user._id : undefined,
      isWalkIn: req.user.role !== "customer",
    });
    const populated = await booking.populate("customer room");
    if (req.app.get("io")) emitNewBooking(req.app.get("io"), populated);
    res.status(201).json({ booking: populated });
  } catch (error) { next(error); }
};

exports.createTableBooking = async (req, res, next) => {
  try {
    const { tableId, bookingDate, timeSlot, guestCount, specialRequests } = req.body;
    const booking = await Booking.create({
      type: "table", customer: req.user._id, table: tableId,
      bookingDate, timeSlot, guestCount, specialRequests,
    });
    const populated = await booking.populate("customer table");
    if (req.app.get("io")) emitNewBooking(req.app.get("io"), populated);
    res.status(201).json({ booking: populated });
  } catch (error) { next(error); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("room table").sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) { next(error); }
};

exports.list = async (req, res, next) => {
  try {
    const { type, status, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    const bookings = await Booking.find(filter)
      .populate("customer", "name email phone").populate("room table")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer room table payment billing");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ booking });
  } catch (error) { next(error); }
};

exports.confirm = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be approved" });
    }

    booking.status = "confirmed";
    await booking.save();
    res.json({ booking });
  } catch (error) { next(error); }
};

exports.checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "checked_in" }, { new: true });
    if (booking.room) await Room.findByIdAndUpdate(booking.room, { status: "booked" });
    if (booking.table) await Table.findByIdAndUpdate(booking.table, { status: "occupied" });
    res.json({ booking });
  } catch (error) { next(error); }
};

exports.checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room customer");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "checked_out";
    await booking.save();

    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room._id, { status: "available", cleaningStatus: "dirty" });
    }
    if (booking.table) await Table.findByIdAndUpdate(booking.table, { status: "available" });

    // Auto-create a draft room billing record on checkout.
    if (booking.type === "room" && booking.room && !booking.billing) {
      const hotel = await Hotel.findOne();
      const roomBill = computeRoomBill(booking, hotel);
      const bill = await Billing.create({
        hotel: hotel?._id,
        type: "room",
        booking: booking._id,
        customer: roomBill.customerId,
        items: roomBill.items,
        subtotal: roomBill.subtotal,
        gstRate: roomBill.gstRate,
        gstAmount: roomBill.gstAmount,
        total: roomBill.total,
        generatedBy: req.user._id,
      });

      booking.billing = bill._id;
      await booking.save();
    }

    res.json({ booking });
  } catch (error) { next(error); }
};

exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isPrivileged = ["admin", "manager", "receptionist"].includes(req.user.role);
    const isOwner = booking.customer?.toString() === req.user._id?.toString();
    if (!isPrivileged && !isOwner) {
      return res.status(403).json({ message: "Not allowed to cancel this booking" });
    }

    booking.status = "cancelled";
    booking.cancellationReason = req.body.reason || "Cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    // Refund payment if this booking was already paid (Razorpay capture).
    try {
      let paymentId = booking.payment;
      if (!paymentId && booking.billing) {
        const bill = await Billing.findById(booking.billing).populate("payment");
        paymentId = bill?.payment?._id;
      }

      if (paymentId) {
        const payment = await Payment.findById(paymentId);
        if (payment?.status === "captured" && payment?.razorpayPaymentId) {
          await refundPayment(paymentId);
        }
      }
    } catch (e) {
      // Cancellation should still succeed even if refund fails.
      console.error("Booking cancellation refund error:", e?.message || e);
    }

    if (booking.room) await Room.findByIdAndUpdate(booking.room, { status: "available" });
    if (booking.table) await Table.findByIdAndUpdate(booking.table, { status: "available" });
    if (req.app.get("io")) emitBookingCancelled(req.app.get("io"), booking);
    res.json({ booking });
  } catch (error) { next(error); }
};

exports.reject = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be rejected" });
    }

    booking.status = "rejected";
    booking.cancellationReason = req.body.reason || "Rejected by admin";
    booking.cancelledAt = new Date();
    await booking.save();

    if (booking.room) await Room.findByIdAndUpdate(booking.room, { status: "available" });
    if (booking.table) await Table.findByIdAndUpdate(booking.table, { status: "available" });
    if (req.app.get("io")) emitBookingCancelled(req.app.get("io"), booking);
    res.json({ booking });
  } catch (error) { next(error); }
};

exports.availableRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut, type } = req.query;
    const bookedIds = await Booking.distinct("room", {
      type: "room", status: { $in: ["confirmed", "checked_in"] },
      checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) },
    });
    const filter = { _id: { $nin: bookedIds }, isDeleted: false, status: "available" };
    if (type) filter.type = type;
    const rooms = await Room.find(filter);
    res.json({ rooms });
  } catch (error) { next(error); }
};

exports.availableTables = async (req, res, next) => {
  try {
    const { date, time, capacity } = req.query;
    const bookedIds = await Booking.distinct("table", {
      type: "table", status: { $in: ["confirmed", "checked_in"] },
      bookingDate: new Date(date), timeSlot: time,
    });
    const filter = { _id: { $nin: bookedIds }, isActive: true, status: "available" };
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    const tables = await Table.find(filter);
    res.json({ tables });
  } catch (error) { next(error); }
};
