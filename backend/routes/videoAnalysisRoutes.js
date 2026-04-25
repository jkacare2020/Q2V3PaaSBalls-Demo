// backend/routes/videoAnalysisRoutes.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const VideoAnalysis = require("../models/VideoAnalysis/videoAnalysisModel");

const dbFirestore = admin.firestore();

router.post("/from-video/:videoId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { videoId } = req.params;

    const videoRef = dbFirestore.collection("videos").doc(videoId);
    const videoDoc = await videoRef.get();

    if (!videoDoc.exists) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = videoDoc.data();

    if (video.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden: You can only analyze your own videos",
      });
    }

    const { expertId, expertName } = req.body;

    const existing = await VideoAnalysis.findOne({ videoId, userId, expertId });

    if (existing) {
      return res.json({
        ...existing.toObject(),
        duplicate: true,
        message: "Video analysis record already exists",
      });
    }

    const analysis = await VideoAnalysis.create({
      userId,
      videoId,
      expertId,
      expertName,
      videoUrl: video.videoUrl || video.url || "",
      caption: video.caption || "",
      title: video.title || video.caption || "Untitled video",
      tags: video.tags || [],
      sourceType: "firestore-video",
      analysisStatus: "pending",
    });
    return res.json({
      ...analysis.toObject(),
      duplicate: false,
    });
  } catch (err) {
    console.error("create video analysis error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.put("/:id/mock-analyze", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      transcript,
      processSteps,
      extractedSignals,
      consistencyScore,
      linkedPersonaId,
    } = req.body || {};

    const updated = await VideoAnalysis.findByIdAndUpdate(
      id,
      {
        transcript: transcript || "",
        processSteps: processSteps || [],
        extractedSignals: extractedSignals || {},
        consistencyScore:
          typeof consistencyScore === "number" ? consistencyScore : null,
        linkedPersonaId: linkedPersonaId || null,
        analysisStatus: "analyzed",
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "VideoAnalysis not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("mock analyze video error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const analyses = await VideoAnalysis.find().sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    console.error("get video analyses error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/expert/:expertId/observed-persona", async (req, res) => {
  try {
    const { expertId } = req.params;

    const videos = await VideoAnalysis.find({
      expertId,
      analysisStatus: "analyzed",
    });

    if (!videos.length) {
      return res.json({ message: "No analyzed videos found" });
    }

    let totalHeat = 0;
    let totalSpeed = 0;
    let totalComplexity = 0;

    const techniqueCount = {};

    videos.forEach((v) => {
      const s = v.extractedSignals || {};

      totalHeat += s.heatLevel || 0;
      totalSpeed += s.speed || 0;
      totalComplexity += s.complexity || 0;

      const tech = s.technique || "unknown";
      techniqueCount[tech] = (techniqueCount[tech] || 0) + 1;
    });

    const count = videos.length;

    // 找 dominant technique
    let dominantTechnique = "";
    let max = 0;
    for (const t in techniqueCount) {
      if (techniqueCount[t] > max) {
        dominantTechnique = t;
        max = techniqueCount[t];
      }
    }

    const result = {
      expertId,
      expertName: videos[0].expertName,
      videoCount: count,
      observedStyle: {
        averageHeat: totalHeat / count,
        averageSpeed: totalSpeed / count,
        averageComplexity: totalComplexity / count,
        dominantTechnique,
      },
      summary: `This chef tends to cook with ${dominantTechnique}, high heat and fast speed.`,
    };

    res.json(result);
  } catch (err) {
    console.error("observed persona error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/dev/from-video/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    const videoRef = dbFirestore.collection("videos").doc(videoId);
    const videoDoc = await videoRef.get();

    if (!videoDoc.exists) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = videoDoc.data();

    const existing = await VideoAnalysis.findOne({ videoId });

    if (existing) {
      return res.json({
        ...existing.toObject(),
        duplicate: true,
        message: "Video analysis record already exists",
      });
    }

    const analysis = await VideoAnalysis.create({
      userId: video.userId || null,
      videoId,
      videoUrl: video.videoUrl || video.url || "",
      caption: video.caption || "",
      title: video.title || video.caption || "Untitled video",
      tags: video.tags || [],
      sourceType: "firestore-video",
      analysisStatus: "pending",
    });

    return res.json({
      ...analysis.toObject(),
      duplicate: false,
    });
  } catch (err) {
    console.error("dev create video analysis error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
