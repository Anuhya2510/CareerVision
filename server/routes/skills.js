const express = require("express");
const auth = require("../middleware/auth");
const { askClaude } = require("../utils/ai");
const router = express.Router();

router.post("/gap", auth, async (req, res) => {
  const { jobRole, userSkills } = req.body;
  if (!jobRole || !userSkills) return res.status(400).json({ error: "Job role and skills required" });
  try {
    const raw = await askClaude(`Analyze skill gap for "${jobRole}". User skills: "${userSkills}". Return ONLY JSON:
{
  "matchScore": <0-100>,
  "matchedSkills": [<matched>],
  "missingSkills": [{"skill":"<n>","importance":"High/Medium/Low","timeToLearn":"<t>"}],
  "learningPath": [<4 steps>],
  "resources": [{"name":"<n>","type":"Course/Book/Practice"}]
}`);
    res.json(JSON.parse(raw.replace(/```json|```/g, "").trim()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
