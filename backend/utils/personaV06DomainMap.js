// backend/utils/personaV06DomainMap.js

function detectDomain(question = "") {
  const q = question.toLowerCase();

  // Investment
  if (
    q.includes("stock") ||
    q.includes("invest") ||
    q.includes("leverage") ||
    q.includes("debt") ||
    q.includes("margin") ||
    q.includes("loan")
  ) {
    return "investment";
  }

  // Business
  if (
    q.includes("business") ||
    q.includes("startup") ||
    q.includes("market") ||
    q.includes("expansion") ||
    q.includes("scale") ||
    q.includes("growth")
  ) {
    return "business";
  }

  // Parenting
  if (q.includes("child") || q.includes("kid") || q.includes("parent")) {
    return "parenting";
  }

  // Career
  if (q.includes("career") || q.includes("job") || q.includes("work")) {
    return "career";
  }

  return "general";
}

// 🎯 Domain → Philosophy + Decision Logic
function getDomainConfig(domain, persona) {
  const financialValues = persona.valueProfile?.financialValues || [];

  switch (domain) {
    case "investment":
      return {
        philosophy: financialValues.includes("risk control")
          ? "risk-control"
          : "growth",

        principles: [
          "Protect capital first",
          "Return must exceed risk",
          "Time horizon matters",
        ],

        riskFocus: [
          "leverage risk",
          "market volatility",
          "cash flow stability",
        ],

        outputStyle: "structured financial reasoning",
      };

    case "business":
      return {
        philosophy: "growth with risk awareness",
        principles: [
          "Execution over idea",
          "Cash flow is survival",
          "Leverage only if controlled",
        ],
        riskFocus: ["market demand", "execution risk", "competition"],
        outputStyle: "practical business advice",
      };

    case "parenting":
      return {
        philosophy: "value-driven development",
        principles: [
          "Character over short-term result",
          "Consistency matters",
          "Emotional stability first",
        ],
        riskFocus: ["over-pressure", "lack of guidance"],
        outputStyle: "calm and guiding tone",
      };

    case "career":
      return {
        philosophy: "balanced growth",
        principles: ["Skill > title", "Long-term positioning", "Adaptability"],
        riskFocus: ["job instability", "skill stagnation"],
        outputStyle: "strategic advice",
      };

    default:
      return {
        philosophy: "balanced",
        principles: ["clarity", "logic", "consistency"],
        riskFocus: [],
        outputStyle: "general reasoning",
      };
  }
}

module.exports = {
  detectDomain,
  getDomainConfig,
};
