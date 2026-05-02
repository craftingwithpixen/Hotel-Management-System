const User = require("../models/User");
const emailService = require("./emailService");
const { emitInventoryAlert } = require("./socketService");

const getLowStockRecipients = async () => {
  const users = await User.find({
    role: { $in: ["admin", "manager"] },
    isDeleted: false,
    email: { $exists: true, $ne: "" },
  }).select("email");

  return [...new Set(users.map((user) => user.email).filter(Boolean))];
};

const sendLowStockAlerts = async (items, io) => {
  const lowItems = items.filter((item) => item.currentStock <= item.lowStockThreshold);
  if (lowItems.length === 0) return { sentTo: [] };

  if (io) emitInventoryAlert(io, lowItems);

  const recipients = await getLowStockRecipients();
  await Promise.all(recipients.map((email) => emailService.sendLowStockAlert(email, lowItems)));

  return { sentTo: recipients };
};

module.exports = {
  getLowStockRecipients,
  sendLowStockAlerts,
};
