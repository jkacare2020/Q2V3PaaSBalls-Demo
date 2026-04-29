const express = require("express");
const router = express.Router();

const {
  getPersonaPresets,
  runSinglePersona,
  runMultiPersona,
  getPersonaSessions,
} = require("../controllers/expertPersonaController");

router.get("/presets", getPersonaPresets);
router.post("/demo", runSinglePersona);
router.post("/multi", runMultiPersona);
router.get("/history", getPersonaSessions);

module.exports = router;
