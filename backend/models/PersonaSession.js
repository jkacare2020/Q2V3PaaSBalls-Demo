const mongoose = require("mongoose");

const personaSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
    },

    question: {
      type: String,
      required: true,
    },

    responses: {
      grandfather: String,
      grandmother: String,
      modern: String,
    },

    compare: {
      values: {
        grandfather: String,
        grandmother: String,
        modern: String,
      },
      tradeOff: String,
      risks: String,
      longTerm: String,
      summary: String,
    },
    favorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PersonaSession", personaSessionSchema);
