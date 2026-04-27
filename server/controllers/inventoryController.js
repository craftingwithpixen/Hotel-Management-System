const InventoryItem = require("../models/InventoryItem");
const Supplier = require("../models/Supplier");

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
    const { quantity } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    item.currentStock = Math.max(0, item.currentStock - quantity);
    item.dailyConsumption.push({ date: new Date(), quantity });
    await item.save();
    res.json({ item });
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
