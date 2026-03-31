const express = require("express");
const auth = require("../middleware/auth");
const { askClaude } = require("../utils/ai");
const router = express.Router();

router.post("/questions", auth, async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: "Role required" });
  try {
    const raw = await askClaude(`Generate 5 interview questions for a ${role} role. Return ONLY JSON:
{"questions":["q1","q2","q3","q4","q5"]}`);
    res.json(JSON.parse(raw.replace(/```json|```/g, "").trim()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/feedback", auth, async (req, res) => {
  const { role, qa } = req.body; // qa = [{question, answer}]
  if (!role || !qa) return res.status(400).json({ error: "Role and Q&A required" });
  const formatted = qa.map((x, i) => `Q${i+1}: ${x.question}\nA: ${x.answer}`).join("\n\n");
  try {
    const raw = await askClaude(`Evaluate these ${role} interview answers. Return ONLY JSON:
{
  "overallScore":<0-100>,
  "feedback":[{"score":<0-100>,"strength":"<s>","improvement":"<i>"}],
  "summary":"<2 sentences>"
}
${formatted}`);
    res.json(JSON.parse(raw.replace(/```json|```/g, "").trim()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
