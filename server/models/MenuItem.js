const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    name: { type: String, required: true, trim: true },
    nameMarathi: { type: String },
    category: {
      type: String,
      enum: ["veg", "non_veg", "drinks", "dessert", "combo"],
      required: true,
    },
    price: { type: Number, required: true },
    image: { type: String },
    description: { type: String },
    isAvailable: { type: Boolean, default: true },
    prepTime: { type: Number },
    comboItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
    allergens: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
