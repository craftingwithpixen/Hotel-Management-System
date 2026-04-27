require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Hotel = require("./models/Hotel");
const Room = require("./models/Room");
const Table = require("./models/Table");
const MenuItem = require("./models/MenuItem");
const Staff = require("./models/Staff");

const seedData = async () => {
  try {
    console.log("⏳ Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      Room.deleteMany({}),
      Table.deleteMany({}),
      MenuItem.deleteMany({}),
      Staff.deleteMany({}),
    ]);

    // 1. Create Hotel
    console.log("🏨 Creating sample hotel...");
    const hotel = await Hotel.create({
      name: "Grand Paradise Resort",
      email: "contact@grandparadise.com",
      phone: "+91 98765 43210",
      address: {
        street: "123 Luxury Avenue",
        city: "North Goa",
        state: "Goa",
        pincode: "403001",
      },
      gstNumber: "22AAAAA0000A1Z5",
      gstRate: 18,
      currency: "INR",
    });

    // 2. Create Users
    console.log("👥 Creating users...");
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash("password123", salt);

    const users = [
      { name: "Super Admin", email: "admin@gmail.com", password: commonPassword, role: "admin", isVerified: true },
      { name: "Manager John", email: "manager@gmail.com", password: commonPassword, role: "manager", isVerified: true },
      { name: "Receptionist Alice", email: "reception@gmail.com", password: commonPassword, role: "receptionist", isVerified: true },
      { name: "Chef Vikram", email: "chef@gmail.com", password: commonPassword, role: "chef", isVerified: true },
      { name: "Waiter Raj", email: "waiter@gmail.com", password: commonPassword, role: "waiter", isVerified: true },
      { name: "Guest Customer", email: "guest@gmail.com", password: commonPassword, role: "customer", isVerified: true },
    ];

    const createdUsers = await User.insertMany(users);

    // 3. Create Staff Records
    console.log("👨‍💼 Creating staff records...");
    const staffRecords = [
      { user: createdUsers[1]._id, hotel: hotel._id, employeeId: "EMP001", department: "Management", salary: 50000, joiningDate: new Date("2024-01-15") },
      { user: createdUsers[2]._id, hotel: hotel._id, employeeId: "EMP002", department: "Front Desk", salary: 25000, joiningDate: new Date("2024-02-10") },
      { user: createdUsers[3]._id, hotel: hotel._id, employeeId: "EMP003", department: "Kitchen", salary: 35000, joiningDate: new Date("2024-03-05") },
      { user: createdUsers[4]._id, hotel: hotel._id, employeeId: "EMP004", department: "Restaurant", salary: 18000, joiningDate: new Date("2024-04-01") },
    ];
    await Staff.insertMany(staffRecords);

    // 4. Create Rooms
    console.log("🛏️ Creating rooms...");
    const rooms = [
      { hotel: hotel._id, roomNumber: "101", type: "single", pricePerNight: 2500, capacity: 1, floor: 1, status: "available" },
      { hotel: hotel._id, roomNumber: "102", type: "double", pricePerNight: 4000, capacity: 2, floor: 1, status: "available" },
      { hotel: hotel._id, roomNumber: "201", type: "deluxe", pricePerNight: 6500, capacity: 2, floor: 2, status: "available" },
      { hotel: hotel._id, roomNumber: "301", type: "suite", pricePerNight: 12000, capacity: 4, floor: 3, status: "maintenance" },
    ];
    await Room.insertMany(rooms);

    // 5. Create Tables
    console.log("🍽️ Creating tables...");
    const tables = [
      { hotel: hotel._id, tableNumber: "T-01", capacity: 2, location: "Indoor", status: "available" },
      { hotel: hotel._id, tableNumber: "T-02", capacity: 4, location: "Indoor", status: "available" },
      { hotel: hotel._id, tableNumber: "T-03", capacity: 6, location: "Outdoor", status: "available" },
    ];
    await Table.insertMany(tables);

    // 6. Create Menu Items
    console.log("🍕 Creating menu items...");
    const menuItems = [
      { hotel: hotel._id, name: "Butter Chicken", category: "non_veg", price: 320, description: "Classic Indian curry", isAvailable: true },
      { hotel: hotel._id, name: "Paneer Tikka", category: "veg", price: 260, description: "Grilled cottage cheese", isAvailable: true },
      { hotel: hotel._id, name: "Dal Makhani", category: "veg", price: 220, description: "Slow-cooked black lentils", isAvailable: true },
      { hotel: hotel._id, name: "Fresh Lime Soda", category: "drinks", price: 80, description: "Refreshing drink", isAvailable: true },
    ];
    await MenuItem.insertMany(menuItems);

    console.log("\n🚀 Seeding completed successfully!");
    console.log("\n--- CREDENTIALS (Password: password123) ---");
    console.log("Admin:      admin@gmail.com");
    console.log("Manager:    manager@gmail.com");
    console.log("Reception:  reception@gmail.com");
    console.log("Chef:       chef@gmail.com");
    console.log("Waiter:     waiter@gmail.com");
    console.log("Customer:   guest@gmail.com");
    console.log("-------------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
