const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  videoUrl: { type: String, required: true },
  videoPath: { type: String, required: true }, // disk path
  thumbnailPath: { type: String }, // disk path
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creatorName: { type: String, required: true },
  creatorAvatar: { type: String, default: "" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", videoSchema);
