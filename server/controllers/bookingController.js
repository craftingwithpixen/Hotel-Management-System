const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Table = require("../models/Table");
const { emitNewBooking, emitBookingCancelled } = require("../services/socketService");

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
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "confirmed" }, { new: true });
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
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "checked_out" }, { new: true });
    if (booking.room) await Room.findByIdAndUpdate(booking.room, { status: "available", cleaningStatus: "dirty" });
    if (booking.table) await Table.findByIdAndUpdate(booking.table, { status: "available" });
    res.json({ booking });
  } catch (error) { next(error); }
};

exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, {
      status: "cancelled", cancellationReason: req.body.reason, cancelledAt: new Date(),
    }, { new: true });
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
