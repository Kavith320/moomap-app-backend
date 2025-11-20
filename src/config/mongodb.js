const mongoose = require("mongoose");
require("dotenv").config();

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🍃 MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

// IMPORTANT: export the function DIRECTLY
module.exports = connectMongo;
