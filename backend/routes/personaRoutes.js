//personaRoutes.js
const express = require("express");
const router = express.Router();
const openai = require("../utils/openaiClient");
const Persona = require("../models/Persona/personaModel");
const VideoAnalysis = require("../models/VideoAnalysis/videoAnalysisModel");

router.post("/generate", async (req, res) => {
  try {
    const { transcript, expertId, expertName } = req.body || {};

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const prompt = `
You are an expert persona extraction engine.

Your task:
Convert a short expert transcript into a realistic, grounded expert persona.

IMPORTANT:
- Stay close to the transcript.
- Do not invent extra priorities unless they are clearly implied by the transcript.
- Do not exaggerate, over-generalize, or add unnecessary sophistication.
- Keep the output practical, believable, and grounded in real expert behavior.
- When evidence is limited, make the smallest reasonable inference.
- You must fill every field with meaningful content.
- Do not output "N/A" or leave any field empty.
- If the transcript is short, infer conservatively but still provide realistic and useful values.
- The tradeoff field must always be filled based on the expert's implied priorities.
- Prefer concrete, teachable, and realistic wording over abstract business language.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT wrap with backticks.

Return EXACTLY this structure:

{
  "name": "Captured Expert",
  "philosophy": "...",
  "priorityOrder": ["...", "...", "..."],
  "signatureStyle": "...",
  "commonMistakes": ["...", "...", "..."],
  "decisionLogic": ["step 1", "step 2", "step 3"],
  "tradeoff": {
    "flavor": "High | Medium | Low",
    "speed": "High | Medium | Low",
    "cost": "High | Medium | Low"
  },
  "coachingPrinciples": ["...", "...", "..."]
}

Rules:

- philosophy:
  One short, clear principle. No fluff.

- priorityOrder:
  Exactly 3 items.
  Only include priorities directly implied by transcript.

- signatureStyle:
  Short phrase like "texture-first cooking" or "efficiency-driven kitchen".

- commonMistakes:
  Must be realistic beginner mistakes.
  Avoid generic phrases.

- decisionLogic:
  Must be step-based.
  Reflect how the expert actually thinks.
  Keep it grounded.

- tradeoff:
  Infer realistically.
  Do not randomize.

- coachingPrinciples:
  Should sound like a real chef speaking.
  Short, direct, practical sentences.

Transcript:
${transcript}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    let text = completion.choices[0]?.message?.content || "{}";
    text = text.replace(/```json|```/g, "").trim();

    let persona = JSON.parse(text);

    // 强制补全 tradeoff
    if (
      !persona.tradeoff ||
      !persona.tradeoff.flavor ||
      !persona.tradeoff.speed ||
      !persona.tradeoff.cost
    ) {
      const priorities = persona.priorityOrder || [];

      let flavor = "Medium";
      let speed = "Medium";
      let cost = "Medium";

      const joined = priorities.join(" ").toLowerCase();

      if (joined.includes("texture") || joined.includes("mouthfeel")) {
        flavor = "High";
        speed = "Low";
        cost = "Medium";
      }

      if (joined.includes("speed")) {
        speed = "High";
      }

      if (joined.includes("cost")) {
        cost = "Low";
      }

      persona.tradeoff = {
        flavor,
        speed,
        cost,
      };
    }

    // 强制补全 coachingPrinciples
    if (
      !Array.isArray(persona.coachingPrinciples) ||
      !persona.coachingPrinciples.length
    ) {
      persona.coachingPrinciples = [
        "Prioritize mouthfeel before rushing the dish.",
        "Use cooking time to improve texture, not just doneness.",
        "Choose ingredients that support the texture you want.",
      ];
    }

    // ✅ 生成 personaKey：只用核心身份，不用会变化的细节字段
    const personaKey = (persona.signatureStyle || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    // ✅ 先查重
    const existingPersona = await Persona.findOne({ personaKey });

    if (existingPersona) {
      return res.json({
        ...existingPersona.toObject(),
        duplicate: true,
        message: "Similar persona already exists",
      });
    }

    // ✅ 没有重复，才保存
    const savedPersona = await Persona.create({
      userId: req.user?.uid || null,
      ...persona,
      expertId: expertId || "",
      expertName: expertName || "",
      personaKey,
      sourceType: "transcript",
      sourceTranscript: transcript,
    });

    return res.json({
      ...savedPersona.toObject(),
      duplicate: false,
    });
  } catch (error) {
    console.error("persona generate route error:", error);
    return res.status(500).json({
      error: "Failed to generate persona",
      details: error.message,
    });
  }
});

// 👉 获取所有 persona（列表）
router.get("/", async (req, res) => {
  try {
    const personas = await Persona.find().sort({ createdAt: -1 });

    res.json(personas);
  } catch (err) {
    console.error("get personas error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await Persona.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    console.error("delete persona error:", err);
    res.status(500).json({ error: err.message });
  }
});

// backend/routes/personaRoutes.js

router.post("/ask", async (req, res) => {
  try {
    const { expertId, question } = req.body;

    if (!expertId || !question) {
      return res.status(400).json({ error: "Missing inputs" });
    }

    // 👉 找这个 expert 的 persona
    const persona = await Persona.findOne({ expertId });

    if (!persona) {
      return res.status(404).json({ error: "Persona not found" });
    }

    const videos = await VideoAnalysis.find({
      expertId,
      analysisStatus: "analyzed",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const behaviorSummary = videos
      .map((v, i) => {
        const s = v.extractedSignals || {};

        return `
Example ${i + 1}:
- Heat Level: ${s.heatLevel ?? "N/A"}
- Speed: ${s.speed ?? "N/A"}
- Technique: ${s.technique ?? "N/A"}
- Steps: ${(v.processSteps || []).join(" → ")}
`;
      })
      .join("\n");

    // 👉 拼 prompt
    const prompt = `
You are an expert chef with the following persona:

Philosophy: ${persona.philosophy}
Priority: ${persona.priorityOrder?.join(" → ")}
Signature: ${persona.signatureStyle}

Decision Logic:
${persona.decisionLogic?.map((s, i) => `${i + 1}. ${s}`).join("\n")}

--------------------------------

Observed Behavior from past videos:
${behaviorSummary}

--------------------------------

Instructions:
- Use BOTH persona and observed behavior.
- If there is a conflict, prefer observed behavior.
- Answer in 3–5 practical steps.

Question: ${question}
`;

    // 👉 调 OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      answer: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
