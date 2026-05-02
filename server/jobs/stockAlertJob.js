const cron = require("node-cron");
const InventoryItem = require("../models/InventoryItem");
const { sendLowStockAlerts } = require("../services/lowStockAlertService");

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

      for (const items of Object.values(byHotel)) {
        await sendLowStockAlerts(items, io);
      }

      console.log(`📦 Stock alert: ${lowItems.length} items below threshold`);
    } catch (error) {
      console.error("Stock alert job error:", error);
    }
  });

  console.log("📦 Stock alert cron job scheduled (every 6 hours)");
};

module.exports = { startStockAlertJob };
