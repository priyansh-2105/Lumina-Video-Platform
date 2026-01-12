require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

async function checkUser() {
  try {
    await connectDB();
    
    const userId = '69648b2220c2c6c5e55ab70e';
    console.log("🔍 Checking user with ID:", userId);
    
    const user = await User.findById(userId);
    console.log("User found:", !!user);
    
    if (user) {
      console.log("User details:", {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      console.log("❌ User not found in database");
      
      // Check all users
      const allUsers = await User.find({});
      console.log("Total users in database:", allUsers.length);
      allUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - ${u._id.toString()}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUser();
