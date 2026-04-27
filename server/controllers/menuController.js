const MenuItem = require("../models/MenuItem");

exports.list = async (req, res, next) => {
  try {
    const { category, available } = req.query;
    const filter = { isDeleted: false };
    if (category) filter.category = category;
    if (available === "true") filter.isAvailable = true;
    const items = await MenuItem.find(filter).populate("comboItems");
    res.json({ items });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate("comboItems");
    if (!item || item.isDeleted) return res.status(404).json({ message: "Item not found" });
    res.json({ item });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ item });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ item });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await MenuItem.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: "Item deleted" });
  } catch (error) { next(error); }
};

exports.toggle = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ item });
  } catch (error) { next(error); }
};

exports.categories = async (req, res, next) => {
  try {
    const cats = await MenuItem.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    res.json({ categories: cats });
  } catch (error) { next(error); }
};

exports.createCombo = async (req, res, next) => {
  try {
    const item = await MenuItem.create({ ...req.body, category: "combo" });
    res.status(201).json({ item });
  } catch (error) { next(error); }
};
