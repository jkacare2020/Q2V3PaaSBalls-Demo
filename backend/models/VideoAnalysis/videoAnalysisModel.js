const mongoose = require("mongoose");

const VideoAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },

    // Firestore videos doc id
    videoId: { type: String, required: true, index: true },

    expertId: { type: String, index: true, default: "" },
    expertName: { type: String, default: "" },

    dishName: { type: String, default: "" },

    videoUrl: { type: String, required: true },
    caption: { type: String, default: "" },
    title: { type: String, default: "" },

    sourceType: {
      type: String,
      enum: ["firestore-video"],
      default: "firestore-video",
    },

    transcript: { type: String, default: "" },

    processSteps: {
      type: [String],
      default: [],
    },

    extractedSignals: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    linkedPersonaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persona",
      default: null,
    },

    consistencyScore: {
      type: Number,
      default: null,
    },

    analysisStatus: {
      type: String,
      enum: ["pending", "transcribed", "analyzed", "failed"],
      default: "pending",
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("VideoAnalysis", VideoAnalysisSchema);
