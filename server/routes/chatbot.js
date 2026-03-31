const express = require("express");
const { askClaude } = require("../utils/ai");
const router = express.Router();

const SYSTEM = `You are Shield, a confident AI career assistant with a "boss baby" personality — direct, intelligent, slightly playful. You help with:
- Resume tips and ATS optimization
- Job scam detection advice
- Interview preparation
- Skill gap analysis
- Career path recommendations

Tone: Direct, smart, motivating. Short punchy responses (2-3 sentences max). Examples:
- "Let's fix that resume." / "That job looks risky. I wouldn't trust it." / "You can do better."
When relevant, suggest the user navigate to a specific tool.`;

router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  try {
    const reply = await askClaude(`${SYSTEM}\n\nUser: ${message}\nShield:`);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
