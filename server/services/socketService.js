// Socket.io emit helper functions
const emitNewOrder = (io, order) => {
  io.to("kitchen").emit("new:order", {
    orderId: order._id,
    tableNumber: order.table?.tableNumber,
    items: order.items,
    waiterName: order.waiter?.name,
  });
};

const emitOrderUpdate = (io, order) => {
  io.to(`table:${order.table}`).emit("order:update", {
    orderId: order._id,
    overallStatus: order.overallStatus,
    items: order.items,
  });
  if (order.waiter) {
    io.to(`waiter:${order.waiter}`).emit("order:update", {
      orderId: order._id,
      overallStatus: order.overallStatus,
    });
  }
};

const emitItemUpdate = (io, order, itemId, status) => {
  io.to(`table:${order.table}`).emit("item:update", {
    orderId: order._id,
    itemId,
    status,
  });
};

const emitNewBooking = (io, booking) => {
  io.to("receptionist").emit("booking:new", {
    bookingId: booking._id,
    type: booking.type,
    customerName: booking.customer?.name,
    checkIn: booking.checkIn,
  });
};

const emitBookingCancelled = (io, booking) => {
  io.to("receptionist").to("admin").emit("booking:cancelled", {
    bookingId: booking._id,
    type: booking.type,
    reason: booking.cancellationReason,
  });
};

const emitInventoryAlert = (io, items) => {
  io.to("admin").emit("inventory:alert", {
    items: items.map((i) => ({
      name: i.name,
      currentStock: i.currentStock,
      threshold: i.lowStockThreshold,
      unit: i.unit,
    })),
  });
};

const emitPaymentCaptured = (io, billing) => {
  io.to("admin").emit("payment:captured", {
    billingId: billing._id,
    amount: billing.total,
    method: billing.payment?.method,
  });
};

const emitTableStatus = (io, table) => {
  io.to("receptionist").to("admin").emit("table:status", {
    tableId: table._id,
    status: table.status,
  });
};

module.exports = {
  emitNewOrder,
  emitOrderUpdate,
  emitItemUpdate,
  emitNewBooking,
  emitBookingCancelled,
  emitInventoryAlert,
  emitPaymentCaptured,
  emitTableStatus,
};
