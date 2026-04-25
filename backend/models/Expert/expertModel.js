const mongoose = require("mongoose");

const ExpertSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },

    expertId: { type: String, required: true, unique: true, index: true },
    expertName: { type: String, required: true },

    category: { type: String, default: "cooking" },

    description: { type: String, default: "" },

    tags: {
      type: [String],
      default: [],
    },

    sourceTypes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expert", ExpertSchema);
