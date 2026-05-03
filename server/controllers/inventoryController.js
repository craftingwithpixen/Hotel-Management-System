const InventoryItem = require("../models/InventoryItem");
const InventoryRequest = require("../models/InventoryRequest");
const Notification = require("../models/Notification");
const Supplier = require("../models/Supplier");
const User = require("../models/User");
const { sendLowStockAlerts } = require("../services/lowStockAlertService");

exports.list = async (req, res, next) => {
  try {
    const { lowStock } = req.query;
    const filter = { isDeleted: false };
    if (lowStock === "true") filter.$expr = { $lte: ["$currentStock", "$lowStockThreshold"] };
    const items = await InventoryItem.find(filter).populate("supplier", "name");
    res.json({ items });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await InventoryItem.findById(req.params.id).populate("supplier");
    res.json({ item });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json({ item });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ item });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await InventoryItem.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: "Item deleted" });
  } catch (error) { next(error); }
};

exports.restock = async (req, res, next) => {
  try {
    const { qty, costPerUnit, supplierId } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    item.currentStock += qty;
    item.lastRestockedAt = new Date();
    item.purchaseHistory.push({
      qty, costPerUnit, total: qty * costPerUnit, date: new Date(), supplier: supplierId,
    });
    await item.save();
    res.json({ item });
  } catch (error) { next(error); }
};

exports.consume = async (req, res, next) => {
  try {
    const { quantity, note } = req.body;
    const usedQty = Number(quantity);
    if (!Number.isFinite(usedQty) || usedQty <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item || item.isDeleted) return res.status(404).json({ message: "Inventory item not found" });

    const wasAboveThreshold = item.currentStock > item.lowStockThreshold;
    item.currentStock = Math.max(0, item.currentStock - usedQty);
    item.dailyConsumption.push({
      date: new Date(),
      quantity: usedQty,
      usedBy: req.user?._id,
      note,
    });
    await item.save();

    if (wasAboveThreshold && item.currentStock <= item.lowStockThreshold) {
      await sendLowStockAlerts([item], req.app.get("io"));
    }

    res.json({ item });
  } catch (error) { next(error); }
};

exports.consumeToday = async (req, res, next) => {
  try {
    const usages = Array.isArray(req.body.usages) ? req.body.usages : [];
    const validUsages = usages
      .map((usage) => ({
        itemId: usage.itemId,
        quantity: Number(usage.quantity),
        note: usage.note,
      }))
      .filter((usage) => usage.itemId && Number.isFinite(usage.quantity) && usage.quantity > 0);

    if (validUsages.length === 0) {
      return res.status(400).json({ message: "Enter at least one used inventory quantity" });
    }

    const updatedItems = [];
    const lowStockItems = [];
    for (const usage of validUsages) {
      const item = await InventoryItem.findOne({ _id: usage.itemId, isDeleted: false });
      if (!item) continue;

      const wasAboveThreshold = item.currentStock > item.lowStockThreshold;
      item.currentStock = Math.max(0, item.currentStock - usage.quantity);
      item.dailyConsumption.push({
        date: new Date(),
        quantity: usage.quantity,
        usedBy: req.user?._id,
        note: usage.note,
      });
      await item.save();
      updatedItems.push(item);
      if (wasAboveThreshold && item.currentStock <= item.lowStockThreshold) {
        lowStockItems.push(item);
      }
    }

    if (updatedItems.length === 0) {
      return res.status(404).json({ message: "No matching inventory items found" });
    }

    const alertResult = await sendLowStockAlerts(lowStockItems, req.app.get("io"));

    res.json({
      message: "Inventory usage recorded",
      items: updatedItems,
      alertsSentTo: alertResult.sentTo,
    });
  } catch (error) { next(error); }
};

exports.alerts = async (req, res, next) => {
  try {
    const items = await InventoryItem.find({
      $expr: { $lte: ["$currentStock", "$lowStockThreshold"] }, isDeleted: false,
    }).populate("supplier");
    res.json({ items });
  } catch (error) { next(error); }
};

exports.createRequest = async (req, res, next) => {
  try {
    const itemName = String(req.body.itemName || "").trim();
    if (!itemName) return res.status(400).json({ message: "Item name is required" });

    const quantity = req.body.quantity === "" || req.body.quantity === undefined
      ? undefined
      : Number(req.body.quantity);
    if (quantity !== undefined && (!Number.isFinite(quantity) || quantity <= 0)) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const request = await InventoryRequest.create({
      itemName,
      quantity,
      unit: req.body.unit || undefined,
      note: req.body.note,
      requestedBy: req.user._id,
    });

    const populated = await request.populate("requestedBy", "name role");
    const recipients = await User.find({ role: { $in: ["admin", "manager"] }, isDeleted: false }).select("_id");
    if (recipients.length) {
      await Notification.insertMany(recipients.map((user) => ({
        recipient: user._id,
        type: "inventory:request",
        message: `Inventory requested - ${itemName}`,
        payload: {
          requestId: request._id,
          itemName,
          quantity,
          unit: req.body.unit,
          requestedBy: req.user.name,
        },
      })));
    }

    req.app.get("io")?.to("admin").to("manager").emit("inventory:request", {
      request: populated,
    });

    res.status(201).json({ request: populated });
  } catch (error) { next(error); }
};

exports.listRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await InventoryRequest.find(filter)
      .populate("requestedBy", "name role")
      .populate("actionedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit || 50));
    res.json({ requests });
  } catch (error) { next(error); }
};

exports.updateRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "fulfilled"].includes(status)) {
      return res.status(400).json({ message: "Invalid request status" });
    }

    const request = await InventoryRequest.findByIdAndUpdate(
      req.params.id,
      { status, actionedBy: req.user._id, actionedAt: new Date() },
      { new: true }
    )
      .populate("requestedBy", "name role")
      .populate("actionedBy", "name role");

    if (!request) return res.status(404).json({ message: "Inventory request not found" });
    res.json({ request });
  } catch (error) { next(error); }
};

// Supplier CRUD
exports.listSuppliers = async (req, res, next) => {
  try { res.json({ suppliers: await Supplier.find({ isActive: true }) }); }
  catch (error) { next(error); }
};

exports.createSupplier = async (req, res, next) => {
  try { res.status(201).json({ supplier: await Supplier.create(req.body) }); }
  catch (error) { next(error); }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const s = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ supplier: s });
  } catch (error) { next(error); }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    await Supplier.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Supplier deleted" });
  } catch (error) { next(error); }
};
