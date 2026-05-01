const Table = require("../models/Table");
const HelpRequest = require("../models/HelpRequest");
const { generateTableQR } = require("../services/qrService");
const { emitTableStatus, emitCustomerHelpResolved } = require("../services/socketService");

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
    if (!table) return res.status(404).json({ message: "Table not found" });

    if (req.body.status === "available") {
      const activeHelpRequests = await HelpRequest.find({
        table: table._id,
        status: "active",
      });

      if (activeHelpRequests.length > 0) {
        const resolvedAt = new Date();
        await HelpRequest.updateMany(
          { table: table._id, status: "active" },
          { $set: { status: "resolved", resolvedAt, resolvedBy: req.user?._id } }
        );

        if (req.app.get("io")) {
          activeHelpRequests.forEach((request) => {
            emitCustomerHelpResolved(req.app.get("io"), {
              ...request.toObject(),
              status: "resolved",
              resolvedAt,
            });
          });
        }
      }
    }

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
    if (!table) return res.status(404).json({ message: "Table not found" });
    // `qrCode` is stored as either a Cloudinary secure_url or a local data URL (fallback).
    res.json({ qrCode: table.qrCode, qrUrl: table.qrUrl });
  } catch (error) { next(error); }
};
