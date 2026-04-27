const jwt = require("jsonwebtoken");

module.exports = (io) => {
  io.on("connection", (socket) => {
    let user = null;

    // Verify JWT from handshake auth
    try {
      const token = socket.handshake.auth.token;
      if (token) {
        user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      }
    } catch (err) {
      console.log("Socket auth failed:", err.message);
    }

    // Join kitchen room (chefs and admins)
    socket.on("join:kitchen", () => {
      if (user && ["chef", "admin"].includes(user.role)) {
        socket.join("kitchen");
      }
    });

    // Join table room (for live order updates)
    socket.on("join:table", ({ tableId }) => {
      if (tableId) socket.join(`table:${tableId}`);
    });

    // Join admin room
    socket.on("join:admin", () => {
      if (user && ["admin", "manager"].includes(user.role)) {
        socket.join("admin");
      }
    });

    // Join waiter room
    socket.on("join:waiter", () => {
      if (user) {
        socket.join(`waiter:${user.id}`);
      }
    });

    // Join receptionist room
    socket.on("join:receptionist", () => {
      if (user && ["receptionist", "admin"].includes(user.role)) {
        socket.join("receptionist");
      }
    });

    socket.on("disconnect", () => {
      // Socket.io auto-removes from rooms
    });
  });
};
