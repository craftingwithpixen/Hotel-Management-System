const HelpRequest = require("../models/HelpRequest");
const Table = require("../models/Table");
const Order = require("../models/Order");
const {
  emitCustomerHelpRequested,
  emitCustomerHelpResolved,
} = require("../services/socketService");

exports.create = async (req, res, next) => {
  try {
    const { tableId, orderId, message } = req.body;
    if (!tableId) return res.status(400).json({ message: "tableId is required" });

    const table = await Table.findById(tableId).select("_id tableNumber status");
    if (!table) return res.status(404).json({ message: "Table not found" });
    if (table.status === "available") {
      return res.status(400).json({ message: "Table is free. Help request is disabled." });
    }

    if (orderId) {
      const order = await Order.findById(orderId).select("_id");
      if (!order) return res.status(404).json({ message: "Order not found" });
    }

    const existing = await HelpRequest.findOne({
      table: tableId,
      customer: req.user._id,
      status: "active",
    }).sort({ createdAt: -1 });

    if (existing) {
      return res.json({ helpRequest: existing, alreadyActive: true });
    }

    const helpRequest = await HelpRequest.create({
      table: tableId,
      customer: req.user._id,
      order: orderId || undefined,
      message: (message || "").trim(),
    });

    const populated = await helpRequest.populate([
      { path: "table", select: "tableNumber status" },
      { path: "customer", select: "name" },
      { path: "order", select: "orderCode" },
    ]);

    if (req.app.get("io")) emitCustomerHelpRequested(req.app.get("io"), populated);
    res.status(201).json({ helpRequest: populated });
  } catch (error) {
    next(error);
  }
};

exports.myHistory = async (req, res, next) => {
  try {
    const helpRequests = await HelpRequest.find({ customer: req.user._id })
      .populate("table", "tableNumber status")
      .populate("order", "orderCode")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ helpRequests });
  } catch (error) {
    next(error);
  }
};

exports.active = async (req, res, next) => {
  try {
    const helpRequests = await HelpRequest.find({ status: "active" })
      .populate("table", "tableNumber status")
      .populate("customer", "name")
      .populate("order", "orderCode")
      .sort({ createdAt: -1 });

    res.json({ helpRequests });
  } catch (error) {
    next(error);
  }
};

exports.resolve = async (req, res, next) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) return res.status(404).json({ message: "Help request not found" });

    const isOwner = String(helpRequest.customer) === String(req.user._id);
    const canResolveByRole = ["waiter", "admin", "manager", "receptionist"].includes(req.user.role);

    if (!isOwner && !canResolveByRole) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    if (helpRequest.status !== "resolved") {
      helpRequest.status = "resolved";
      helpRequest.resolvedAt = new Date();
      helpRequest.resolvedBy = req.user._id;
      await helpRequest.save();
    }

    const populated = await helpRequest.populate([
      { path: "table", select: "tableNumber status" },
      { path: "customer", select: "name" },
      { path: "order", select: "orderCode" },
      { path: "resolvedBy", select: "name role" },
    ]);

    if (req.app.get("io")) emitCustomerHelpResolved(req.app.get("io"), populated);
    res.json({ helpRequest: populated });
  } catch (error) {
    next(error);
  }
};
