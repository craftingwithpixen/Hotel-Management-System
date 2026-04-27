const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    photos: [{ type: String }],
    amenities: [{ type: String }],
    checkInTime: { type: String, required: true, default: "12:00" },
    checkOutTime: { type: String, required: true, default: "11:00" },
    gstNumber: { type: String, required: true },
    gstRate: { type: Number, required: true, default: 18 },
    isOpen: { type: Boolean, default: true },
    description: { type: String },
    socialLinks: {
      instagram: String,
      facebook: String,
      website: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
