/**
 * Shared billing calculations used by both:
 * - billingController.generate (room bills from bookingId)
 * - bookingController.checkOut (auto-create draft billing on checkout)
 */
const Order = require("../models/Order");

const getRoomServiceItems = async (bookingId) => {
  const orders = await Order.find({
    booking: bookingId,
    room: { $exists: true, $ne: null },
    overallStatus: { $ne: "billed" },
    $or: [{ billing: { $exists: false } }, { billing: null }],
  }).populate("items.menuItem", "name");

  const items = [];
  for (const order of orders) {
    for (const item of order.items || []) {
      items.push({
        name: `Room Service - ${item.menuItem?.name || "Menu item"}`,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      });
    }
  }

  return {
    items,
    orderIds: orders.map((order) => order._id),
  };
};

const computeRoomBill = async (booking, hotel) => {
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = Math.max(1, Math.ceil((checkOut - checkIn) / 86400000));

  const unitPrice = booking.room?.pricePerNight || 0;
  const items = [
    {
      name: `Room ${booking.room?.roomNumber || ""} (${nights} nights)`,
      quantity: nights,
      unitPrice,
      total: unitPrice * nights,
    },
  ];
  const roomService = await getRoomServiceItems(booking._id);
  items.push(...roomService.items);

  const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
  const gstRate = hotel?.gstRate ?? 18;
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;

  return {
    items,
    subtotal,
    gstRate,
    gstAmount,
    total,
    customerId: booking.customer?._id || booking.customer,
    type: "room",
    roomServiceOrderIds: roomService.orderIds,
  };
};

module.exports = { computeRoomBill };

