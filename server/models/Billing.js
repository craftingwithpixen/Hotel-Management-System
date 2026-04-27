const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    type: { type: String, enum: ["room", "restaurant"], required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        name: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    gstRate: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    loyaltyPointsUsed: { type: Number, default: 0 },
    total: { type: Number, required: true },
    splitBetween: { type: Number, default: 1 },
    amountPerPerson: { type: Number },
    status: {
      type: String,
      enum: ["draft", "finalized", "paid"],
      default: "draft",
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    invoiceUrl: { type: String },
    paidAt: { type: Date },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Billing", billingSchema);
