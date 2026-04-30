require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Order = require("../models/Order");

const makeBookingCode = (id) => `BKG-${String(id).slice(-6).toUpperCase()}`;
const makeOrderCode = (id) => `ORD-${String(id).slice(-6).toUpperCase()}`;

async function backfillBookings() {
  const docs = await Booking.find({
    $or: [{ bookingCode: { $exists: false } }, { bookingCode: null }, { bookingCode: "" }],
  }).select("_id bookingCode");

  if (!docs.length) return 0;

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { bookingCode: makeBookingCode(doc._id) } },
    },
  }));

  await Booking.bulkWrite(ops, { ordered: false });
  return docs.length;
}

async function backfillOrders() {
  const docs = await Order.find({
    $or: [{ orderCode: { $exists: false } }, { orderCode: null }, { orderCode: "" }],
  }).select("_id orderCode");

  if (!docs.length) return 0;

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { orderCode: makeOrderCode(doc._id) } },
    },
  }));

  await Order.bulkWrite(ops, { ordered: false });
  return docs.length;
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const bookingCount = await backfillBookings();
  const orderCount = await backfillOrders();

  console.log(`Backfill complete. Bookings updated: ${bookingCount}, Orders updated: ${orderCount}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Backfill failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
