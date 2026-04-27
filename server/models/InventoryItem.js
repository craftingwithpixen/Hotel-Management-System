const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    name: { type: String, required: true },
    unit: {
      type: String,
      enum: ["kg", "litre", "pcs", "box", "packet"],
      required: true,
    },
    currentStock: { type: Number, required: true },
    lowStockThreshold: { type: Number, required: true },
    category: { type: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    purchaseHistory: [
      {
        qty: Number,
        costPerUnit: Number,
        total: Number,
        date: Date,
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
      },
    ],
    dailyConsumption: [
      {
        date: Date,
        quantity: Number,
      },
    ],
    lastRestockedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
