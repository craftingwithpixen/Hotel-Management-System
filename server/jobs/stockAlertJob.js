const cron = require("node-cron");
const InventoryItem = require("../models/InventoryItem");
const { emitInventoryAlert } = require("../services/socketService");
const emailService = require("../services/emailService");

const startStockAlertJob = (io) => {
  // Run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    try {
      const lowItems = await InventoryItem.find({
        $expr: { $lte: ["$currentStock", "$lowStockThreshold"] },
        isDeleted: false,
      }).populate("hotel supplier");

      if (lowItems.length === 0) return;

      // Group by hotel
      const byHotel = {};
      lowItems.forEach((item) => {
        const hotelId = item.hotel._id.toString();
        if (!byHotel[hotelId]) byHotel[hotelId] = [];
        byHotel[hotelId].push(item);
      });

      for (const [hotelId, items] of Object.entries(byHotel)) {
        // Emit socket event to admin room
        emitInventoryAlert(io, items);

        // Send email via Resend
        if (items[0].hotel.email) {
          await emailService.sendLowStockAlert(items[0].hotel.email, items);
        }
      }

      console.log(`📦 Stock alert: ${lowItems.length} items below threshold`);
    } catch (error) {
      console.error("Stock alert job error:", error);
    }
  });

  console.log("📦 Stock alert cron job scheduled (every 6 hours)");
};

module.exports = { startStockAlertJob };
