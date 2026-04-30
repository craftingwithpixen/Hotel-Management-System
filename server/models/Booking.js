const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, unique: true, index: true },
    type: { type: String, enum: ["room", "table"], required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    checkIn: { type: Date },
    checkOut: { type: Date },
    bookingDate: { type: Date },
    timeSlot: { type: String },
    guestCount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "rejected"],
      default: "pending",
    },
    isWalkIn: { type: Boolean, default: false },
    specialRequests: { type: String },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    billing: { type: mongoose.Schema.Types.ObjectId, ref: "Billing" },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.pre("validate", function () {
  if (!this.bookingCode) {
    const idPart = this._id ? this._id.toString().slice(-6).toUpperCase() : Date.now().toString().slice(-6);
    this.bookingCode = `BKG-${idPart}`;
  }
});

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ table: 1, bookingDate: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
