const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    employeeId: { type: String, required: true, unique: true },
    department: {
      type: String,
      enum: ["Kitchen", "Front Desk", "Restaurant", "Management"],
      required: true,
    },
    salary: { type: Number, required: true },
    joiningDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    documents: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
