const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    code: { type: String, required: true, uppercase: true },
    type: { type: String, enum: ["flat", "percent"], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number },
    maxDiscount: { type: Number },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number },
    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableTo: {
      type: String,
      enum: ["all", "room", "restaurant"],
      default: "all",
    },
  },
  { timestamps: true }
);

couponSchema.index({ hotel: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("Coupon", couponSchema);
