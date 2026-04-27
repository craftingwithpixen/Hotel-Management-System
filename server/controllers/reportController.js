const Billing = require("../models/Billing");
const Booking = require("../models/Booking");
const Order = require("../models/Order");
const Room = require("../models/Room");
const InventoryItem = require("../models/InventoryItem");
const Attendance = require("../models/Attendance");

exports.daily = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    const filter = { createdAt: { $gte: start, $lte: end } };

    const [revenue, bookings, orders] = await Promise.all([
      Billing.aggregate([{ $match: { ...filter, status: "paid" } }, { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }]),
      Booking.countDocuments(filter),
      Order.countDocuments(filter),
    ]);

    res.json({
      date: start, revenue: revenue[0]?.total || 0,
      bills: revenue[0]?.count || 0, bookings, orders,
    });
  } catch (error) { next(error); }
};

exports.monthly = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const data = await Billing.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: "paid" } },
      { $group: { _id: { $dayOfMonth: "$createdAt" }, total: { $sum: "$total" }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } },
    ]);

    res.json({ month, year, data });
  } catch (error) { next(error); }
};

exports.occupancy = async (req, res, next) => {
  try {
    const totalRooms = await Room.countDocuments({ isDeleted: false });
    const bookedRooms = await Room.countDocuments({ status: "booked", isDeleted: false });
    const rate = totalRooms > 0 ? ((bookedRooms / totalRooms) * 100).toFixed(1) : 0;

    const byType = await Room.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$type", total: { $sum: 1 }, booked: { $sum: { $cond: [{ $eq: ["$status", "booked"] }, 1, 0] } } } },
    ]);

    res.json({ totalRooms, bookedRooms, occupancyRate: Number(rate), byType });
  } catch (error) { next(error); }
};

exports.tableUsage = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: "$table", orders: { $sum: 1 } } },
      { $lookup: { from: "tables", localField: "_id", foreignField: "_id", as: "table" } },
      { $unwind: "$table" },
      { $project: { tableNumber: "$table.tableNumber", orders: 1 } },
      { $sort: { orders: -1 } },
    ]);
    res.json({ data });
  } catch (error) { next(error); }
};

exports.inventory = async (req, res, next) => {
  try {
    const items = await InventoryItem.find({ isDeleted: false })
      .select("name currentStock lowStockThreshold unit category");
    res.json({ items });
  } catch (error) { next(error); }
};

exports.staffPerformance = async (req, res, next) => {
  try {
    const waiterStats = await Order.aggregate([
      { $group: { _id: "$waiter", orders: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { name: "$user.name", orders: 1 } },
      { $sort: { orders: -1 } },
    ]);
    res.json({ waiterStats });
  } catch (error) { next(error); }
};

exports.topMenuItems = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.menuItem", totalQty: { $sum: "$items.quantity" }, totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $lookup: { from: "menuitems", localField: "_id", foreignField: "_id", as: "item" } },
      { $unwind: "$item" },
      { $project: { name: "$item.name", category: "$item.category", totalQty: 1, totalRevenue: 1 } },
      { $sort: { totalQty: -1 } }, { $limit: 20 },
    ]);
    res.json({ data });
  } catch (error) { next(error); }
};
