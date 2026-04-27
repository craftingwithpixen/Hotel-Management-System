const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    tableNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "reserved", "occupied"],
      default: "available",
    },
    location: { type: String },
    qrCode: { type: String },
    qrUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tableSchema.index({ hotel: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model("Table", tableSchema);
