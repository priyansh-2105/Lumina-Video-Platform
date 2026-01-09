const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, enum: ["like", "dislike"], required: true },
}, { timestamps: true });

reactionSchema.index({ videoId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", reactionSchema);
