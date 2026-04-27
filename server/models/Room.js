const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    roomNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ["single", "double", "deluxe", "suite"],
      required: true,
    },
    pricePerNight: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
    },
    cleaningStatus: {
      type: String,
      enum: ["clean", "dirty", "in_progress"],
      default: "clean",
    },
    floor: { type: Number },
    capacity: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ hotel: 1, status: 1 });
roomSchema.index({ hotel: 1, type: 1 });

module.exports = mongoose.model("Room", roomSchema);
