// ── scam.js ──
const express = require("express");
const auth = require("../middleware/auth");
const { askClaude } = require("../utils/ai");
const router = express.Router();

router.post("/detect", auth, async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) return res.status(400).json({ error: "Job description required" });
  try {
    const raw = await askClaude(`Analyze this job posting for scam indicators. Return ONLY JSON:
{
  "verdict": "SAFE" or "SUSPICIOUS" or "SCAM",
  "riskScore": <0-100>,
  "redFlags": [<list>],
  "safeSignals": [<list>],
  "suspiciousKeywords": [<list>],
  "salaryRisk": true/false,
  "companyInfoMissing": true/false,
  "recommendation": "<advice>"
}
Job description: ${jobDescription.substring(0, 1500)}`);
    res.json(JSON.parse(raw.replace(/```json|```/g, "").trim()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
