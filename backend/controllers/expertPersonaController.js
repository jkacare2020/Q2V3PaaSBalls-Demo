//--expertPersonaController.js
const OpenAI = require("openai");

const PersonaSession = require("../models/PersonaSession");

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

async function comparePerspectives(responses) {
  const prompt = `
You are an expert in decision analysis.

Compare the following perspectives and produce a structured summary.

Focus on:
1. Core values of each perspective
2. Key trade-offs
3. Risks
4. Long-term consequences

Return STRICT JSON in this format:

{
  "values": {
    "grandfather": "...",
    "grandmother": "...",
    "modern": "..."
  },
  "tradeOff": "...",
  "risks": "...",
  "longTerm": "...",
  "summary": "One clear sentence summarizing the decision tension"
}

Responses:
${JSON.stringify(responses, null, 2)}
`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const raw = result.choices?.[0]?.message?.content || "";

  // 👇 清理 markdown code block
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Parse error:", e);
    console.log("RAW OUTPUT:", raw);

    return {
      summary: cleaned, // 至少前端还能显示
    };
  }
}

async function runMultiPersona(req, res) {
  try {
    const { userQuestion, userContext } = req.body;

    const personas = [
      {
        key: "grandfather",
        style: "traditional, stable, family-first, risk-aware",
      },
      {
        key: "grandmother",
        style: "warm, relational, emotionally wise",
      },
      {
        key: "modern",
        style: "practical, balanced, opportunity-aware",
      },
    ];

    // 👇 1️⃣ 收集 responses
    const responses = {};

    for (const p of personas) {
      const answer = await callPersonaAI({
        persona: p,
        userQuestion,
        userContext,
      });

      responses[p.key] = answer;
    }

    // 👇 2️⃣ compare（关键）
    const compare = await comparePerspectives(responses);
    await PersonaSession.create({
      question: userQuestion,
      responses,
      compare,
    });
    // 👇 3️⃣ 返回
    res.json({
      success: true,
      responses,
      compare,
    });
  } catch (err) {
    console.error("runMultiPersona error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getPersonaPresets(req, res) {
  res.json({
    success: true,
    personas: personaPresets,
  });
}

async function getPersonaSessions(req, res) {
  try {
    const sessions = await PersonaSession.find()
      .sort({ createdAt: -1 }) // 最新在前
      .limit(20);

    res.json({
      success: true,
      sessions,
    });
  } catch (err) {
    console.error("getPersonaSessions error:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
}

module.exports = {
  getPersonaPresets,
  runSinglePersona,
  runMultiPersona,
  getPersonaSessions, // 👈 新增
};

async function runSinglePersona(req, res) {
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
}
