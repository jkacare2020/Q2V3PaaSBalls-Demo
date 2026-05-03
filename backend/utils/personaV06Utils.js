// backend/utils/personaV06Utils.js

// 🌍 Language → Thinking Map
const languageThinkingMap = {
  "en-US": {
    thinkingStyle: "direct, practical, action-oriented",
    tone: "confident and clear",
  },
  "zh-CN": {
    thinkingStyle: "contextual, relational, long-term",
    tone: "balanced and respectful",
  },
  "ja-JP": {
    thinkingStyle: "implicit, harmony-focused",
    tone: "polite and careful",
  },
};

// 🧠 Build default cognitive profile
function buildDefaultCognitiveProfile(persona) {
  const lang = persona.languageProfile?.primaryLanguage || "en-US";
  const langProfile = languageThinkingMap[lang] || languageThinkingMap["en-US"];

  return {
    thinkingStyle: {
      style: langProfile.thinkingStyle,
      why: ["Derived from language and cultural context"],
    },
    speakingStyle: {
      style: langProfile.tone,
      why: ["Language tone preference"],
    },
    decisionStyle: {
      style: "risk-aware and value-aligned",
      why: ["Default decision pattern"],
    },
    teachingStyle: {
      style: "step-by-step with examples",
      why: ["Clarity improves understanding"],
    },
    judgingStyle: {
      style: "based on responsibility and outcome",
      why: ["Practical evaluation preference"],
    },
    adaptationStyle: {
      style: "adjust tone based on audience",
      why: ["Cross-cultural communication"],
    },
  };
}

// 🔍 WHY Generator (basic)
function generateWhy(answer, persona) {
  return {
    values: persona.valueProfile?.financialValues || [],
    experience: persona.skillProfile?.professionalExperience || [],
    culture: [persona.languageProfile?.culturalContext || "general"],
    logic: [
      "Based on efficiency and outcome optimization",
      "Aligned with persona decision style",
    ],
    confidence: 0.8,
  };
}

// 🧠 WHY Generator (Philosophy Mode)
function generatePhilosophyWhy(answer, persona) {
  return {
    ontology: "Assumes reality is shaped by consistent actions over time.",
    epistemology: "Derived from observed patterns and accumulated experience.",
    ethics: "Prioritizes long-term responsibility over short-term gain.",
    humanInsight:
      "Humans tend to delay action, so structured thinking improves outcomes.",
    personaPerspective: `Influenced by ${
      persona.identity?.background || "personal history"
    }`,
  };
}

function generateNextActions(domain, domainConfig, persona) {
  if (domain === "investment") {
    return {
      conservative:
        "Avoid leverage unless cash flow is stable and loss is survivable.",
      balanced:
        "Use small leverage with strict limits and clear repayment plan.",
      aggressive:
        "Use leverage only if projected return clearly exceeds borrowing cost.",
    };
  }

  if (domain === "business") {
    return {
      conservative:
        "Protect cash flow first and avoid unnecessary fixed costs.",
      balanced: "Test demand with a small controlled launch before scaling.",
      aggressive:
        "Scale only after proof of demand, repeatable sales, and execution capacity.",
    };
  }

  if (domain === "parenting") {
    return {
      conservative: "Protect emotional stability and avoid over-pressure.",
      balanced: "Guide with structure while allowing the child room to grow.",
      aggressive:
        "Push higher standards only when trust and emotional safety are strong.",
    };
  }

  return {
    conservative: "Choose the safest path with the least downside.",
    balanced: "Take a measured step while monitoring risk.",
    aggressive:
      "Move faster only if the upside is clear and the downside is controlled.",
  };
}

function generateRiskWarning(domain) {
  if (domain === "investment") {
    return "Investment and leverage decisions carry financial risk. Ensure losses are survivable.";
  }

  if (domain === "business") {
    return "Business growth can create cash-flow pressure. Do not scale before validation.";
  }

  if (domain === "parenting") {
    return "Over-pressure can damage trust. Preserve the relationship first.";
  }

  return "Every decision has tradeoffs. Check the downside before acting.";
}

// 🔄 Normalize Persona Before AI Call
function normalizePersona(persona) {
  if (!persona.cognitiveProfile) {
    persona.cognitiveProfile = buildDefaultCognitiveProfile(persona);
  }

  return persona;
}

module.exports = {
  languageThinkingMap,
  buildDefaultCognitiveProfile,
  generateWhy,
  generatePhilosophyWhy,
  normalizePersona,
  generateNextActions,
  generateRiskWarning,
};
