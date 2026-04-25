const express = require("express");
const router = express.Router();
const Expert = require("../models/Expert/expertModel");

// 👉 创建 Expert
router.post("/", async (req, res) => {
  try {
    const { userId, expertId, expertName } = req.body;

    const existing = await Expert.findOne({ expertId });
    if (existing) {
      return res.json({ ...existing.toObject(), duplicate: true });
    }

    const expert = await Expert.create({
      userId,
      expertId,
      expertName,
    });

    res.json(expert);
  } catch (err) {
    console.error("create expert error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 👉 获取当前用户所有 experts
router.get("/:userId", async (req, res) => {
  try {
    const experts = await Expert.find({ userId: req.params.userId });
    res.json(experts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
