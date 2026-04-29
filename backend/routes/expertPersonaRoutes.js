const express = require("express");
const router = express.Router();

const {
  getPersonaPresets,
  runSinglePersona,
  runMultiPersona,
} = require("../controllers/expertPersonaController");

router.get("/presets", getPersonaPresets);
router.post("/demo", runSinglePersona);
router.post("/multi", runMultiPersona);

module.exports = router;
