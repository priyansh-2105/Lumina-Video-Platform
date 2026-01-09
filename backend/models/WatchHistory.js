const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true, index: true },
  progress: { type: Number, default: 0 },
  watchedAt: { type: Date, default: Date.now },
  video: { type: mongoose.Schema.Types.Mixed, default: {} }, // snapshot of video at time of watch
});

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
