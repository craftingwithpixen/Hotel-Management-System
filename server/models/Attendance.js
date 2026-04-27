const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    date: { type: Date, required: true },
    present: { type: Boolean, required: true },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
