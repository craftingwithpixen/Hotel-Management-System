const mongoose = require("mongoose");

const inventoryRequestSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number },
    unit: {
      type: String,
      enum: ["kg", "litre", "pcs", "box", "packet"],
    },
    note: { type: String },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "fulfilled"],
      default: "pending",
    },
    actionedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actionedAt: { type: Date },
  },
  { timestamps: true }
);

inventoryRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("InventoryRequest", inventoryRequestSchema);
