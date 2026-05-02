require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const socketHandler = require("./sockets/socketHandler");
const { startStockAlertJob } = require("./jobs/stockAlertJob");

// Route imports
const authRoutes = require("./routes/v1/auth.routes");
const hotelRoutes = require("./routes/v1/hotel.routes");
const roomRoutes = require("./routes/v1/room.routes");
const tableRoutes = require("./routes/v1/table.routes");
const bookingRoutes = require("./routes/v1/booking.routes");
const menuRoutes = require("./routes/v1/menu.routes");
const orderRoutes = require("./routes/v1/order.routes");
const billingRoutes = require("./routes/v1/billing.routes");
const paymentRoutes = require("./routes/v1/payment.routes");
const staffRoutes = require("./routes/v1/staff.routes");
const inventoryRoutes = require("./routes/v1/inventory.routes");
const reportRoutes = require("./routes/v1/report.routes");
const customerRoutes = require("./routes/v1/customer.routes");
const notificationRoutes = require("./routes/v1/notification.routes");
const helpRoutes = require("./routes/v1/help.routes");

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io);
socketHandler(io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  ["body", "params", "headers"].forEach((key) => {
    if (req[key]) {
      req[key] = mongoSanitize.sanitize(req[key]);
    }
  });

  // req.query can be getter-only in newer Express stacks; sanitize in place.
  if (req.query) {
    mongoSanitize.sanitize(req.query);
  }

  next();
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/hotel", hotelRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/tables", tableRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/help-requests", helpRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Grand Paradise server running on port ${PORT}`);
    startStockAlertJob(io);
  });
});

module.exports = { app, server, io };
