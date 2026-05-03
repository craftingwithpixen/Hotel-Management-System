const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    waiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
        quantity: { type: Number, required: true },
        notes: { type: String },
        status: {
          type: String,
          enum: ["pending", "preparing", "ready", "served"],
          default: "pending",
        },
        price: { type: Number, required: true },
      },
    ],
    overallStatus: {
      type: String,
      enum: ["pending", "preparing", "ready", "served", "billed"],
      default: "pending",
    },
    kotPrinted: { type: Boolean, default: false },
    kotPrintedAt: { type: Date },
    billing: { type: mongoose.Schema.Types.ObjectId, ref: "Billing" },
    isQROrder: { type: Boolean, default: false },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function () {
  if (!this.table && !this.room) {
    this.invalidate("table", "Either table or room is required");
  }

  if (!this.orderCode) {
    const idPart = this._id ? this._id.toString().slice(-6).toUpperCase() : Date.now().toString().slice(-6);
    this.orderCode = `ORD-${idPart}`;
  }
});

orderSchema.index({ table: 1, overallStatus: 1 });
orderSchema.index({ hotel: 1, createdAt: -1 });
orderSchema.index({ overallStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
