const express = require("express");
const auth = require("../middleware/auth");
const { askClaude } = require("../utils/ai");
const router = express.Router();

router.post("/recommend", auth, async (req, res) => {
  const { skills, interests } = req.body;
  if (!skills || !interests) return res.status(400).json({ error: "Skills and interests required" });
  try {
    const raw = await askClaude(`Given skills: "${skills}" and interests: "${interests}", suggest 3-4 career paths. Return ONLY JSON:
{"careers":[{"title":"<t>","fit":<0-100>,"avgSalary":"<s>","growth":"High/Medium/Low","description":"<2 sentences>","nextStep":"<action>"}]}`);
    res.json(JSON.parse(raw.replace(/```json|```/g, "").trim()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
