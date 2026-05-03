//F:\My_App\quasar2v3\Q2V3PaaSBalls-Cleaned -Demo\backend\controllers\personaV06Controller.js
const PersonaV06 = require("../models/personaV06Model");

const { callOpenAI } = require("../services/openaiService");
const { buildPersonaV06Prompt } = require("../utils/personaV06PromptBuilder");
const {
  detectDomain,
  getDomainConfig,
} = require("../utils/personaV06DomainMap");

const {
  normalizePersona,
  buildDefaultCognitiveProfile,
  generateWhy,
  generatePhilosophyWhy,
  generateNextActions,
  generateRiskWarning,
} = require("../utils/personaV06Utils");

// CREATE or UPDATE V06 persona
const createOrUpdatePersonaV06 = async (req, res) => {
  try {
    const { userId, ...payload } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const updateData = {
      ...payload,
    };

    if (!updateData.cognitiveProfile) {
      updateData.cognitiveProfile = buildDefaultCognitiveProfile(updateData);
    }

    const persona = await PersonaV06.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true },
    );

    res.status(200).json({
      message: "Persona V06 saved successfully",
      persona,
    });
  } catch (error) {
    console.error("❌ createOrUpdatePersonaV06 error:", error);
    res.status(500).json({
      message: "Failed to save Persona V06",
      error: error.message,
    });
  }
};

// GET persona by userId
const getPersonaV06ByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const persona = await PersonaV06.findOne({ userId });

    if (!persona) {
      return res.status(404).json({ message: "Persona V06 not found" });
    }

    res.status(200).json(persona);
  } catch (error) {
    console.error("❌ getPersonaV06ByUserId error:", error);
    res.status(500).json({
      message: "Failed to load Persona V06",
      error: error.message,
    });
  }
};

// GENERATE response + WHY
const generatePersonaV06Response = async (req, res) => {
  try {
    const { userId, question } = req.body;

    if (!userId || !question) {
      return res.status(400).json({
        message: "userId and question are required",
      });
    }

    let persona = await PersonaV06.findOne({ userId });

    if (!persona) {
      return res.status(404).json({
        message: "Persona V06 not found. Please create one first.",
      });
    }

    persona = normalizePersona(persona.toObject());

    // ✅ Domain must be after persona exists
    const domain = detectDomain(question);
    const domainConfig = getDomainConfig(domain, persona);

    const prompt = buildPersonaV06Prompt({
      persona,
      question,
    });

    const answer = await callOpenAI(prompt);

    const why = generateWhy(answer, persona);
    const nextActions = generateNextActions(domain, domainConfig, persona);
    const riskWarning = generateRiskWarning(domain);

    let whyPhilosophy = null;
    if (persona.outputSettings?.includePhilosophyWhy) {
      whyPhilosophy = generatePhilosophyWhy(answer, persona);
    }

    const historyItem = {
      question,
      answer,
      why,
      createdAt: new Date(),
    };

    await PersonaV06.findOneAndUpdate(
      { userId },
      {
        $push: {
          "cognitiveMemory.reasoningHistory": historyItem,
        },
      },
    );

    res.status(200).json({
      answer,
      why,
      whyPhilosophy,
      domain,
      philosophy: domainConfig.philosophy,
      nextActions,
      riskWarning,
      personaMode: persona.aiInvolvementControl?.mode || "advisor",
      depthLevel: persona.aiInvolvementControl?.depthLevel || 2,
    });
  } catch (error) {
    console.error("❌ generatePersonaV06Response error:", error);
    res.status(500).json({
      message: "Failed to generate Persona V06 response",
      error: error.message,
    });
  }
};
module.exports = {
  createOrUpdatePersonaV06,
  getPersonaV06ByUserId,
  generatePersonaV06Response,
};
