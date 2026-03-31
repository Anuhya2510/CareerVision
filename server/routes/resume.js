const express = require("express");
const auth = require("../middleware/auth");
const { askClaude } = require("../utils/ai");

const router = express.Router();

// POST /api/resume/analyze
router.post("/analyze", auth, async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) return res.status(400).json({ error: "Resume text required" });
  try {
    const raw = await askClaude(`Analyze this resume and return ONLY a JSON object:
{
  "atsScore": <0-100>,
  "keywordsFound": [<6 keywords>],
  "missingKeywords": [<5 missing>],
  "suggestions": [<4 improvements>],
  "strengths": [<3 strengths>],
  "verdict": "<summary>"
}
Resume:
${resumeText.substring(0, 2000)}`);
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Analysis failed", details: err.message });
  }
});

module.exports = router;
