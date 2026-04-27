const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    billing: { type: mongoose.Schema.Types.ObjectId, ref: "Billing", required: true },
    method: {
      type: String,
      enum: ["cash", "upi", "card", "net_banking", "loyalty"],
      required: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded"],
      default: "pending",
    },
    refundId: { type: String },
    refundedAt: { type: Date },
    webhookVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
