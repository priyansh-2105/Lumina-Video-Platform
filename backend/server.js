
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

// Initialize DB before anything else
connectDB().then(() => {
  console.log("⚡ Server ready to handle requests");
}).catch((err) => {
  console.error("❌ Failed to initialize DB, server will not start:", err);
  process.exit(1);
});

// Require models after DB is connected
const User = require("./models/User");
const Video = require("./models/Video");
const Comment = require("./models/Comment");
const WatchHistory = require("./models/WatchHistory");
const Reaction = require("./models/Reaction");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "lumina_secret";

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, "uploads");
const videosDir = path.join(uploadsDir, "videos");
const thumbnailsDir = path.join(uploadsDir, "thumbnails");
[uploadsDir, videosDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") {
      cb(null, videosDir);
    } else if (file.fieldname === "thumbnail") {
      cb(null, thumbnailsDir);
    } else {
      cb(new Error("Unexpected field"), null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

function getAuthUser(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  req.user = user;
  next();
}

function ensureVideoShape(video) {
  return {
    id: video._id ? video._id.toString() : video.id,
    title: video.title || "",
    description: video.description || "",
    category: video.category || "",
    thumbnail: video.thumbnail || "",
    videoUrl: video.videoUrl || "",
    creatorId: video.creatorId ? video.creatorId.toString() : "",
    creatorName: video.creatorName || "",
    creatorAvatar: video.creatorAvatar || "",
    views: Number(video.views || 0),
    likes: Number(video.likes || 0),
    dislikes: Number(video.dislikes || 0),
    duration: Number(video.duration || 0),
    createdAt: video.createdAt ? video.createdAt.toISOString() : new Date().toISOString(),
  };
}

// in-memory file storage (for local dev) - DEPRECATED, now using disk
// let videoFiles = {};
// let thumbnailFiles = {};

const categories = [
  "All",
  "Education",
  "Travel",
  "Food",
  "Fitness",
  "Technology",
  "Photography",
  "Music",
  "Gaming",
  "Entertainment",
];

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, avatar, description } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Missing required fields: name, email, password" });
  }

  try {
    const user = new User({
      name,
      email,
      password, // In production, you should hash this
      role: role || "viewer",
      avatar: avatar || "",
      description: description || "",
    });
    await user.save();
    const token = jwt.sign({ id: user._id.toString(), name: user.name, email: user.email, role: user.role }, SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === "email") {
        return res.status(409).json({ message: "Email already exists" });
      }
      return res.status(409).json({ message: "Duplicate field" });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Missing required field: email" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });
    // In production, you should compare hashed passwords
    const token = jwt.sign({ id: user._id.toString(), name: user.name, email: user.email, role: user.role }, SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Check if current user is subscribed to this creator
    let isSubscribed = false;
    if (req.user) {
      const currentUser = await User.findById(req.user.id);
      isSubscribed = currentUser?.subscriptions?.includes(user._id) || false;
    }
    
    res.json({
      id: user._id.toString(),
      name: user.name,
      avatar: user.avatar,
      description: user.description,
      role: user.role,
      subscribersCount: user.subscribersCount || 0,
      isSubscribed,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.get("/api/categories", (req, res) => {
  res.json(categories);
});

app.get("/api/videos", async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};
    if (category && String(category).toLowerCase() !== "all") {
      filter.category = new RegExp(`^${String(category)}$`, "i");
    }
    let videos = await Video.find(filter).lean();
    if (search) {
      const q = String(search).toLowerCase();
      videos = videos.filter(v =>
        (v.title || "").toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q) ||
        (v.creatorName || "").toLowerCase().includes(q)
      );
    }
    res.json(videos.map(ensureVideoShape));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

app.get("/api/videos/subscriptions-feed", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const subscriptions = user.subscriptions || [];

    if (subscriptions.length === 0) {
      return res.json([]);
    }

    // Get videos from subscribed creators
    const videos = await Video.find({ 
      creatorId: { $in: subscriptions }
    }).sort({ createdAt: -1 }).lean();

    res.json(videos.map(ensureVideoShape));
  } catch (err) {
    console.error("Subscriptions feed error:", err);
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
});

app.get("/api/videos/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const video = await Video.findById(req.params.id).lean();
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(ensureVideoShape(video));
  } catch (err) {
    console.error("Get video error:", err);
    res.status(500).json({ message: "Failed to fetch video" });
  }
});

