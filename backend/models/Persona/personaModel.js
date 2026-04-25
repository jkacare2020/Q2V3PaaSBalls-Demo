const mongoose = require("mongoose");

const PersonaSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },

    expertId: { type: String, index: true, default: "" },
    expertName: { type: String, default: "" },

    name: { type: String, required: true },
    philosophy: { type: String, required: true },

    priorityOrder: {
      type: [String],
      default: [],
    },

    signatureStyle: {
      type: String,
      default: "",
    },

    commonMistakes: {
      type: [String],
      default: [],
    },

    decisionLogic: {
      type: [String],
      default: [],
    },

    tradeoff: {
      flavor: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium",
      },
      speed: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium",
      },
      cost: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium",
      },
    },

    coachingPrinciples: {
      type: [String],
      default: [],
    },

    personaKey: {
      type: String,
      index: true,
    },

    sourceType: {
      type: String,
      default: "transcript",
    },

    sourceTranscript: {
      type: String,
      default: "",
    },

    sourceMeta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Persona", PersonaSchema);
