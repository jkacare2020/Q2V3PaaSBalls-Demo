// backend/utils/personaUtils.js

const getLevel = (value) => {
  if (value >= 8) return "very high";
  if (value >= 6) return "medium-high";
  if (value >= 4) return "moderate";
  return "low";
};

const getCookingPersona = ({
  ingredientType,
  heat,
  speed,
  complexity,
  technique,
}) => {
  if (ingredientType === "beef") {
    return {
      title: "High-Heat Caramelization Expert",
      tags: ["aggressive heat", "browning", "sauce reduction"],
      philosophy:
        "I push heat to build deep flavor, but texture must stay tender.",
    };
  }

  if (ingredientType === "chicken") {
    return {
      title: "Tenderness-First Stir-Fry Cook",
      tags: ["controlled heat", "tender texture", "light browning"],
      philosophy: "I like flavor, but chicken must stay juicy first.",
    };
  }

  if (ingredientType === "vegetable") {
    return {
      title: "Freshness & Texture Specialist",
      tags: ["color control", "crisp texture", "moisture balance"],
      philosophy: "I protect color and crunch before adding heavy flavor.",
    };
  }

  return {
    title: "General Stir-Fry Cook",
    tags: [
      technique,
      `${getLevel(heat)} heat`,
      `${getLevel(speed)} speed`,
      `${getLevel(complexity)} complexity`,
    ],
    philosophy: "I cook by watching heat, timing, color, and texture.",
  };
};

module.exports = {
  getCookingPersona,
};
