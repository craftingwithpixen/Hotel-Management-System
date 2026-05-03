// Socket.io emit helper functions + persistent notification side-effects
const User = require("../models/User");
const Notification = require("../models/Notification");

const notifyRoles = async (roles, { type, message, payload }) => {
  if (!roles?.length) return;
  const recipients = await User.find({ role: { $in: roles }, isDeleted: false }).select("_id");
  if (!recipients?.length) return;

  await Notification.insertMany(
    recipients.map((u) => ({
      recipient: u._id,
      type,
      message: message || "",
      payload: payload || {},
    }))
  );
};

const emitNewOrder = (io, order) => {
  const sourceLabel = order.orderType === "parcel"
    ? "Parcel"
    : order.table?.tableNumber
    ? `Table ${order.table.tableNumber}`
    : `Room ${order.room?.roomNumber || "Unknown"}`;

  io.to("kitchen").emit("new:order", {
    orderId: order._id,
    tableNumber: order.table?.tableNumber,
    roomNumber: order.room?.roomNumber,
    sourceType: order.orderType || (order.room ? "room" : "table"),
    items: order.items,
    waiterName: order.waiter?.name,
  });

  io.to("waiter").emit("new:room-service-order", {
    orderId: order._id,
    roomNumber: order.room?.roomNumber,
    sourceType: order.orderType || (order.room ? "room" : "table"),
    items: order.items,
    createdAt: order.createdAt,
  });

  if (order.room) {
    void notifyRoles(["waiter", "manager", "admin"], {
      type: "room:order",
      message: `Room service order — ${sourceLabel}`,
      payload: {
        orderId: order._id,
        roomNumber: order.room?.roomNumber,
      },
    }).catch(() => {});
  }
};

const emitOrderUpdate = (io, order) => {
  if (order.table) {
    io.to(`table:${order.table}`).emit("order:update", {
      orderId: order._id,
      overallStatus: order.overallStatus,
      items: order.items,
    });
  }
  if (order.waiter) {
    io.to(`waiter:${order.waiter}`).emit("order:update", {
      orderId: order._id,
      overallStatus: order.overallStatus,
    });
  }
};

const emitItemUpdate = (io, order, itemId, status) => {
  if (order.table) {
    io.to(`table:${order.table}`).emit("item:update", {
      orderId: order._id,
      itemId,
      status,
    });
  }
};

const emitNewBooking = (io, booking) => {
  io.to("receptionist").emit("booking:new", {
    bookingId: booking._id,
    type: booking.type,
    customerName: booking.customer?.name,
    checkIn: booking.checkIn,
  });

  // Persistent in-app notification
  void notifyRoles(["receptionist"], {
    type: "booking:new",
    message: `New ${booking.type} booking — ${booking.customer?.name || "Customer"}`,
    payload: {
      bookingId: booking._id,
      bookingType: booking.type,
      customerName: booking.customer?.name,
      checkIn: booking.checkIn,
    },
  }).catch(() => {});
};

const emitBookingCancelled = (io, booking) => {
  io.to("receptionist").to("admin").emit("booking:cancelled", {
    bookingId: booking._id,
    type: booking.type,
    reason: booking.cancellationReason,
  });

  void notifyRoles(["receptionist", "admin"], {
    type: "booking:cancelled",
    message: `Booking cancelled — ${booking.customer?.name || "Customer"}`,
    payload: {
      bookingId: booking._id,
      bookingType: booking.type,
      reason: booking.cancellationReason,
    },
  }).catch(() => {});
};

const emitInventoryAlert = (io, items) => {
  io.to("admin").to("manager").emit("inventory:alert", {
    items: items.map((i) => ({
      name: i.name,
      currentStock: i.currentStock,
      threshold: i.lowStockThreshold,
      unit: i.unit,
    })),
  });

  void notifyRoles(["admin", "manager"], {
    type: "inventory:alert",
    message: `Low stock alert (${items.length} item${items.length === 1 ? "" : "s"})`,
    payload: {
      items: items.map((i) => ({
        name: i.name,
        currentStock: i.currentStock,
        threshold: i.lowStockThreshold,
        unit: i.unit,
      })),
    },
  }).catch(() => {});
};

const emitPaymentCaptured = (io, billing) => {
  io.to("admin").emit("payment:captured", {
    billingId: billing._id,
    amount: billing.total,
    method: billing.payment?.method,
  });

  void notifyRoles(["admin"], {
    type: "payment:captured",
    message: `Payment captured — Invoice ${billing._id}`,
    payload: {
      billingId: billing._id,
      amount: billing.total,
      method: billing.payment?.method,
    },
  }).catch(() => {});
};

const emitTableStatus = (io, table) => {
  io.to("receptionist").to("admin").emit("table:status", {
    tableId: table._id,
    status: table.status,
  });

  void notifyRoles(["receptionist", "admin"], {
    type: "table:status",
    message: `Table status updated — ${table.tableNumber || table._id}`,
    payload: {
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: table.status,
    },
  }).catch(() => {});
};

const emitCustomerHelpRequested = (io, helpRequest) => {
  const payload = {
    helpRequestId: helpRequest._id,
    tableId: helpRequest.table?._id || helpRequest.table,
    tableNumber: helpRequest.table?.tableNumber,
    customerName: helpRequest.customer?.name,
    orderCode: helpRequest.order?.orderCode,
    createdAt: helpRequest.createdAt,
    status: helpRequest.status,
  };

  io.to("waiter").to("admin").to("receptionist").emit("table:help", payload);

  void notifyRoles(["waiter", "admin", "receptionist"], {
    type: "table:help",
    message: `Table ${payload.tableNumber || "Unknown"} requested help`,
    payload,
  }).catch(() => {});
};

const emitCustomerHelpResolved = (io, helpRequest) => {
  io.to("waiter").to("admin").to("receptionist").emit("table:help:resolved", {
    helpRequestId: helpRequest._id,
    tableId: helpRequest.table?._id || helpRequest.table,
    resolvedAt: helpRequest.resolvedAt,
    status: helpRequest.status,
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
  emitCustomerHelpRequested,
  emitCustomerHelpResolved,
};
