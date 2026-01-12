const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["viewer", "creator"], default: "viewer" },
  avatar: { type: String, default: "" },
  description: { type: String, default: "" },
  subscribersCount: { type: Number, default: 0 },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// Index for faster subscription queries
userSchema.index({ subscriptions: 1 });

module.exports = mongoose.model("User", userSchema);
