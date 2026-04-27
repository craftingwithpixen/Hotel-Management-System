const Room = require("../models/Room");
const Booking = require("../models/Booking");

exports.list = async (req, res, next) => {
  try {
    const { type, status, checkIn, checkOut, page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: false };
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Check availability for date range
    if (checkIn && checkOut) {
      const bookedRoomIds = await Booking.distinct("room", {
        type: "room",
        status: { $in: ["confirmed", "checked_in"] },
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
      });
      filter._id = { $nin: bookedRoomIds };
    }

    const rooms = await Room.find(filter)
      .populate("hotel", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Room.countDocuments(filter);

    res.json({ rooms, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate("hotel");
    if (!room || room.isDeleted) return res.status(404).json({ message: "Room not found" });
    res.json({ room });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ room });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ room });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ room });
  } catch (error) { next(error); }
};

exports.updateCleaning = async (req, res, next) => {
  try {
    const { cleaningStatus } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, { cleaningStatus }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ room });
  } catch (error) { next(error); }
};

exports.getRoomBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ room: req.params.id })
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) { next(error); }
};
