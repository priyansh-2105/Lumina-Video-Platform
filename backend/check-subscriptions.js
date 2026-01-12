require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

async function checkSubscriptions() {
  try {
    await connectDB();
    
    const userId = '69648b2220c2c6c5e55ab70e';
    console.log("🔍 Checking subscriptions for user:", userId);
    
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found");
      return;
    }
    
    console.log("👤 User found:", {
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptions: user.subscriptions,
      subscriptionsCount: user.subscriptions?.length || 0
    });
    
    // Check if subscriptions are valid ObjectIds
    if (user.subscriptions && user.subscriptions.length > 0) {
      console.log("🔍 Checking subscription ObjectIds...");
      for (let i = 0; i < user.subscriptions.length; i++) {
        const subId = user.subscriptions[i];
        console.log(`  Subscription ${i}:`, subId, typeof subId);
        
        // Try to find if this creator exists
        const creator = await User.findById(subId);
        console.log(`    Creator exists:`, !!creator);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkSubscriptions();
