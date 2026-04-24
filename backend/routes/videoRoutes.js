//videoRoutes.js
const express = require("express");
const router = express.Router();
const { createVideoPost } = require("../controllers/createVideoController");
const {
  togglePostVisibility,
  getVideos,
  deleteVideo,
} = require("../controllers/videosController");

const authenticateAndAuthorize = require("../middlewares/authMiddleware"); // Assuming auth middleware exists

// Route to Delete a video post by ID
router.delete("/videos/:id", deleteVideo);

// Route to get all video posts
router.get("/videos/", getVideos);

// Route to create a new video post
router.post("/create-video-post", createVideoPost);
// Route to create a new video visibility ---
router.put("/videos/visibility", togglePostVisibility);

module.exports = router;
