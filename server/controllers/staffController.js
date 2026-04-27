const User = require("../models/User");
const Staff = require("../models/Staff");
const Attendance = require("../models/Attendance");

exports.list = async (req, res, next) => {
  try {
    const staff = await Staff.find().populate("user", "name email phone avatar role").populate("hotel", "name");
    res.json({ staff });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("user").populate("hotel");
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ staff });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, hotelId, department, salary, employeeId } = req.body;
    const user = await User.create({ name, email, password, phone, role, isVerified: true });
    const staff = await Staff.create({
      user: user._id, hotel: hotelId, employeeId,
      department, salary, joiningDate: new Date(),
    });
    const populated = await staff.populate("user hotel");
    res.status(201).json({ staff: populated });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    const { role, salary, department, name, phone } = req.body;
    if (role || name || phone) {
      await User.findByIdAndUpdate(staff.user, { role, name, phone });
    }
    if (salary) staff.salary = salary;
    if (department) staff.department = department;
    await staff.save();
    const populated = await staff.populate("user hotel");
    res.json({ staff: populated });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    await User.findByIdAndUpdate(staff.user, { isDeleted: true });
    staff.isActive = false;
    await staff.save();
    res.json({ message: "Staff member deactivated" });
  } catch (error) { next(error); }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = { staff: req.params.id };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    const attendance = await Attendance.find(filter).sort({ date: 1 });
    res.json({ attendance });
  } catch (error) { next(error); }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { date, present, checkInTime, checkOutTime, notes } = req.body;
    const staff = await Staff.findById(req.params.id);
    const attendance = await Attendance.findOneAndUpdate(
      { staff: req.params.id, date: new Date(date) },
      { staff: req.params.id, hotel: staff.hotel, date: new Date(date), present, checkInTime, checkOutTime, notes },
      { upsert: true, new: true }
    );
    res.json({ attendance });
  } catch (error) { next(error); }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findOneAndUpdate(
      { staff: req.params.id, date: new Date(req.params.date) },
      req.body, { new: true }
    );
    res.json({ attendance });
  } catch (error) { next(error); }
};

exports.salarySlip = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("user", "name email");
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const attendance = await Attendance.find({
      staff: req.params.id, date: { $gte: start, $lte: end },
    });
    const presentDays = attendance.filter(a => a.present).length;
    const totalDays = end.getDate();
    const proratedSalary = (staff.salary / totalDays) * presentDays;

    res.json({
      staff: { name: staff.user.name, employeeId: staff.employeeId, department: staff.department },
      month, year, totalDays, presentDays,
      baseSalary: staff.salary, proratedSalary: Math.round(proratedSalary),
    });
  } catch (error) { next(error); }
};

exports.attendanceCalendar = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const attendance = await Attendance.find({ date: { $gte: start, $lte: end } })
      .populate({ path: "staff", populate: { path: "user", select: "name" } });
    res.json({ attendance });
  } catch (error) { next(error); }
};
