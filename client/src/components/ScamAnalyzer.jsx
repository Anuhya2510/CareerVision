// ─── JOB SCAM ANALYZER — REBUILT ─────────────────────────────────────────────
// Scam Risk Score 0–100 · Animated bars · Clear verdict · No conflicting UI

import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#08080E", surface: "#111118", card: "#16161F",
  gold: "#D4AF37", goldLight: "#E8C547", goldDim: "#B8962E",
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  green: "#3DCA7A", yellow: "#F5A623", red: "#F04444",
  purple: "#9B7FE8", blue: "#5B9CF6",
};

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);

async function callClaude(prompt, maxTokens = 1000) {
  const token = localStorage.getItem("cs_token");
  const res = await fetch("http://localhost:5000/api/ai/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.text || "";
}

function parseJSON(raw) {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON");
  return JSON.parse(match[0]);
}

// ── Risk calculation (client-side)
function computeScamRisk(text) {
  const t = text.toLowerCase();

  const contentSignals = [
    { kw: ["urgent", "immediately", "limited slots", "act now", "last chance"], weight: 15 },
    { kw: ["guaranteed salary", "guaranteed income", "₹80,000", "₹1,00,000", "crore per month"], weight: 20 },
    { kw: ["work from home", "no experience", "easy money", "passive income"], weight: 10 },
    { kw: ["registration fee", "training fee", "security deposit", "pay to apply", "refundable deposit"], weight: 40 },
    { kw: ["whatsapp only", "telegram only", "no office", "direct hiring"], weight: 15 },
  ];

  const safeSignals = [
    { kw: ["careers@", "@company.com", "hr@", "interview process", "technical round", "hr round"], weight: -15 },
    { kw: ["company registered", "inc.", "ltd.", "pvt. ltd.", "corporation"], weight: -10 },
    { kw: ["3-5 years", "experience required", "qualifications", "bachelor", "master"], weight: -10 },
  ];

  let contentRisk = 20;
  let financialRisk = 10;
  let contactCredibility = 50; // lower = risky, higher score = higher credibility problems

  contentSignals.forEach(sig => {
    if (sig.kw.some(k => t.includes(k))) contentRisk += sig.weight;
  });
  safeSignals.forEach(sig => {
    if (sig.kw.some(k => t.includes(k))) contentRisk += sig.weight;
  });

  if (t.includes("fee") || t.includes("payment") || t.includes("deposit") || t.includes("pay")) {
    financialRisk = 85;
  } else if (t.includes("salary") && (t.includes("guaranteed") || t.includes("lakh"))) {
    financialRisk = 60;
  } else {
    financialRisk = 15;
  }

  if (t.includes("whatsapp") || t.includes("telegram") || (!t.includes("@") && !t.includes("www."))) {
    contactCredibility = 75;
  } else if (t.includes("@") && (t.includes(".com") || t.includes(".in"))) {
    contactCredibility = 20;
  }

  // URL risk
  let urlRisk = 30;
  try {
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urls.some(u => /\d/.test(new URL(u).hostname))) urlRisk = 70;
    else if (urls.some(u => ["jobs-apply", "career-offer", "hire-now", "work-from-home"].some(k => u.includes(k)))) urlRisk = 65;
    else if (urls.length > 0) urlRisk = 25;
  } catch {}

  const companyAuthenticity = t.includes("pvt") || t.includes("ltd") || t.includes("inc") || t.includes("verified") ? 25 : 55;

  // Formula from spec
  contentRisk = Math.min(100, Math.max(0, contentRisk));
  const overall = Math.round(
    (contentRisk * 0.25) +
    (financialRisk * 0.25) +
    (urlRisk * 0.20) +
    (companyAuthenticity * 0.15) +
    (contactCredibility * 0.15)
  );

  return {
    overall: Math.min(94, overall),
    contentRisk: Math.min(100, contentRisk),
    financialRisk: Math.min(100, financialRisk),
    urlRisk,
    companyAuthenticity,
    contactCredibility,
  };
}

function getRiskCategory(score) {
  if (score <= 30) return { label: "SAFE", color: C.green, icon: "✅", bg: "rgba(61,202,122,0.08)", border: "rgba(61,202,122,0.3)" };
  if (score <= 60) return { label: "SUSPICIOUS", color: C.yellow, icon: "⚠️", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.3)" };
  return { label: "HIGH RISK", color: C.red, icon: "🚨", bg: "rgba(240,68,68,0.08)", border: "rgba(240,68,68,0.3)" };
}

