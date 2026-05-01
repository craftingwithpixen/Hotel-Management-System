const mongoose = require("mongoose");

const helpRequestSchema = new mongoose.Schema(
  {
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
      index: true,
    },
    message: { type: String, default: "" },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

helpRequestSchema.index({ table: 1, status: 1, createdAt: -1 });
helpRequestSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model("HelpRequest", helpRequestSchema);
