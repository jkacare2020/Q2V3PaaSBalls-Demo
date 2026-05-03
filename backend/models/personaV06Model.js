const mongoose = require("mongoose");

const PersonaV06Schema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "Personal Cognitive Persona V06",
    },

    identity: {
      name: String,
      role: String,
      background: String,
      lifeStage: String,
    },

    skillProfile: {
      skills: [String],
      knowHow: [String],
      professionalExperience: [String],
    },

    valueProfile: {
      moralValues: [String],
      familyValues: [String],
      financialValues: [String],
      traditionValues: [String],
    },

    languageProfile: {
      primaryLanguage: {
        type: String,
        default: "en-US",
      },
      outputLanguage: {
        type: String,
        default: "en-US",
      },
      culturalContext: String,
      thinkingStyle: String,
      toneStyle: String,
    },

    cognitiveProfile: {
      thinkingStyle: {
        style: String,
        why: [String],
      },
      speakingStyle: {
        style: String,
        why: [String],
      },
      decisionStyle: {
        style: String,
        why: [String],
      },
      teachingStyle: {
        style: String,
        why: [String],
      },
      judgingStyle: {
        style: String,
        why: [String],
      },
      adaptationStyle: {
        style: String,
        why: [String],
      },
    },

    aiInvolvementControl: {
      mode: {
        type: String,
        enum: ["observer", "advisor", "copilot"],
        default: "advisor",
      },
      depthLevel: {
        type: Number,
        default: 2,
      },
      allowChallenge: {
        type: Boolean,
        default: true,
      },
      allowMoralJudgement: {
        type: Boolean,
        default: false,
      },
      allowBehaviorCorrection: {
        type: Boolean,
        default: true,
      },
    },

    cognitiveMemory: {
      stableBeliefs: [String],
      evolvingBeliefs: [String],
      decisionPatterns: [String],
      reasoningHistory: [
        {
          question: String,
          answer: String,
          why: Object,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    mediaInputs: {
      textNotes: [String],
      imageRefs: [String],
      audioRefs: [String],
      videoRefs: [String],
    },

    outputSettings: {
      format: {
        type: String,
        default: "structured",
      },
      detailLevel: {
        type: String,
        enum: ["short", "medium", "deep"],
        default: "medium",
      },
      includeWhy: {
        type: Boolean,
        default: true,
      },
      includePhilosophyWhy: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PersonaV06", PersonaV06Schema);
