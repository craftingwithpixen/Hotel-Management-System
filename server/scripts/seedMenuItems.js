require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const MenuItem = require("../models/MenuItem");

const menuItems = [
  { name: "Butter Chicken", category: "non_veg", price: 320, description: "Classic creamy tomato chicken curry." },
  { name: "Paneer Tikka", category: "veg", price: 260, description: "Marinated paneer grilled with spices." },
  { name: "Dal Makhani", category: "veg", price: 220, description: "Slow-cooked black lentils with butter." },
  { name: "Veg Biryani", category: "veg", price: 240, description: "Fragrant basmati rice with mixed vegetables." },
  { name: "Chicken Biryani", category: "non_veg", price: 340, description: "Aromatic dum biryani with tender chicken." },
  { name: "Margherita Pizza", category: "veg", price: 280, description: "Thin crust pizza with basil and mozzarella." },
  { name: "Chicken Burger", category: "non_veg", price: 210, description: "Grilled chicken patty with fresh veggies." },
  { name: "Caesar Salad", category: "veg", price: 190, description: "Crunchy lettuce with creamy dressing." },
  { name: "Fresh Lime Soda", category: "drinks", price: 80, description: "Refreshing lime soda, sweet or salted." },
  { name: "Cold Coffee", category: "drinks", price: 140, description: "Chilled coffee blended with ice cream." },
  { name: "Gulab Jamun", category: "dessert", price: 110, description: "Soft milk-solid dumplings in sugar syrup." },
  { name: "Brownie Sundae", category: "dessert", price: 170, description: "Warm brownie topped with vanilla scoop." },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const hotel = await Hotel.findOne().select("_id");
  if (!hotel) {
    throw new Error("No hotel found. Create/seed a hotel first.");
  }

  const existing = await MenuItem.find({ hotel: hotel._id, isDeleted: false }).select("name");
  const existingNames = new Set(existing.map((item) => item.name.toLowerCase()));

  const docsToInsert = menuItems
    .filter((item) => !existingNames.has(item.name.toLowerCase()))
    .map((item) => ({
      ...item,
      hotel: hotel._id,
      isAvailable: true,
    }));

  if (!docsToInsert.length) {
    console.log("No new menu items inserted. All items already exist.");
    await mongoose.disconnect();
    return;
  }

  await MenuItem.insertMany(docsToInsert, { ordered: false });
  console.log(`Inserted ${docsToInsert.length} menu item(s).`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Menu seed failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