function getExplanation(score, scores) {
  if (score <= 30) return "This job posting appears legitimate. Standard precautions are still recommended — always verify the company independently.";
  if (score <= 60) return "This posting has suspicious characteristics. Proceed with caution and verify the company before sharing personal information.";
  return "This posting shows multiple high-risk indicators consistent with recruitment fraud. Do not pay any fees or share sensitive documents.";
}

function buildFlagReasons(text, scores) {
  const t = text.toLowerCase();
  const flags = [];
  if (t.includes("fee") || t.includes("payment") || t.includes("deposit")) flags.push("Requests payment or fees from the applicant");
  if (t.includes("urgent") || t.includes("immediately") || t.includes("limited slots")) flags.push("Uses urgency/pressure language");
  if (t.includes("guaranteed") && t.includes("salary")) flags.push("Promises guaranteed salary without interview");
  if (t.includes("whatsapp only") || t.includes("telegram only")) flags.push("Uses informal contact channels only");
  if (t.includes("no experience") && t.includes("high salary")) flags.push("Offers high salary with no experience required");
  if (scores.companyAuthenticity > 50) flags.push("Company information is incomplete or unverifiable");
  if (flags.length === 0 && scores.overall > 30) flags.push("Some elements of this posting are atypical for legitimate employers");
  return flags;
}

function buildSafeSignals(text, scores) {
  const t = text.toLowerCase();
  const signals = [];
  if (t.includes("@") && (t.includes(".com") || t.includes(".in"))) signals.push("Professional email contact provided");
  if (t.includes("interview") || t.includes("technical round") || t.includes("hr round")) signals.push("Mentions structured interview process");
  if (t.includes("years experience") || t.includes("qualifications") || t.includes("bachelor")) signals.push("Specifies realistic experience requirements");
  if (t.includes("pvt ltd") || t.includes("inc.") || t.includes("corporation")) signals.push("Mentions registered company entity");
  if (t.includes("careers@") || t.includes("hr@") || t.includes("apply at")) signals.push("Has clear, official application channel");
  return signals;
}

// ── Shared UI
function Label({ children, style = {} }) {
  return <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8, ...style }}>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const pri = variant === "primary";
  const danger = variant === "danger";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: "11px 24px", borderRadius: 10, fontWeight: 600, fontSize: 13.5,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily: "inherit",
        background: pri ? `linear-gradient(135deg,${C.gold},${C.goldDim})` : danger ? "rgba(240,68,68,0.1)" : "rgba(212,175,55,0.06)",
        color: pri ? "#08080E" : danger ? C.red : C.gold,
        border: pri ? "none" : danger ? "1px solid rgba(240,68,68,0.3)" : "1px solid rgba(212,175,55,0.25)",
        transition: "all 0.18s ease", display: "inline-flex", alignItems: "center", gap: 6, ...style,
      }}>{children}</button>
  );
}

