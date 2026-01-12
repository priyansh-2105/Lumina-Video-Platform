require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Test the duration extraction function directly
async function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`, (error, stdout) => {
      if (error) {
        console.error("Error getting video duration:", error);
        reject(error);
        return;
      }
      
      const duration = parseFloat(stdout.trim());
      console.log("🎬 Extracted duration:", duration, "seconds");
      resolve(duration);
    });
  });
}

async function testDurationExtraction() {
  console.log("🧪 Testing duration extraction...");
  
  try {
    // Test with a non-existent file (should handle gracefully)
    console.log("Testing with non-existent file...");
    await getVideoDuration("non-existent.mp4");
  } catch (error) {
    console.log("✅ Correctly handled non-existent file:", error.message);
  }
}

testDurationExtraction().catch(console.error);
