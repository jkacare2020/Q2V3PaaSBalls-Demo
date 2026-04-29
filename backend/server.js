// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
// const connectDB = require("./config/mongooseConfig"); // Adjust the path as needed
const connectDB = require("./db/mongooseConfig");
const admin = require("./config/firebaseAdmin"); // Initialized Firebase Admin
const userRoutes = require("./routes/userRoutes"); // Import user routes
const transactRoutes = require("./routes/transactRoutes"); // Import user routes
// Import other routes as needed, e.g., transactRoutes, imageProcessingRoutes
const postRoutes = require("./routes/postRoutes");
const videoRoutes = require("./routes/videoRoutes");
const audioRoutes = require("./routes/audioRoutes");
const chatBotRoutes = require("./routes/chatBotRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const bioRoutes = require("./routes/bioRoutes");
const postProductRoutes = require("./routes/postProductRoutes");

const authenticateAndAuthorize = require("./middlewares/authMiddleware");

const updatePresence = require("./middlewares/setPresence");

const commentsRoutes = require("./routes/commentsRoutes");
const userPresenceRoutes = require("./routes/userPresenceRoutes");
const accessRoutes = require("./routes/accessRoutes");
const registerClientRoutes = require("./routes/registerClientRoutes");
const visionRoutes = require("./routes/visionRoutes");

const assignClientRoutes = require("./routes/assignClientRoutes"); // ✅ adjust path if needed

const invitationRoutes = require("./routes/invitationRoutes");

const tryLogRoutes = require("./routes/tryLogRoutes");
// const adminRoutes = require("./routes/adminRoutes");

const expertRoutes = require("./routes/expertRoutes");

const videoAnalysisRoutes = require("./routes/videoAnalysisRoutes");

const expertPersonaRoutes = require("./routes/expertPersonaRoutes");

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:9000",
      "http://localhost:9200",
      "http://localhost:9201",
      "http://localhost:9202",
      "https://q2v3paasapp.web.app",
      "https://q2v3backup.web.app",
      "https://www.ismehr.com",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      console.log("✅ CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked for:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

const personaRoutes = require("./routes/personaRoutes");

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Example: Check Firebase connectivity
admin
  .auth()
  .listUsers(1)
  .then(() => {
    console.log("Firebase Admin is connected and working.");
  })
  .catch((error) => {
    console.error("Error connecting Firebase Admin:", error);
  });

// 🔒 First: Firebase authentication middleware
// ✅ Then apply it globally like this, for example:

// app.use("/api", authenticateAndAuthorize());

// 🟢 Second: Presence updater middleware
app.use(updatePresence);

// Middleware to parse JSON bodies (if needed)
// app.use(express.json());
// Increase the payload size limit (e.g., 10MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/persona", personaRoutes);

// Public routes (no auth)
app.use("/api/products", postProductRoutes); // Includes public marketplace

// ✅ Allow public logging before auth
app.use("/api/try-log", tryLogRoutes);

app.use("/api/expert", expertRoutes);
// 🔐 Global Firebase Auth Middleware (protect everything below)
//const videoAnalysisRoutes = require("./routes/videoAnalysisRoutes");
app.use("/api/expert-persona", expertPersonaRoutes);
app.use("/api/video-analysis", videoAnalysisRoutes);
app.use("/api", authenticateAndAuthorize());
//app.use("/api/video-analysis", videoAnalysisRoutes);
// 🛠 Protected routes (must be placed AFTER the auth middleware)
// Mount Routes
app.use("/api", userRoutes); // Mount user routes under /api
app.use("/api", transactRoutes); // Uncomment if you have transact routes
app.use("/api", postRoutes);
app.use("/api", videoRoutes);
app.use("/api", audioRoutes); // Mount STT routes under /api
app.use("/api", chatBotRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/bio", bioRoutes); // ✅ Now protected
app.use("/api/comments", commentsRoutes); // ✅ Now protected
app.use("/api/presence", userPresenceRoutes); // optional
app.use("/api/access", accessRoutes);
app.use("/api", registerClientRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api", assignClientRoutes);
app.use("/api/invites", invitationRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