// ── Big scam risk score card (replaces confusing meter)
function ScamRiskScore({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const cat = getRiskCategory(score);

  useEffect(() => {
    let cur = 0;
    const step = score / 50;
    const id = setInterval(() => {
      cur += step;
      if (cur >= score) { setDisplayed(score); clearInterval(id); }
      else setDisplayed(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [score]);

  return (
    <div style={{
      textAlign: "center", padding: "28px 24px",
      background: cat.bg, border: `1px solid ${cat.border}`,
      borderRadius: 20,
    }}>
      <div style={{ color: C.muted, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
        Scam Risk Score
      </div>
      <div style={{
        fontSize: 72, fontWeight: 900, color: cat.color,
        fontFamily: "'Playfair Display', serif", lineHeight: 1,
        textShadow: `0 0 40px ${cat.color}44`,
        transition: "color 0.3s",
      }}>
        {displayed}
      </div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 16 }}>/ 100</div>

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 20px", borderRadius: 30, fontSize: 15, fontWeight: 700,
        background: cat.bg, border: `2px solid ${cat.border}`, color: cat.color,
        letterSpacing: 1,
      }}>
        {cat.icon} {cat.label}
      </div>
    </div>
  );
}

// ── Animated horizontal risk bar
function RiskBar({ label, score, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const color = score > 70 ? C.red : score > 40 ? C.yellow : C.green;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 200 + delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <span style={{ color: C.muted, fontSize: 12.5 }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontSize: 13 }}>{score}/100</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4, background: color,
          width: `${width}%`, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 10px ${color}55`,
        }} />
      </div>
    </div>
  );
}

// ── Loading pipeline
const STAGES = [
  { id: "scan", icon: "🔍", label: "Scanning content…" },
  { id: "pattern", icon: "⚡", label: "Detecting patterns…" },
  { id: "score", icon: "📊", label: "Calculating risk scores…" },
  { id: "tips", icon: "🛡️", label: "Building safety report…" },
];

function LoadingPipeline({ current }) {
  const currentIndex = STAGES.findIndex(s => s.id === current);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const active = stage.id === current;
        return (
          <div key={stage.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            borderRadius: 10,
            background: active ? "rgba(212,175,55,0.08)" : done ? "rgba(61,202,122,0.05)" : "transparent",
            border: `1px solid ${active ? "rgba(212,175,55,0.25)" : done ? "rgba(61,202,122,0.15)" : "rgba(255,255,255,0.04)"}`,
            transition: "all 0.3s",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? "rgba(61,202,122,0.15)" : active ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${done ? C.green + "44" : active ? C.gold + "44" : "transparent"}`,
            }}>
              {done ? "✓" : stage.icon}
            </div>
            <span style={{ color: done ? C.green : active ? C.gold : C.dim, fontSize: 13, fontWeight: done || active ? 600 : 400 }}>
              {stage.label}
            </span>
            {active && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: "50%", background: C.gold,
                    animation: `scamBounce 1s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── OCR pipeline for scam image upload
const OCR_MSGS = [
  { id: "load",    icon: "📷", label: "Loading screenshot…"      },
  { id: "detect",  icon: "🔍", label: "Detecting text regions…"  },
  { id: "extract", icon: "⚡", label: "Extracting text via OCR…" },
  { id: "done",    icon: "✅", label: "Text extracted!"          },
];

function ScamOcrPipeline({ current }) {
  const idx = OCR_MSGS.findIndex(s => s.id === current);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "10px 0" }}>
      {OCR_MSGS.map((step, i) => {
        const done = i < idx;
        const active = step.id === current;
        return (
          <div key={step.id} style={{
            display: "flex", alignItems: "center", gap: 9, padding: "7px 11px", borderRadius: 8,
            background: active ? "rgba(212,175,55,0.07)" : done ? "rgba(61,202,122,0.05)" : "transparent",
            border: `1px solid ${active ? "rgba(212,175,55,0.2)" : done ? "rgba(61,202,122,0.12)" : "rgba(255,255,255,0.04)"}`,
            transition: "all 0.25s",
          }}>
            <span style={{ fontSize: 13 }}>{done ? "✓" : step.icon}</span>
            <span style={{ color: done ? C.green : active ? C.gold : C.dim, fontSize: 12, fontWeight: done || active ? 600 : 400 }}>
              {step.label}
            </span>
            {active && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: "50%", background: C.gold,
                    animation: `scamBounce 0.9s ease-in-out ${i*0.2}s infinite`,
                  }}/>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component
export default function ScamAnalyzer() {
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [stage, setStage]       = useState(null);
  const [result, setResult]     = useState(null);
  const [reported, setReported] = useState(false);
  const [focused, setFocused]   = useState(false);

  // Image OCR states
  const [imgPhase, setImgPhase]     = useState("idle"); // idle | dragging | ocr | done | error
  const [ocrStep, setOcrStep]       = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [imgPreview, setImgPreview] = useState(null);
  const [imgErrMsg, setImgErrMsg]   = useState("");
  const imgFileRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "scam-analyzer-style";
    if (!document.getElementById("scam-analyzer-style")) {
      style.textContent = `
        @keyframes scamBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes scamFadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scamPulse   { 0%,100%{opacity:0.8} 50%{opacity:1} }
        @keyframes scamBarFill { from{width:0%} to{width:100%} }
        @keyframes scamImgScan { 0%{top:0;opacity:1} 90%{top:100%;opacity:1} 100%{top:100%;opacity:0} }
      `;
      document.head.appendChild(style);
    }
    return () => { try { const el = document.getElementById("scam-analyzer-style"); if (el) document.head.removeChild(el); } catch {} };
  }, []);

  // ── Tesseract loader
  const loadTesseract = () => new Promise((resolve, reject) => {
    if (window.Tesseract) { resolve(window.Tesseract); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    s.onload  = () => resolve(window.Tesseract);
    s.onerror = () => reject(new Error("Could not load OCR engine"));
    document.head.appendChild(s);
  });

  const runImageOcr = async (file) => {
    setImgPhase("ocr"); setOcrStep("load"); setOcrProgress(0);
    const url = URL.createObjectURL(file);
    setImgPreview(url);
    await new Promise(r => setTimeout(r, 350));
    try {
      const Tesseract = await loadTesseract();
      setOcrStep("detect");
      await new Promise(r => setTimeout(r, 400));
      setOcrStep("extract");
      const worker = await Tesseract.createWorker("eng", 1, {
        logger: m => { if (m.status === "recognizing text") setOcrProgress(Math.round((m.progress || 0) * 100)); },
      });
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      setOcrStep("done");
      await new Promise(r => setTimeout(r, 300));
      const cleaned = text.replace(/\f/g, "\n").replace(/[ \t]{3,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
      if (!cleaned || cleaned.length < 20) throw new Error("Could not extract readable text. Try a clearer screenshot.");
      setImgPhase("done");
      // Merge OCR text with any existing text input
      setInput(prev => prev ? prev + "\n\n---\n[Extracted from screenshot:]\n" + cleaned : cleaned);
    } catch (err) {
      setImgPhase("error");
      setImgErrMsg(err.message || "OCR failed.");
    }
  };

  const handleImageFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["png","jpg","jpeg","webp"].includes(ext)) {
      setImgPhase("error");
      setImgErrMsg("Please upload a PNG, JPG, or JPEG image.");
      return;
    }
    runImageOcr(file);
  };

  const handleImgDrop = e => {
    e.preventDefault(); setImgPhase("idle");
    const f = e.dataTransfer.files?.[0]; if (f) handleImageFile(f);
  };

  const resetImage = () => {
    setImgPhase("idle"); setOcrStep(null); setOcrProgress(0);
    setImgPreview(null); setImgErrMsg("");
    if (imgFileRef.current) imgFileRef.current.value = "";
  };

  // ── Analyze
  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null); setReported(false);
    const scores = computeScamRisk(input);
    const stageSequence = ["scan","pattern","score","tips"];
    for (const s of stageSequence) {
      setStage(s);
      await new Promise(r => setTimeout(r, 700 + Math.random() * 300));
    }
    let aiResult = null;
    const safetyTimer = setTimeout(() => { if (!aiResult) finalize(scores); }, 12000);
    try {
      const raw = await withTimeout(
        callClaude(`Analyze this job posting for scam indicators. Score each risk factor 0-100.\nReturn ONLY JSON (no markdown):\n{\n  "contentRisk": <0-100>,\n  "financialRisk": <0-100>,\n  "urlRisk": <0-100>,\n  "companyAuthenticity": <0-100>,\n  "contactCredibility": <0-100>,\n  "flagReasons": ["<specific reason 1>", "<specific reason 2>"],\n  "safeSignals": ["<safe signal 1>", "<safe signal 2>"]\n}\n\nJob posting: ${input.substring(0, 1500)}`),
        10000
      );
      clearTimeout(safetyTimer);
      const parsed = parseJSON(raw);
      if (typeof parsed.contentRisk === "number") {
        const aiScores = {
          contentRisk: parsed.contentRisk, financialRisk: parsed.financialRisk,
          urlRisk: parsed.urlRisk, companyAuthenticity: parsed.companyAuthenticity,
          contactCredibility: parsed.contactCredibility,
        };
        aiScores.overall = Math.round(
          (aiScores.contentRisk*0.25)+(aiScores.financialRisk*0.25)+(aiScores.urlRisk*0.20)+(aiScores.companyAuthenticity*0.15)+(aiScores.contactCredibility*0.15)
        );
        aiResult = { scores: aiScores, flagReasons: parsed.flagReasons||[], safeSignals: parsed.safeSignals||[] };
        finalize(aiScores, aiResult.flagReasons, aiResult.safeSignals);
      } else { finalize(scores); }
    } catch { clearTimeout(safetyTimer); finalize(scores); }
  };

  function finalize(scores, flagReasons, safeSignals) {
    const flags = flagReasons || buildFlagReasons(input, scores);
    const safe  = safeSignals  || buildSafeSignals(input, scores);
    setResult({ scores, flags, safe });
    setStage(null); setLoading(false);
  }

  const reset = () => { setInput(""); setResult(null); setStage(null); setLoading(false); setReported(false); resetImage(); };
  const cat = result ? getRiskCategory(result.scores.overall) : null;

  // ── LOADING
  if (loading) return (
    <div style={{ padding: "28px", maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, marginBottom: 5 }}>🛡️ Scam Analyzer</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Running 5-factor risk analysis…</p>
      <div style={{ background: C.card, borderRadius: 18, border: "1px solid rgba(212,175,55,0.09)", padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12, animation: "scamPulse 1.5s ease infinite" }}>🕵️</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.text, marginBottom: 4 }}>AI Scam Engine Running…</div>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${C.goldDim},${C.gold},${C.goldLight})`, animation: "scamBarFill 12s linear forwards" }}/>
        </div>
        <LoadingPipeline current={stage}/>
      </div>
    </div>
  );

  // ── RESULT
  if (result) {
    const { scores, flags, safe } = result;
    const riskFactors = [
      { label: "Content Risk",         key: "contentRisk",         score: scores.contentRisk },
      { label: "Financial Risk",        key: "financialRisk",        score: scores.financialRisk },
      { label: "URL Risk",              key: "urlRisk",              score: scores.urlRisk },
      { label: "Company Authenticity",  key: "companyAuthenticity",  score: scores.companyAuthenticity },
      { label: "Contact Credibility",   key: "contactCredibility",   score: scores.contactCredibility },
    ];
    return (
      <div style={{ padding: "28px", maxWidth: 920, margin: "0 auto", animation: "scamFadeUp 0.4s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: C.text, marginBottom: 4 }}>🛡️ Scam Analysis Report</h1>
            <div style={{ color: C.muted, fontSize: 12 }}>Job posting analyzed · Results below</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!reported ? (
              <Btn variant="danger" onClick={() => setReported(true)} style={{ padding: "8px 16px", fontSize: 12 }}>🚩 Report Scam</Btn>
            ) : (
              <div style={{ padding: "8px 14px", borderRadius: 10, background: "rgba(61,202,122,0.1)", border: "1px solid rgba(61,202,122,0.3)", color: C.green, fontSize: 12, fontWeight: 600 }}>✅ Reported</div>
            )}
            <Btn variant="secondary" onClick={reset} style={{ padding: "8px 16px", fontSize: 12 }}>↩ New Scan</Btn>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <ScamRiskScore score={scores.overall}/>
          <div style={{ background: C.card, borderRadius: 20, border: "1px solid rgba(212,175,55,0.09)", padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>What This Means</div>
            <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>{getExplanation(scores.overall, scores)}</p>
            {[{c:C.green,r:"0–30: SAFE"},{c:C.yellow,r:"31–60: SUSPICIOUS"},{c:C.red,r:"61–100: HIGH RISK"}].map(x => (
              <div key={x.r} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c, marginTop: 5 }}/>
                <span style={{ color: C.muted, fontSize: 12 }}>{x.r}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: 18, border: "1px solid rgba(212,175,55,0.09)", padding: 24, marginBottom: 16 }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 16 }}>📊 Risk Factor Breakdown</div>
          {riskFactors.map((factor, i) => <RiskBar key={factor.key} label={factor.label} score={factor.score} delay={i*100}/>)}
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 9, background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.08)", color: C.dim, fontSize: 11 }}>
            Formula: (Content×25%) + (Financial×25%) + (URL×20%) + (Company×15%) + (Contact×15%)
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ background: C.card, borderRadius: 18, border: "1px solid rgba(240,68,68,0.15)", padding: 24 }}>
            <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14 }}>🚨 Why This Was Flagged</div>
            {flags.length === 0 ? <div style={{ color: C.green, fontSize: 13 }}>✅ No red flags detected.</div>
              : flags.map((flag, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, animation: `scamFadeUp 0.3s ease ${i*0.08}s both` }}>
                  <span style={{ color: C.red, fontSize: 14, marginTop: 1 }}>•</span>
                  <span style={{ color: "#D0D0D8", fontSize: 13, lineHeight: 1.6 }}>{flag}</span>
                </div>
              ))
            }
          </div>
          <div style={{ background: C.card, borderRadius: 18, border: "1px solid rgba(61,202,122,0.15)", padding: 24 }}>
            <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14 }}>✅ Safe Signals</div>
            {safe.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>No legitimacy signals found.</div>
              : safe.map((signal, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, animation: `scamFadeUp 0.3s ease ${i*0.08}s both` }}>
                  <span style={{ color: C.green, fontSize: 14, marginTop: 1 }}>✔</span>
                  <span style={{ color: "#C0D8C0", fontSize: 13, lineHeight: 1.6 }}>{signal}</span>
                </div>
              ))
            }
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: 18, border: "1px solid rgba(212,175,55,0.09)", padding: 24, marginBottom: 16 }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14 }}>🛡️ Safety Tips</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["Never pay any fee to apply for a job — legitimate employers cover all hiring costs","Verify company registration on official government portals before proceeding","Search the job description online — scammers reuse the same text across fake ads","Never share Aadhaar, PAN, or bank details before formal onboarding with HR","Insist on a video interview with the actual hiring manager before making decisions"].map((tip, i) => (
              <div key={i} style={{ padding: "10px 13px", borderRadius: 10, background: "rgba(61,202,122,0.05)", border: "1px solid rgba(61,202,122,0.1)", display: "flex", gap: 10, alignItems: "flex-start", animation: `scamFadeUp 0.3s ease ${i*0.07}s both` }}>
                <span style={{ color: C.green, flexShrink: 0, marginTop: 1 }}>🔒</span>
                <span style={{ color: "#C0D8C8", fontSize: 12.5, lineHeight: 1.6 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
        <Btn variant="secondary" onClick={reset} style={{ width: "100%" }}>↩ Scan Another Job Posting</Btn>
      </div>
    );
  }

  // ── INPUT VIEW
  return (
    <div style={{ padding: "28px", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ fontSize: 36 }}>🛡️</div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: C.text, lineHeight: 1 }}>Scam Analyzer</h1>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Scam Risk Score 0–100 · 5-Factor AI Analysis · Image OCR Support</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          {["📊 5-Factor Score","🚨 Flag Reasons","✅ Safe Signals","🖼️ Screenshot OCR","🛡️ Safety Tips"].map(f => (
            <div key={f} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.18)", color: C.muted }}>{f}</div>
          ))}
        </div>
      </div>

      {/* ── Text input */}
      <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${focused ? "rgba(212,175,55,0.25)" : "rgba(212,175,55,0.09)"}`, padding: 24, marginBottom: 14, transition: "all 0.2s" }}>
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>Paste Job Description</div>
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={"Paste the job description, URL, or any suspicious text here…\n\nExamples:\n• Job description text from WhatsApp, email, or job board\n• https://suspicious-jobs-apply.xyz/apply\n• Screenshot text extracted by OCR below"}
          rows={7}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, outline: "none", background: "#0A0A14", fontFamily: "inherit", resize: "vertical", border: "1px solid rgba(212,175,55,0.08)", color: C.text, fontSize: 13.5, lineHeight: 1.8, boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <Btn onClick={analyze} disabled={!input.trim() || loading}>🛡️ Analyze for Scams</Btn>
          {input && <Btn variant="secondary" onClick={() => setInput("")} style={{ padding: "11px 16px" }}>Clear</Btn>}
          <span style={{ color: C.dim, fontSize: 12, marginLeft: "auto" }}>{input.length} chars</span>
        </div>
        {/* Quick examples */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ color: C.dim, fontSize: 11, marginBottom: 8 }}>Quick test examples:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "🚨 Scam Job",    text: "Urgent! Work from Home. Salary: ₹80,000/month guaranteed. No experience needed. Apply NOW - only 3 slots left. Pay ₹2000 registration fee to get started. Contact on WhatsApp only: +91XXXXXXXXXX" },
              { label: "✅ Legit Job",   text: "Software Engineer at TechCorp. 3-5 years of React/Node.js experience. Salary: 18-24 LPA. Apply via careers@techcorp.com. Interview: HR screen → Technical round → Final round with CTO." },
              { label: "⚠️ Suspicious", text: "Part-time data entry job. Earn ₹25,000/week from home. No degree required. Join our team — limited openings. Training provided free. WhatsApp us for details." },
            ].map(ex => (
              <button key={ex.label} onClick={() => setInput(ex.text)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, border: "1px solid rgba(212,175,55,0.15)", background: "rgba(212,175,55,0.05)", color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>{ex.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Image / screenshot upload */}
      <div style={{ background: C.card, borderRadius: 18, border: "1px solid rgba(91,156,246,0.12)", padding: 20, marginBottom: 18 }}>
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
          <span>🖼️</span> Upload Job Posting Screenshot (OCR)
        </div>

        {/* OCR running */}
        {imgPhase === "ocr" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18, animation: "scamPulse 1.5s ease infinite" }}>🔍</span>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 13 }}>Extracting text from screenshot…</div>
            </div>
            {imgPreview && (
              <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", maxHeight: 120, marginBottom: 10 }}>
                <img src={imgPreview} alt="preview" style={{ width: "100%", objectFit: "cover", display: "block", opacity: 0.55 }}/>
                <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, animation: "scamImgScan 2s linear infinite" }}/>
              </div>
            )}
            <ScamOcrPipeline current={ocrStep}/>
            {ocrProgress > 0 && (
              <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", background: C.gold, width: `${ocrProgress}%`, borderRadius: 2, transition: "width 0.3s" }}/>
              </div>
            )}
          </div>
        )}

        {/* Done */}
        {imgPhase === "done" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(61,202,122,0.07)", border: "1px solid rgba(61,202,122,0.25)" }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div style={{ flex: 1, color: C.green, fontWeight: 700, fontSize: 13 }}>Text extracted and added to the input above!</div>
            <button onClick={resetImage} style={{ padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(61,202,122,0.3)", background: "transparent", color: C.green, fontSize: 11, cursor: "pointer" }}>Reset</button>
          </div>
        )}

        {/* Error */}
        {imgPhase === "error" && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(240,68,68,0.07)", border: "1px solid rgba(240,68,68,0.25)" }}>
            <div style={{ color: C.red, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>⚠️ OCR Failed</div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>{imgErrMsg}</div>
            <button onClick={resetImage} style={{ padding: "5px 14px", borderRadius: 8, border: "1px solid rgba(240,68,68,0.3)", background: "rgba(240,68,68,0.08)", color: C.red, fontSize: 12, cursor: "pointer" }}>Try Again</button>
          </div>
        )}

        {/* Idle drop zone */}
        {(imgPhase === "idle" || imgPhase === "dragging") && (
          <div
            onDragOver={e => { e.preventDefault(); setImgPhase("dragging"); }}
            onDragLeave={() => setImgPhase("idle")}
            onDrop={handleImgDrop}
            onClick={() => imgFileRef.current?.click()}
            style={{
              border: `2px dashed ${imgPhase === "dragging" ? "#5B9CF6" : "rgba(91,156,246,0.2)"}`,
              borderRadius: 12, padding: "20px 16px", textAlign: "center", cursor: "pointer",
              background: imgPhase === "dragging" ? "rgba(91,156,246,0.05)" : "rgba(22,22,31,0.4)",
              transition: "all 0.2s",
            }}
          >
            <input ref={imgFileRef} type="file" accept=".png,.jpg,.jpeg,.webp,image/*" onChange={e => handleImageFile(e.target.files?.[0])} style={{ display: "none" }}/>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Drop a screenshot of the job posting</div>
            <div style={{ color: C.dim, fontSize: 11, marginBottom: 10 }}>OCR will extract text automatically</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              {["PNG","JPG","JPEG"].map(f => (
                <span key={f} style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: "rgba(91,156,246,0.1)", border: "1px solid rgba(91,156,246,0.2)", color: "#5B9CF6" }}>{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { icon: "📊", title: "Scam Risk Score",    desc: "Single clear 0–100 score. SAFE, SUSPICIOUS, or HIGH RISK verdict." },
          { icon: "▼️", title: "Screenshot OCR",      desc: "Upload a screenshot — OCR extracts text and runs the same analysis." },
          { icon: "🛡️", title: "5-Factor Analysis",  desc: "Content, Financial, URL, Company Authenticity, Contact Credibility." },
        ].map(item => (
          <div key={item.title} style={{ background: C.card, borderRadius: 16, border: "1px solid rgba(212,175,55,0.07)", padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>{item.title}</div>
            <div style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.65 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

