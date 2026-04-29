//--expertPersonaController.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const personaPresets = [
  {
    key: "great_grandfather",
    name: "Great Grandfather",
    description: "Traditional, stable, family-first, risk-aware.",
    style:
      "You are a wise great grandfather. Your tone is calm, serious, and caring. You value family stability, responsibility, patience, and long-term consequences.",
  },
  {
    key: "great_grandmother",
    name: "Great Grandmother",
    description: "Warm, relational, emotionally wise.",
    style:
      "You are a warm great grandmother. Your tone is gentle, emotionally intelligent, and supportive. You value relationships, kindness, family harmony, and emotional maturity.",
  },
  {
    key: "modern_expert",
    name: "Modern Advisor",
    description: "Practical, balanced, opportunity-aware.",
    style:
      "You are a modern practical advisor. Your tone is clear, balanced, and realistic. You value opportunity, independence, planning, risk management, and personal growth.",
  },
];

function buildSystemPrompt(personaStyle, userContext = "") {
  return `
You are an expert persona assistant.

Persona:
${personaStyle}

User context:
${userContext || "No saved user context yet."}

Core rules:
- Do not force a decision.
- Do not act as an absolute authority.
- Do not manipulate the user.
- Guide with care and respect.
- Ask one thoughtful follow-up question.
- Show trade-offs clearly.
- Explain the value behind your guidance.
- Keep the response concise and practical.
`;
}

async function callPersonaAI({ persona, userQuestion, userContext }) {
  const systemPrompt = buildSystemPrompt(persona.style, userContext);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userQuestion,
      },
    ],
    temperature: 0.7,
  });

  return response.choices?.[0]?.message?.content || "";
}

exports.getPersonaPresets = async (req, res) => {
  res.json({
    success: true,
    personas: personaPresets,
  });
};

exports.runSinglePersona = async (req, res) => {
  try {
    const { persona, prompt, userQuestion, userContext } = req.body;

    const personaObj = personaPresets.find(
      (p) => p.name === persona || p.key === persona,
    ) || {
      key: "custom",
      name: persona || "Custom Persona",
      description: "Custom persona from frontend.",
      style: prompt || "Be helpful, practical, and thoughtful.",
    };

    const answer = await callPersonaAI({
      persona: personaObj,
      userQuestion: userQuestion || prompt,
      userContext,
    });

    res.json({
      success: true,
      persona: personaObj.name,
      answer,
    });
  } catch (err) {
    console.error("runSinglePersona error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to run single persona demo",
      error: err.message,
    });
  }
};

exports.runMultiPersona = async (req, res) => {
  try {
    const { userQuestion, personaKeys, userContext } = req.body;

    if (!userQuestion) {
      return res.status(400).json({
        success: false,
        message: "userQuestion is required",
      });
    }

    const selectedPersonas = personaPresets.filter((p) => {
      if (!personaKeys || personaKeys.length === 0) return true;
      return personaKeys.includes(p.key);
    });

    const results = await Promise.all(
      selectedPersonas.map(async (persona) => {
        const answer = await callPersonaAI({
          persona,
          userQuestion,
          userContext,
        });

        return {
          key: persona.key,
          name: persona.name,
          description: persona.description,
          answer,
        };
      }),
    );

    res.json({
      success: true,
      question: userQuestion,
      results,
    });
  } catch (err) {
    console.error("runMultiPersona error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to run multi persona demo",
      error: err.message,
    });
  }
};