app.post(
  "/api/videos/upload",
  requireAuth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("Upload request received, user:", req.user?.id, req.user?.role);
    if (req.user.role !== "creator") {
      console.warn("Upload attempt by non-creator:", req.user?.id);
      return res.status(403).json({ message: "Only creators can upload" });
    }

    const files = req.files || {};
    const videoFile = files.video && files.video[0];
    const thumbnailFile = files.thumbnail && files.thumbnail[0];

    if (!videoFile) {
      console.warn("Upload missing video file");
      return res.status(400).json({ message: "Video file is required" });
    }

    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      console.warn("Upload missing metadata:", { title, description, category });
      return res.status(400).json({ message: "Missing required fields: title, description, category" });
    }

    const baseUrl = "http://localhost:5000";
    const video = new Video({
      title,
      description,
      category,
      thumbnail: thumbnailFile ? `${baseUrl}/api/videos/:id/thumbnail` : "",
      videoUrl: `${baseUrl}/api/videos/:id/stream`,
      videoPath: videoFile.path, // required field
      thumbnailPath: thumbnailFile ? thumbnailFile.path : undefined,
      creatorId: req.user.id,
      creatorName: req.user.name,
      creatorAvatar: req.user.avatar || "",
      views: 0,
      likes: 0,
      dislikes: 0,
      duration: 0,
    });

    try {
      await video.save();
      const savedVideo = await Video.findById(video._id).lean();
      const videoId = savedVideo._id.toString();

      // Update URLs with actual ID
      await Video.findByIdAndUpdate(videoId, {
        videoUrl: `${baseUrl}/api/videos/${videoId}/stream`,
        thumbnail: savedVideo.thumbnailPath ? `${baseUrl}/api/videos/${videoId}/thumbnail` : "",
      });

      const updatedVideo = await Video.findById(videoId).lean();

      console.log("Upload successful, videoId:", videoId);
      res.json(ensureVideoShape(updatedVideo));
    } catch (err) {
      console.error("Upload DB save error:", err);
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(e => e.message).join(", ");
        return res.status(400).json({ message: messages });
      }
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

app.get("/api/videos/:id/thumbnail", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const video = await Video.findById(req.params.id).lean();
    if (!video || !video.thumbnailPath) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }
    if (!fs.existsSync(video.thumbnailPath)) {
      return res.status(404).json({ message: "Thumbnail file not found" });
    }
    const stat = fs.statSync(video.thumbnailPath);
    const readStream = fs.createReadStream(video.thumbnailPath);
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", stat.size);
    readStream.pipe(res);
  } catch (err) {
    console.error("Thumbnail stream error:", err);
    res.status(500).json({ message: "Failed to stream thumbnail" });
  }
});

app.get("/api/videos/:id/stream", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const video = await Video.findById(req.params.id).lean();
    if (!video || !video.videoPath) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (!fs.existsSync(video.videoPath)) {
      return res.status(404).json({ message: "Video file not found" });
    }
    const stat = fs.statSync(video.videoPath);
    const range = req.headers.range;

    if (!range) {
      const readStream = fs.createReadStream(video.videoPath);
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Length", stat.size);
      res.setHeader("Accept-Ranges", "bytes");
      readStream.pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = (end - start) + 1;

    if (start >= stat.size || end >= stat.size || start > end) {
      return res.status(416).json({ message: "Requested range not satisfiable" });
    }

    const readStream = fs.createReadStream(video.videoPath, { start, end });
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Length", chunksize);
    res.setHeader("Content-Type", "video/mp4");
    readStream.pipe(res);
  } catch (err) {
    console.error("Video stream error:", err);
    res.status(500).json({ message: "Failed to stream video" });
  }
});

app.delete("/api/videos/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (req.user.role !== "creator" || String(video.creatorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Delete files from disk
    if (video.videoPath && fs.existsSync(video.videoPath)) {
      fs.unlinkSync(video.videoPath);
    }
    if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
      fs.unlinkSync(video.thumbnailPath);
    }

    await Video.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ videoId: req.params.id });
    await Reaction.deleteMany({ videoId: req.params.id });
    await WatchHistory.deleteMany({ videoId: req.params.id });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ message: "Failed to delete video" });
  }
});

app.post("/api/videos/:id/view", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json({ views: video.views });
  } catch (err) {
    console.error("Increment views error:", err);
    res.status(500).json({ message: "Failed to increment views" });
  }
});

app.post("/api/videos/:id/like", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const existing = await Reaction.findOne({ videoId: req.params.id, userId: req.user.id });
    let likes = Number(video.likes || 0);
    let dislikes = Number(video.dislikes || 0);
    let action = "like";

    if (existing) {
      if (existing.action === "like") {
        await Reaction.findByIdAndDelete(existing._id);
        likes = Math.max(0, likes - 1);
        action = null;
      } else {
        existing.action = "like";
        await existing.save();
        likes += 1;
        dislikes = Math.max(0, dislikes - 1);
      }
    } else {
      await Reaction.create({ videoId: req.params.id, userId: req.user.id, action: "like" });
      likes += 1;
    }

    video.likes = likes;
    video.dislikes = dislikes;
    await video.save();

    res.json({ likes, dislikes, action });
  } catch (err) {
    console.error("Like video error:", err);
    res.status(500).json({ message: "Failed to like video" });
  }
});

