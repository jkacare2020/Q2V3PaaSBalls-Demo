const express = require("express");
const router = express.Router();

const {
  createOrUpdatePersonaV06,
  getPersonaV06ByUserId,
  generatePersonaV06Response,
} = require("../controllers/personaV06Controller");

// Create / Update
router.post("/create", createOrUpdatePersonaV06);

// Get persona
router.get("/:userId", getPersonaV06ByUserId);

// Generate response
router.post("/generate", generatePersonaV06Response);

module.exports = router;
