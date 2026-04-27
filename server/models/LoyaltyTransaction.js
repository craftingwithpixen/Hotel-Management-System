const mongoose = require("mongoose");

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["earn", "redeem"], required: true },
    points: { type: Number, required: true },
    description: { type: String, required: true },
    billing: { type: mongoose.Schema.Types.ObjectId, ref: "Billing" },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoyaltyTransaction", loyaltyTransactionSchema);
