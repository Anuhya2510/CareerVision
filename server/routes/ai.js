const express = require("express");
const { askClaude } = require("../utils/ai");
const router = express.Router();

// General-purpose Claude endpoint used by the frontend
router.post("/ask", async (req, res) => {
  const { prompt, maxTokens } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  try {
    const text = await askClaude(prompt, maxTokens || 900);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
