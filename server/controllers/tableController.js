const Table = require("../models/Table");
const { generateTableQR } = require("../services/qrService");
const { emitTableStatus } = require("../services/socketService");

exports.list = async (req, res, next) => {
  try {
    const tables = await Table.find({ isActive: true }).populate("hotel", "name");
    res.json({ tables });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id).populate("hotel");
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ table });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);
    const { qrCode, qrUrl } = await generateTableQR(table._id);
    table.qrCode = qrCode;
    table.qrUrl = qrUrl;
    await table.save();
    res.status(201).json({ table });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ table });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await Table.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Table deleted" });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (req.app.get("io")) emitTableStatus(req.app.get("io"), table);
    res.json({ table });
  } catch (error) { next(error); }
};

exports.regenerateQR = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    const { qrCode, qrUrl } = await generateTableQR(table._id);
    table.qrCode = qrCode;
    table.qrUrl = qrUrl;
    await table.save();
    res.json({ table });
  } catch (error) { next(error); }
};

exports.downloadQR = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    res.json({ qrCode: table.qrCode });
  } catch (error) { next(error); }
};
