const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const { cloudinary } = require("../config/cloudinary");

const parseAmenities = (amenities) => {
  if (Array.isArray(amenities)) return amenities.filter(Boolean);
  if (typeof amenities === "string") {
    return amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizePayload = (body) => {
  const payload = { ...body };
  if (payload.amenities !== undefined) payload.amenities = parseAmenities(payload.amenities);
  return payload;
};

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
    const payload = normalizePayload(req.body);
    if (!payload.hotel) {
      const hotel = await Hotel.findOne().select("_id");
      if (!hotel) {
        return res.status(400).json({ message: "Hotel setup is required before creating rooms" });
      }
      payload.hotel = hotel._id;
    }
    const room = await Room.create(payload);
    res.status(201).json({ room });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    const room = await Room.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
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

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required" });

    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) return res.status(404).json({ message: "Room not found" });

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "hospitalityos/rooms" },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    room.images = [uploaded.secure_url, ...(room.images || [])];
    await room.save();
    res.json({ room });
  } catch (error) { next(error); }
};