app.post("/api/videos/:id/dislike", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const existing = await Reaction.findOne({ videoId: req.params.id, userId: req.user.id });
    let likes = Number(video.likes || 0);
    let dislikes = Number(video.dislikes || 0);
    let action = "dislike";

    if (existing) {
      if (existing.action === "dislike") {
        await Reaction.findByIdAndDelete(existing._id);
        dislikes = Math.max(0, dislikes - 1);
        action = null;
      } else {
        existing.action = "dislike";
        await existing.save();
        dislikes += 1;
        likes = Math.max(0, likes - 1);
      }
    } else {
      await Reaction.create({ videoId: req.params.id, userId: req.user.id, action: "dislike" });
      dislikes += 1;
    }

    video.likes = likes;
    video.dislikes = dislikes;
    await video.save();

    res.json({ likes, dislikes, action });
  } catch (err) {
    console.error("Dislike video error:", err);
    res.status(500).json({ message: "Failed to dislike video" });
  }
});

app.get("/api/videos/:id/comments", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const comments = await Comment.find({ videoId: req.params.id }).lean();
    res.json(comments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

app.post("/api/videos/:id/comment", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const comment = new Comment({
      videoId: req.params.id,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "",
      content: req.body.content,
    });
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

app.get("/api/users/history/me", requireAuth, async (req, res) => {
  try {
    const history = await WatchHistory.find({ userId: req.user.id }).sort({ watchedAt: -1 }).lean();
    res.json(history);
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

app.get("/api/users/history/:userId", requireAuth, async (req, res) => {
  if (String(req.user.id) !== String(req.params.userId)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const history = await WatchHistory.find({ userId: req.params.userId }).sort({ watchedAt: -1 }).lean();
    res.json(history);
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

app.delete("/api/users/history/:userId", requireAuth, async (req, res) => {
  if (String(req.user.id) !== String(req.params.userId)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    await WatchHistory.deleteMany({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    console.error("Clear history error:", err);
    res.status(500).json({ message: "Failed to clear history" });
  }
});

app.delete("/api/users/history/me", requireAuth, async (req, res) => {
  try {
    await WatchHistory.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    console.error("Clear history error:", err);
    res.status(500).json({ message: "Failed to clear history" });
  }
});

app.post("/api/videos/:id/progress", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const userId = req.body.userId || req.user.id;
    if (String(userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const progress = Number(req.body.progress || 0);
    const existing = await WatchHistory.findOne({ userId, videoId: req.params.id });

    const item = {
      userId,
      videoId: req.params.id,
      progress,
      watchedAt: new Date(),
      video: ensureVideoShape(video.toObject()),
    };

    if (existing) {
      await WatchHistory.findByIdAndUpdate(existing._id, item);
      item.id = existing._id.toString();
    } else {
      const created = await WatchHistory.create(item);
      item.id = created._id.toString();
    }

    // Trim history to 50 items per user
    await WatchHistory.deleteMany({
      userId,
      _id: { $nin: [existing ? existing._id : item.id] },
    }).sort({ watchedAt: -1 }).skip(50);

    res.json(item);
  } catch (err) {
    console.error("Save progress error:", err);
    res.status(500).json({ message: "Failed to save progress" });
  }
});

app.post("/api/users/:creatorId/subscribe", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.creatorId)) {
      return res.status(400).json({ message: "Invalid creator ID" });
    }

    const creatorId = req.params.creatorId;
    const userId = req.user.id;

    // Don't allow self-subscription
    if (creatorId === userId) {
      return res.status(400).json({ message: "Cannot subscribe to yourself" });
    }

    // Check if creator exists
    const creator = await User.findById(creatorId);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    // Get current user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already subscribed
    if (user.subscriptions?.includes(creatorId)) {
      return res.status(400).json({ message: "Already subscribed" });
    }

    // Add subscription
    await User.findByIdAndUpdate(userId, {
      $push: { subscriptions: creatorId }
    });

    // Increment creator's subscriber count
    await User.findByIdAndUpdate(creatorId, {
      $inc: { subscribersCount: 1 }
    });

    res.json({ 
      success: true, 
      subscribersCount: (creator.subscribersCount || 0) + 1,
      isSubscribed: true 
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Failed to subscribe" });
  }
});

app.post("/api/users/:creatorId/unsubscribe", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.creatorId)) {
      return res.status(400).json({ message: "Invalid creator ID" });
    }

    const creatorId = req.params.creatorId;
    const userId = req.user.id;

    // Check if creator exists
    const creator = await User.findById(creatorId);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    // Get current user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if subscribed
    if (!user.subscriptions?.includes(creatorId)) {
      return res.status(400).json({ message: "Not subscribed" });
    }

    // Remove subscription
    await User.findByIdAndUpdate(userId, {
      $pull: { subscriptions: creatorId }
    });

    // Decrement creator's subscriber count (don't go below 0)
    const newCount = Math.max(0, (creator.subscribersCount || 0) - 1);
    await User.findByIdAndUpdate(creatorId, {
      $set: { subscribersCount: newCount }
    });

    res.json({ 
      success: true, 
      subscribersCount: newCount,
      isSubscribed: false 
    });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

app.get("/api/users/me/subscriptions", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('subscriptions', 'name avatar role subscribersCount');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      subscriptions: user.subscriptions || [],
      count: user.subscriptions?.length || 0
    });
  } catch (err) {
    console.error("Get subscriptions error:", err);
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

