const Order = require("../models/Order");
const Table = require("../models/Table");
const Room = require("../models/Room");
const MenuItem = require("../models/MenuItem");
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const { emitNewOrder, emitOrderUpdate, emitItemUpdate } = require("../services/socketService");

exports.create = async (req, res, next) => {
  try {
    const { tableId, roomId, bookingId, items = [], hotelId } = req.body;
    let table = null;
    let room = null;
    let booking = null;

    if (tableId) {
      table = await Table.findById(tableId).select("hotel status");
      if (!table) return res.status(404).json({ message: "Table not found" });
    }

    if (roomId) {
      room = await Room.findById(roomId).select("hotel roomNumber status");
      if (!room) return res.status(404).json({ message: "Room not found" });

      if (!bookingId) return res.status(400).json({ message: "Room booking is required for room service orders" });
      booking = await Booking.findOne({
        _id: bookingId,
        room: roomId,
        type: "room",
        customer: req.user._id,
        status: { $in: ["confirmed", "checked_in"] },
      }).select("_id");
      if (!booking) return res.status(403).json({ message: "No active room booking found for this order" });
    }

    if (!table && !room) {
      return res.status(400).json({ message: "Select a table or room for this order" });
    }

    // Resolve hotel safely even when client does not send hotelId.
    let resolvedHotelId = hotelId || table?.hotel || room?.hotel;
    if (!resolvedHotelId) {
      const defaultHotel = await Hotel.findOne().select("_id");
      resolvedHotelId = defaultHotel?._id;
    }
    if (!resolvedHotelId) {
      return res.status(400).json({ message: "Hotel setup is required before creating orders" });
    }

    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || menuItem.isDeleted || menuItem.isAvailable === false) continue;
      orderItems.push({
        menuItem: menuItem._id, quantity: item.quantity,
        notes: item.notes, price: menuItem.price, status: "pending",
      });
    }
    if (orderItems.length === 0) return res.status(400).json({ message: "Add at least one available menu item" });

    const order = await Order.create({
      hotel: resolvedHotelId, table: tableId, room: roomId, booking: booking?._id || bookingId,
      waiter: req.user.role === "customer" ? undefined : req.user._id,
      items: orderItems, isQROrder: req.body.isQROrder || false,
      customer: req.body.customerId || (req.user.role === "customer" ? req.user._id : undefined),
    });
    if (tableId) await Table.findByIdAndUpdate(tableId, { status: "occupied" });
    const populated = await order.populate("table room waiter items.menuItem");
    if (req.app.get("io")) emitNewOrder(req.app.get("io"), populated);
    res.status(201).json({ order: populated });
  } catch (error) { next(error); }
};

exports.list = async (req, res, next) => {
  try {
    const { tableId, status, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (tableId) filter.table = tableId;
    if (status) filter.overallStatus = status;
    if (date) {
      const d = new Date(date);
      filter.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    const orders = await Order.find(filter)
      .populate("table room waiter items.menuItem")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, page: Number(page) });
  } catch (error) { next(error); }
};

exports.kitchen = async (req, res, next) => {
  try {
    const orders = await Order.find({ overallStatus: { $in: ["pending", "preparing", "ready"] } })
      .populate("table room waiter items.menuItem").sort({ createdAt: 1 });
    res.json({ orders });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("table room waiter items.menuItem customer");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) { next(error); }
};

exports.getByTable = async (req, res, next) => {
  try {
    const orders = await Order.find({
      table: req.params.tableId, overallStatus: { $nin: ["billed"] },
    }).populate("items.menuItem waiter");
    res.json({ orders });
  } catch (error) { next(error); }
};

exports.updateItems = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.kotPrinted) return res.status(400).json({ message: "Cannot modify after KOT" });
    order.items = req.body.items;
    await order.save();
    res.json({ order });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id,
      { overallStatus: req.body.status }, { new: true }).populate("table room waiter");
    if (req.app.get("io")) emitOrderUpdate(req.app.get("io"), order);
    res.json({ order });
  } catch (error) { next(error); }
};

exports.updateItemStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    const item = order.items.id(req.body.itemId);
    if (item) item.status = req.body.status;
    await order.save();
    if (req.app.get("io")) emitItemUpdate(req.app.get("io"), order, req.body.itemId, req.body.status);
    res.json({ order });
  } catch (error) { next(error); }
};

exports.printKOT = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id,
      { kotPrinted: true, kotPrintedAt: new Date() }, { new: true });
    res.json({ order });
  } catch (error) { next(error); }
};

exports.track = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .select("overallStatus items.status items.menuItem items.quantity")
      .populate("items.menuItem", "name image");
    res.json({ order });
  } catch (error) { next(error); }
};
