/**
 * Shared billing calculations used by both:
 * - billingController.generate (room bills from bookingId)
 * - bookingController.checkOut (auto-create draft billing on checkout)
 */

const computeRoomBill = (booking, hotel) => {
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
  };
};

module.exports = { computeRoomBill };

