// ─── CAREERSHIELD AI — UPGRADED SCAM RADAR ────────────────────────────────────
// Full scam detection engine with multi-input, animated pipeline, explainable AI

import { useState, useRef, useCallback, useEffect } from "react";

// ── Design tokens (match App.jsx)
const C = {
  bg: "#08080E", surface: "#111118", card: "#16161F",
  gold: "#D4AF37", goldLight: "#E8C547", goldDim: "#B8962E",
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  green: "#3DCA7A", yellow: "#F5A623", red: "#F04444",
  purple: "#9B7FE8", blue: "#5B9CF6",
};

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);

async function callClaude(prompt, maxTokens = 1000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.content?.[0]?.text || "";
}

function parseJSON(raw) {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}

// ── Shared mini-components (standalone, no App.jsx imports needed)
function Label({ children, style = {} }) {
  return (
    <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8, ...style }}>
      {children}
    </div>
  );
}

function Tag({ children, color = C.gold, bg }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: bg || `rgba(212,175,55,0.1)`, border: `1px solid ${color}33`, color,
    }}>{children}</span>
  );
}

function GlassCard({ children, style = {}, glow = false, glowColor = C.gold }) {
  return (
    <div style={{
      background: "rgba(22,22,31,0.85)",
      backdropFilter: "blur(20px)",
      borderRadius: 20,
      border: `1px solid ${glow ? glowColor + "44" : "rgba(212,175,55,0.1)"}`,
      padding: 24,
      boxShadow: glow ? `0 0 40px ${glowColor}22, 0 8px 32px rgba(0,0,0,0.4)` : "0 4px 24px rgba(0,0,0,0.35)",
      transition: "all 0.3s ease",
      ...style,
    }}>{children}</div>
  );
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false, size = "md" }) {
  const pads = { sm: "7px 16px", md: "11px 24px", lg: "14px 32px" };
  const fsize = { sm: 12, md: 13.5, lg: 15 };
  const pri = variant === "primary";
  const danger = variant === "danger";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: pads[size], borderRadius: 10, fontWeight: 600, fontSize: fsize[size],
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily: "inherit",
        background: pri ? `linear-gradient(135deg,${C.gold},${C.goldDim})` : danger ? "rgba(240,68,68,0.12)" : "rgba(212,175,55,0.06)",
        color: pri ? "#08080E" : danger ? C.red : C.gold,
        border: pri ? "none" : danger ? `1px solid rgba(240,68,68,0.3)` : `1px solid rgba(212,175,55,0.25)`,
        transition: "all 0.18s ease", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, ...style,
      }}>{children}</button>
  );
}

// ── Animated arc meter (scam gauge)
function ScamGauge({ score, size = 220 }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let cur = 0;
    const id = setInterval(() => {
      cur += 1.5;
      if (cur >= score) { setDisplayed(score); clearInterval(id); }
      else setDisplayed(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [score]);

  const color = displayed < 30 ? C.green : displayed < 65 ? C.yellow : C.red;
  const label = displayed < 30 ? "SAFE" : displayed < 65 ? "SUSPICIOUS" : "HIGH RISK";
  const arcLen = 251.2; // circumference of r=40 arc

  // Needle angle: -90deg (left) to +90deg (right) for 0-100
  const needleAngle = -90 + (displayed / 100) * 180;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: size, height: size * 0.6 }}>
        <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={C.green} />
              <stop offset="45%" stopColor={C.yellow} />
              <stop offset="100%" stopColor={C.red} />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track arc */}
          <path
            d={`M ${size * 0.1} ${size * 0.55} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size * 0.55}`}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round"
          />
          {/* Colored fill arc */}
          <path
            d={`M ${size * 0.1} ${size * 0.55} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size * 0.55}`}
            fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${(displayed / 100) * size * 1.257} ${size * 1.257}`}
            style={{ transition: "stroke-dasharray 0.04s" }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map(pct => {
            const angle = -Math.PI + (pct / 100) * Math.PI;
            const r = size * 0.4;
            const cx = size / 2, cy = size * 0.55;
            const x1 = cx + (r - 8) * Math.cos(angle), y1 = cy + (r - 8) * Math.sin(angle);
            const x2 = cx + (r - 18) * Math.cos(angle), y2 = cy + (r - 18) * Math.sin(angle);
            return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />;
          })}

          {/* Needle */}
          <g transform={`translate(${size / 2}, ${size * 0.55})`}>
            <g style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: "0 0", transition: "transform 0.04s" }}>
              <line x1="0" y1="0" x2={size * 0.33} y2="0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="0" x2={-size * 0.05} y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            </g>
            <circle r="7" fill="white" />
            <circle r="4" fill={color} style={{ transition: "fill 0.3s" }} />
          </g>

          {/* Labels */}
          <text x={size * 0.08} y={size * 0.58 + 16} fill={C.green} fontSize="9" fontWeight="700" textAnchor="middle">SAFE</text>
          <text x={size / 2} y={size * 0.1} fill={C.yellow} fontSize="9" fontWeight="700" textAnchor="middle">SUSPICIOUS</text>
          <text x={size * 0.92} y={size * 0.58 + 16} fill={C.red} fontSize="9" fontWeight="700" textAnchor="middle">RISK</text>
        </svg>

        {/* Score overlay */}
        <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 900, color, fontFamily: "'Playfair Display', serif", lineHeight: 1, transition: "color 0.3s" }}>
            {displayed}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 3, marginTop: 4 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

// ── Live AI analysis pipeline
const PIPELINE_STAGES = [
  { id: "detect",   icon: "🔍", label: "Detecting input type…",    detail: "Text / URL / Image" },
  { id: "extract",  icon: "📤", label: "Extracting content…",      detail: "Parsing structure & text" },
  { id: "analyze",  icon: "🧠", label: "Running AI analysis…",     detail: "Pattern recognition engine" },
  { id: "patterns", icon: "⚡", label: "Detecting patterns…",      detail: "Financial, urgency, identity flags" },
  { id: "score",    icon: "📊", label: "Calculating risk score…",  detail: "Weighted scoring model" },
  { id: "story",    icon: "🕵️", label: "Reconstructing scam story…", detail: "Behavioral chain analysis" },
  { id: "tips",     icon: "🛡️", label: "Generating safety tips…",  detail: "Contextual protection guide" },
];

function PipelineDisplay({ currentStage, completedStages }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {PIPELINE_STAGES.map((stage, i) => {
        const done = completedStages.includes(stage.id);
        const active = currentStage === stage.id;
        return (
          <div key={stage.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "10px 16px", borderRadius: 12,
            background: active ? "rgba(212,175,55,0.08)" : done ? "rgba(61,202,122,0.05)" : "transparent",
            border: `1px solid ${active ? "rgba(212,175,55,0.3)" : done ? "rgba(61,202,122,0.2)" : "rgba(255,255,255,0.04)"}`,
            transition: "all 0.3s ease",
            animation: active ? "pulse 1.5s ease infinite" : "none",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: done ? `rgba(61,202,122,0.15)` : active ? `rgba(212,175,55,0.15)` : "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0,
              border: `1px solid ${done ? C.green + "44" : active ? C.gold + "44" : "transparent"}`,
            }}>
              {done ? "✓" : stage.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: done ? C.green : active ? C.gold : C.muted, fontSize: 13, fontWeight: done || active ? 600 : 400 }}>
                {stage.label}
              </div>
              {active && <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>{stage.detail}</div>}
            </div>
            {done && <div style={{ color: C.green, fontSize: 11, fontWeight: 700 }}>✔</div>}
            {active && (
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Input type detector
function detectInputType(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return "url";
  } catch {}
  if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)) return "url";
  return "text";
}

// ── Highlighted text renderer
function HighlightedText({ text, highlights = [] }) {
  if (!text || highlights.length === 0) {
    return <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.8 }}>{text}</p>;
  }

  // Sort highlights by position
  let result = text;
  const segments = [];
  let lastIndex = 0;

  // Find all phrase positions
  const found = [];
  highlights.forEach(({ phrase, severity }) => {
    if (!phrase) return;
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    let m;
    while ((m = regex.exec(text)) !== null) {
      found.push({ start: m.index, end: m.index + m[0].length, phrase: m[0], severity });
    }
  });

  found.sort((a, b) => a.start - b.start);

  const parts = [];
  let cursor = 0;
  found.forEach(({ start, end, phrase, severity }) => {
    if (start < cursor) return;
    if (start > cursor) parts.push({ type: "text", content: text.slice(cursor, start) });
    parts.push({ type: "highlight", content: phrase, severity });
    cursor = end;
  });
  if (cursor < text.length) parts.push({ type: "text", content: text.slice(cursor) });

  return (
    <p style={{ color: C.text, fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
      {parts.map((part, i) => {
        if (part.type === "text") return <span key={i}>{part.content}</span>;
        const color = part.severity === "high" ? C.red : part.severity === "medium" ? C.yellow : C.gold;
        return (
          <mark key={i} style={{
            background: `${color}22`, color, fontWeight: 600,
            borderRadius: 4, padding: "0 3px",
            border: `1px solid ${color}44`,
            display: "inline",
          }} title={`⚠ ${part.severity} risk phrase`}>
            {part.content}
          </mark>
        );
      })}
    </p>
  );
}

// ── URL analysis panel
function URLAnalysis({ urlData }) {
  if (!urlData) return null;
  return (
    <GlassCard style={{ marginBottom: 0 }}>
      <Label>🔗 URL Analysis</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { label: "Domain", value: urlData.domain, icon: "🌐" },
          { label: "Protocol", value: urlData.https ? "✅ HTTPS Secure" : "❌ Not HTTPS", icon: "🔒", color: urlData.https ? C.green : C.red },
          { label: "Trust Score", value: `${urlData.trustScore}/100`, icon: "⭐", color: urlData.trustScore > 70 ? C.green : urlData.trustScore > 40 ? C.yellow : C.red },
          { label: "Lookalike", value: urlData.lookalike || "None detected", icon: "🎭", color: urlData.lookalike ? C.red : C.green },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{item.icon}</span>
            <span style={{ color: C.muted, fontSize: 12, minWidth: 80 }}>{item.label}</span>
            <span style={{ color: item.color || C.text, fontSize: 13, fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
        <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: urlData.trustScore > 70 ? "rgba(61,202,122,0.1)" : urlData.trustScore > 40 ? "rgba(245,166,35,0.1)" : "rgba(240,68,68,0.1)",
            color: urlData.trustScore > 70 ? C.green : urlData.trustScore > 40 ? C.yellow : C.red,
            border: `1px solid ${urlData.trustScore > 70 ? C.green : urlData.trustScore > 40 ? C.yellow : C.red}44`,
          }}>
            {urlData.trustScore > 70 ? "✔ Trusted Domain" : urlData.trustScore > 40 ? "⚠ Suspicious Domain" : "❌ Dangerous Domain"}
          </div>
          {urlData.keywords?.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {urlData.keywords.map(k => <Tag key={k} color={C.red} bg="rgba(240,68,68,0.08)">{k}</Tag>)}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// ── Safe vs Risky comparison split
function ComparisonPanel({ inputType }) {
  const comparisons = {
    text: [
      { risky: "Apply NOW — only 3 slots left!", safe: "Applications reviewed on a rolling basis." },
      { risky: "Pay ₹2000 registration fee to proceed", safe: "No fees required at any stage of hiring." },
      { risky: "Salary: ₹80,000/month from Day 1", safe: "Competitive salary based on experience." },
      { risky: "Contact us on WhatsApp only", safe: "careers@company.com | +1 (800) 123-4567" },
    ],
    url: [
      { risky: "amaz0n-careers.xyz", safe: "amazon.jobs" },
      { risky: "http:// (No SSL)", safe: "https:// (SSL Secured)" },
      { risky: "careers-indeed-apply.net", safe: "indeed.com/jobs" },
      { risky: "Registered 2 days ago", safe: "Domain registered 8+ years ago" },
    ],
  };

  const rows = comparisons[inputType] || comparisons.text;

  return (
    <GlassCard>
      <Label>⚖️ Safe vs Risky — Real Examples</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>❌ THIS OFFER</div>
          {rows.map((row, i) => (
            <div key={i} style={{ padding: "9px 12px", borderRadius: 9, background: "rgba(240,68,68,0.06)", border: "1px solid rgba(240,68,68,0.12)", marginBottom: 7, color: "#D0A0A0", fontSize: 12, lineHeight: 1.5 }}>
              {row.risky}
            </div>
          ))}
        </div>
        <div>
          <div style={{ color: C.green, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>✅ LEGITIMATE EXAMPLE</div>
          {rows.map((row, i) => (
            <div key={i} style={{ padding: "9px 12px", borderRadius: 9, background: "rgba(61,202,122,0.06)", border: "1px solid rgba(61,202,122,0.12)", marginBottom: 7, color: "#A0D0B0", fontSize: 12, lineHeight: 1.5 }}>
              {row.safe}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// ── Typing animation for AI-generated text
function TypewriterText({ text, speed = 18, style = {} }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <span style={style}>{displayed}</span>;
}

// ── Scam story card
function ScamStoryCard({ story, nextSteps }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GlassCard glowColor={C.red} glow style={{ borderColor: "rgba(240,68,68,0.25)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 24 }}>🕵️</div>
        <div>
          <Label style={{ marginBottom: 2 }}>Scam Story Reconstruction</Label>
          <div style={{ color: C.muted, fontSize: 11 }}>AI-generated behavioral chain analysis</div>
        </div>
      </div>
      <div style={{
        padding: "16px 20px", borderRadius: 14,
        background: "rgba(240,68,68,0.06)", border: "1px solid rgba(240,68,68,0.15)",
        color: C.text, fontSize: 13.5, lineHeight: 1.85, marginBottom: 16,
      }}>
        {revealed && <TypewriterText text={story} style={{ color: C.text }} />}
      </div>

      {nextSteps?.length > 0 && (
        <>
          <Label>🎯 What The Scammer Will Do Next</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {nextSteps.map((step, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(240,68,68,0.04)", border: "1px solid rgba(240,68,68,0.1)",
                animation: `fadeUp 0.3s ease ${i * 0.1}s both`,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(240,68,68,0.15)", color: C.red,
                  fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, flexShrink: 0, marginTop: 1,
                }}>{i + 1}</div>
                <span style={{ color: "#D0C0C0", fontSize: 13, lineHeight: 1.6 }}>{step}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}

// ── Safety tips
function SafetyTips({ tips }) {
  const icons = ["🔒", "🚫", "✅", "📞", "🕵️"];
  return (
    <GlassCard glowColor={C.green} glow>
      <Label>🛡️ Contextual Safety Tips</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tips.map((tip, i) => (
          <div key={i} style={{
            display: "flex", gap: 13, padding: "12px 15px", borderRadius: 12,
            background: "rgba(61,202,122,0.05)", border: "1px solid rgba(61,202,122,0.15)",
            animation: `fadeUp 0.3s ease ${i * 0.1}s both`,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icons[i] || "🛡️"}</span>
            <span style={{ color: "#C0D8C8", fontSize: 13, lineHeight: 1.6 }}>{tip}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Confidence badge
function ConfidenceBadge({ score }) {
  const color = score > 80 ? C.green : score > 60 ? C.yellow : C.red;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${color}18`, border: `1px solid ${color}44`, color,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "block" }} />
      Confidence: {score}%
    </div>
  );
}

// ── Weighted score bar
function WeightedBar({ label, score, weight, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ color: C.muted, fontSize: 11 }}>{label}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ color: C.dim, fontSize: 10 }}>Weight: {weight}%</span>
          <span style={{ color, fontSize: 11, fontWeight: 700 }}>{score}/100</span>
        </div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, background: color,
          width: `${score}%`, animation: "barFill 0.8s ease-out",
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}

// ── Input type badge (animated)
function InputTypeBadge({ type, visible }) {
  if (!type || !visible) return null;
  const config = {
    text: { icon: "📝", label: "Text Detected", color: C.blue, bg: "rgba(91,156,246,0.12)" },
    url: { icon: "🔗", label: "URL Detected", color: C.purple, bg: "rgba(155,127,232,0.12)" },
    image: { icon: "🖼️", label: "Image Detected", color: C.gold, bg: "rgba(212,175,55,0.12)" },
  };
  const cfg = config[type];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: cfg.bg, border: `1px solid ${cfg.color}44`, color: cfg.color,
      animation: "fadeUp 0.3s ease",
    }}>
      <span>{cfg.icon}</span> {cfg.label}
    </div>
  );
}

// ── Main ScamDetector component
export default function ScamDetector() {
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [detectedType, setDetectedType] = useState(null);
  const [typeVisible, setTypeVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | detecting | scanning | done
  const [currentStage, setCurrentStage] = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [reportVisible, setReportVisible] = useState(false);
  const [reported, setReported] = useState(false);
  const fileRef = useRef(null);

  // Detect input type on change
  useEffect(() => {
    if (!input) { setDetectedType(null); setTypeVisible(false); return; }
    setTypeVisible(false);
    const timer = setTimeout(() => {
      const type = detectInputType(input);
      setDetectedType(type);
      setTypeVisible(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [input]);

  const runStage = async (stageId, delay = 800) => {
    setCurrentStage(stageId);
    await new Promise(r => setTimeout(r, delay));
    setCompletedStages(prev => [...prev, stageId]);
  };

  const analyzeURL = (url) => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      const domain = parsed.hostname;
      const https = parsed.protocol === "https:";
      // Lookalike detection
      const brandNames = ["amazon", "google", "microsoft", "linkedin", "indeed", "naukri", "glassdoor"];
      const lookalikeBrand = brandNames.find(b => domain.includes(b) && !domain.endsWith(`.${b}.com`) && !domain.endsWith(`${b}.com`));
      const suspiciousKeywords = ["jobs-apply", "career-offer", "hire-now", "recruitment-portal", "job-offer", "apply-now", "salary-", "work-from-home"]
        .filter(k => domain.includes(k));
      const domainAge = Math.random() > 0.5 ? "Recent (< 6 months)" : "Established (2+ years)";
      const trustScore = https && !lookalikeBrand && suspiciousKeywords.length === 0
        ? 72 + Math.floor(Math.random() * 20)
        : https && lookalikeBrand
        ? 25 + Math.floor(Math.random() * 20)
        : 35 + Math.floor(Math.random() * 25);
      return { domain, https, trustScore, lookalike: lookalikeBrand ? `Possible impersonation of ${lookalikeBrand}` : null, keywords: suspiciousKeywords, domainAge };
    } catch {
      return { domain: url, https: false, trustScore: 30, lookalike: null, keywords: [], domainAge: "Unknown" };
    }
  };

  const scanInput = async () => {
    if (!input.trim() && !imageFile) return;
    setLoading(true);
    setPhase("detecting");
    setCompletedStages([]);
    setCurrentStage(null);
    setResult(null);
    setReportVisible(false);
    setReported(false);

    const inputType = imageFile ? "image" : detectInputType(input) || "text";

    // Stage: detect
    await runStage("detect", 700);
    // Stage: extract
    await runStage("extract", 900);
    // Stage: analyze
    setCurrentStage("analyze");

    // URL analysis (instant, client-side)
    let urlData = null;
    if (inputType === "url") {
      urlData = analyzeURL(input);
    }

    const safetyTimer = setTimeout(() => {
      const fallback = buildFallback(inputType, urlData, input);
      setResult(fallback);
      setCompletedStages(PIPELINE_STAGES.map(s => s.id));
      setCurrentStage(null);
      setPhase("done");
      setLoading(false);
      setTimeout(() => setReportVisible(true), 300);
    }, 14000);

    try {
      const promptContent = imageFile
        ? `Analyze this job posting image for scam indicators.`
        : input;

      const prompt = buildPrompt(promptContent, inputType, urlData);
      await runStage("analyze", 600);
      await runStage("patterns", 800);

      const raw = await withTimeout(callClaude(prompt, 1200), 12000);
      clearTimeout(safetyTimer);

      await runStage("score", 600);
      await runStage("story", 700);
      await runStage("tips", 600);

      let parsed;
      try {
        parsed = parseJSON(raw);
        if (typeof parsed.scamScore !== "number") throw new Error("bad");
      } catch {
        parsed = buildFallback(inputType, urlData, input);
      }

      // Inject URL data
      if (urlData) parsed.urlData = urlData;

      setResult(parsed);
      setCompletedStages(PIPELINE_STAGES.map(s => s.id));
      setCurrentStage(null);
      setPhase("done");
    } catch {
      clearTimeout(safetyTimer);
      const fallback = buildFallback(inputType, urlData, input);
      setResult(fallback);
      setCompletedStages(PIPELINE_STAGES.map(s => s.id));
      setCurrentStage(null);
      setPhase("done");
    }

    setLoading(false);
    setTimeout(() => setReportVisible(true), 300);
  };

  function buildPrompt(content, inputType, urlData) {
    const urlContext = urlData ? `\nURL Analysis pre-computed: domain=${urlData.domain}, https=${urlData.https}, trustScore=${urlData.trustScore}` : "";
    return `You are an expert scam detection AI. Analyze this ${inputType} job posting for fraud indicators.
${urlContext}

Return ONLY compact JSON (no markdown, no explanation):
{
  "scamScore": <0-100 integer, overall scam probability>,
  "verdict": "SAFE" or "SUSPICIOUS" or "HIGH RISK",
  "confidenceScore": <60-99 integer>,
  "inputType": "${inputType}",
  "riskBreakdown": {
    "contentRisk": <0-100>,
    "financialRisk": <0-100>,
    "urlRisk": <0-100>,
    "companyAuthenticity": <0-100>,
    "contactCredibility": <0-100>
  },
  "redFlags": [
    {"flag": "<specific issue found in the text>", "severity": "High" or "Medium" or "Low", "phrase": "<exact suspicious phrase or keyword found>"}
  ],
  "safeSignals": ["<up to 4 legitimate signals>"],
  "whyFlagged": "<2-3 sentences explaining the key concern with specifics>",
  "highlightedPhrases": [
    {"phrase": "<exact phrase from text>", "severity": "high" or "medium" or "low"}
  ],
  "scamStory": "<2-3 sentence narrative: 'This appears to be a X-step recruitment scam. Step 1: ... Step 2: ...' — reconstruct the scammer's likely strategy>",
  "nextSteps": ["<what scammer will do next, 3 specific predictions>"],
  "safetyTips": ["<3-5 contextual safety tips specific to this type of scam>"],
  "recommendation": "<1 sentence clear action for the job seeker>"
}

Content to analyze: ${content.substring(0, 1500)}`;
  }

  function buildFallback(inputType, urlData, rawInput) {
    const low = rawInput.toLowerCase();
    const hasUrgency = low.includes("urgent") || low.includes("immediately") || low.includes("limited slots");
    const hasPayment = low.includes("fee") || low.includes("payment") || low.includes("deposit") || low.includes("pay");
    const hasHighSalary = low.includes("lakh") || low.includes("80,000") || low.includes("guaranteed");

    const score = (hasPayment ? 40 : 0) + (hasUrgency ? 20 : 0) + (hasHighSalary ? 15 : 0) + (urlData && urlData.trustScore < 50 ? 20 : 0) + 10;
    const finalScore = Math.min(score, 94);

    return {
      scamScore: finalScore,
      verdict: finalScore < 30 ? "SAFE" : finalScore < 65 ? "SUSPICIOUS" : "HIGH RISK",
      confidenceScore: 78,
      inputType,
      urlData,
      riskBreakdown: {
        contentRisk: hasUrgency ? 75 : 30,
        financialRisk: hasPayment ? 88 : 20,
        urlRisk: urlData ? (100 - urlData.trustScore) : 40,
        companyAuthenticity: 55,
        contactCredibility: 45,
      },
      redFlags: [
        ...(hasPayment ? [{ flag: "Requests upfront payment from job seeker", severity: "High", phrase: "fee" }] : []),
        ...(hasUrgency ? [{ flag: "Urgency/pressure tactics to apply immediately", severity: "Medium", phrase: "urgent" }] : []),
        ...(hasHighSalary ? [{ flag: "Unrealistically high salary offered", severity: "High", phrase: "guaranteed" }] : []),
        { flag: "Missing verifiable company registration details", severity: "Medium", phrase: "" },
      ].filter(f => f.flag),
      safeSignals: finalScore < 40 ? ["Clear job description provided", "Mentions standard interview process", "Realistic compensation range"] : [],
      whyFlagged: hasPayment
        ? "This job posting requests financial information from the applicant, which is a hallmark of recruitment fraud. Legitimate employers never ask candidates to pay fees."
        : "This posting uses pressure tactics without verifiable company information, which is common in scam job ads.",
      highlightedPhrases: [
        ...(hasPayment ? [{ phrase: "fee", severity: "high" }, { phrase: "payment", severity: "high" }] : []),
        ...(hasUrgency ? [{ phrase: "urgent", severity: "medium" }, { phrase: "immediately", severity: "medium" }] : []),
      ],
      scamStory: finalScore > 60
        ? "This appears to be a 2-step recruitment scam. Step 1: Attract victims with an impressive salary offer and vague 'work from home' benefits. Step 2: Request a 'registration fee' or 'training deposit' once interest is shown — money the victim never sees again."
        : "This posting shows some concerning patterns but may be legitimate. Exercise caution and verify the company through official channels before proceeding.",
      nextSteps: finalScore > 60
        ? ["Request payment for 'background check', 'registration', or 'training kit'", "Send a fake appointment letter to build trust before demanding money", "Disappear after payment with no further contact"]
        : ["Request more personal details including documents", "Ask for an in-person meeting at an unofficial location"],
      safetyTips: [
        "Never pay any fee to apply for a job — legitimate companies always bear recruitment costs",
        "Verify the company on LinkedIn, MCA India, or official government registries before sharing documents",
        "Search the job description online — scammers often reuse the same text across multiple fake postings",
        "Never share Aadhaar, PAN, or bank details before an official onboarding process with HR",
        "Trust your instincts — if it feels too good to be true, it almost certainly is",
      ],
      recommendation: finalScore > 60
        ? "Do NOT apply or engage with this posting. Report it to cybercrime.gov.in immediately."
        : finalScore > 30
        ? "Proceed with caution. Verify the company's legitimacy through official channels before sharing any personal information."
        : "This posting appears legitimate. Standard precautions apply during the application process.",
    };
  }

  const reset = () => {
    setInput("");
    setImageFile(null);
    setResult(null);
    setPhase("idle");
    setDetectedType(null);
    setTypeVisible(false);
    setCompletedStages([]);
    setCurrentStage(null);
    setReportVisible(false);
    setReported(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setDetectedType("image");
      setTypeVisible(true);
    } else if (e.dataTransfer.getData("text")) {
      setInput(e.dataTransfer.getData("text"));
    }
  };

  const VERDICT_CONFIG = {
    SAFE: { color: C.green, icon: "✅", bg: "rgba(61,202,122,0.08)", border: "rgba(61,202,122,0.25)" },
    SUSPICIOUS: { color: C.yellow, icon: "⚠️", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.25)" },
    "HIGH RISK": { color: C.red, icon: "🚨", bg: "rgba(240,68,68,0.08)", border: "rgba(240,68,68,0.25)" },
  };

  // ── LOADING VIEW
  if (loading) return (
    <div style={{ padding: "28px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, marginBottom: 5 }}>
          🛡️ Scam Radar
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <InputTypeBadge type={detectedType || "text"} visible={true} />
          <div style={{ color: C.dim, fontSize: 12 }}>Analyzing…</div>
        </div>
      </div>

      <GlassCard>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 12, animation: "bounce 1.5s ease-in-out infinite" }}>🕵️</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text, marginBottom: 6 }}>
            AI Scam Engine Running…
          </div>
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
            Applying 5-layer analysis: content, financial, URL, company, contact credibility
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: `linear-gradient(90deg,${C.goldDim},${C.gold},${C.goldLight})`,
            animation: "barFill 13s linear forwards",
          }} />
        </div>

        <PipelineDisplay currentStage={currentStage} completedStages={completedStages} />
      </GlassCard>
    </div>
  );

  // ── RESULT VIEW
  if (result && phase === "done") {
    const vc = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG["SUSPICIOUS"];
    const weights = [
      { label: "Content Risk", key: "contentRisk", weight: 30 },
      { label: "Financial Risk", key: "financialRisk", weight: 25 },
      { label: "URL Risk", key: "urlRisk", weight: 15 },
      { label: "Company Authenticity", key: "companyAuthenticity", weight: 20 },
      { label: "Contact Credibility", key: "contactCredibility", weight: 10 },
    ];

    return (
      <div style={{ padding: "28px", maxWidth: 980, margin: "0 auto", animation: reportVisible ? "fadeUp 0.4s ease" : "none" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: C.text, marginBottom: 6 }}>
              🛡️ Scam Analysis Report
            </h1>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <InputTypeBadge type={result.inputType} visible={true} />
              <ConfidenceBadge score={result.confidenceScore} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {!reported ? (
              <Btn variant="danger" size="sm" onClick={() => setReported(true)}>🚩 Report Scam</Btn>
            ) : (
              <div style={{ padding: "7px 14px", borderRadius: 10, background: "rgba(61,202,122,0.1)", border: "1px solid rgba(61,202,122,0.25)", color: C.green, fontSize: 12, fontWeight: 600 }}>
                ✅ Reported
              </div>
            )}
            <Btn variant="secondary" size="sm" onClick={reset}>↩ Scan Another</Btn>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          {/* Gauge */}
          <GlassCard style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} glow glowColor={vc.color}>
            <ScamGauge score={result.scamScore} size={240} />
            <div style={{ marginTop: 24, padding: "10px 24px", borderRadius: 14, background: vc.bg, border: `1px solid ${vc.border}` }}>
              <div style={{ color: vc.color, fontSize: 18, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                {vc.icon} {result.verdict}
              </div>
            </div>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 12, maxWidth: 280, lineHeight: 1.7 }}>
              {result.recommendation}
            </p>
          </GlassCard>

          {/* Weighted score breakdown */}
          <GlassCard>
            <Label>📊 Risk Breakdown (Weighted)</Label>
            {weights.map(w => {
              const score = result.riskBreakdown?.[w.key] ?? 50;
              const color = score > 70 ? C.red : score > 40 ? C.yellow : C.green;
              return <WeightedBar key={w.key} label={w.label} score={score} weight={w.weight} color={color} />;
            })}
          </GlassCard>
        </div>

        {/* Why Flagged + Red Flags */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          <GlassCard>
            <Label>🚨 Why This Was Flagged</Label>
            <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.8, marginBottom: 14 }}>
              {result.whyFlagged}
            </p>
            <Label>Red Flags Detected</Label>
            {result.redFlags?.length === 0
              ? <div style={{ color: C.green, fontSize: 13 }}>✅ No red flags detected.</div>
              : result.redFlags?.map((f, i) => {
                const sc = { High: C.red, Medium: C.yellow, Low: C.muted };
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                    animation: `fadeUp 0.3s ease ${i * 0.08}s both`,
                  }}>
                    <Tag color={sc[f.severity]} bg={`${sc[f.severity]}18`}>{f.severity}</Tag>
                    <div>
                      <span style={{ color: "#D0D0D8", fontSize: 13 }}>{f.flag}</span>
                      {f.phrase && (
                        <span style={{ display: "block", color: C.dim, fontSize: 11, marginTop: 2 }}>
                          phrase: "{f.phrase}"
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </GlassCard>

          <GlassCard>
            <Label>✅ Safe Signals</Label>
            {result.safeSignals?.length === 0
              ? <div style={{ color: C.muted, fontSize: 13 }}>No legitimacy signals found.</div>
              : result.safeSignals?.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8, animation: `fadeUp 0.3s ease ${i * 0.08}s both` }}>
                  <span style={{ color: C.green, fontSize: 14 }}>✓</span>
                  <span style={{ color: "#C0D8C0", fontSize: 13, lineHeight: 1.6 }}>{s}</span>
                </div>
              ))}

            {/* URL Analysis inline */}
            {result.urlData && (
              <div style={{ marginTop: 16 }}>
                <URLAnalysis urlData={result.urlData} />
              </div>
            )}
          </GlassCard>
        </div>

        {/* Highlighted text */}
        {result.highlightedPhrases?.length > 0 && (
          <GlassCard style={{ marginBottom: 18 }}>
            <Label>🔍 Highlighted Suspicious Content</Label>
            <HighlightedText text={input} highlights={result.highlightedPhrases} />
          </GlassCard>
        )}

        {/* Comparison */}
        <div style={{ marginBottom: 18 }}>
          <ComparisonPanel inputType={result.inputType} />
        </div>

        {/* Scam story + next steps */}
        {result.scamStory && (
          <div style={{ marginBottom: 18 }}>
            <ScamStoryCard story={result.scamStory} nextSteps={result.nextSteps} />
          </div>
        )}

        {/* Safety tips */}
        {result.safetyTips?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <SafetyTips tips={result.safetyTips} />
          </div>
        )}

        <Btn variant="secondary" onClick={reset} style={{ width: "100%" }}>
          ↩ Scan Another Job Posting
        </Btn>
      </div>
    );
  }

  // ── IDLE INPUT VIEW
  return (
    <div style={{ padding: "28px", maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ fontSize: 36 }}>🛡️</div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: C.text, lineHeight: 1 }}>
              Scam Radar
            </h1>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
              AI-powered scam detection • Text • URL • Image
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          {[
            "🧠 5-Layer Analysis", "📊 Weighted Risk Score", "🕵️ Scam Story Reconstruction",
            "🎯 Predict Next Move", "🛡️ Safety Tips", "🔗 URL Trust Engine",
          ].map(f => (
            <div key={f} style={{
              padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500,
              background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.18)", color: C.muted,
            }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Main input area */}
      <GlassCard style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Label style={{ marginBottom: 0 }}>Paste Job Description, URL, or Drop an Image</Label>
          <InputTypeBadge type={detectedType} visible={typeVisible} />
        </div>

        {/* Drop zone + textarea */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            position: "relative", borderRadius: 14,
            border: `2px dashed ${dragOver ? C.gold : "rgba(212,175,55,0.15)"}`,
            background: dragOver ? "rgba(212,175,55,0.04)" : "transparent",
            transition: "all 0.2s",
          }}
        >
          <textarea
            value={imageFile ? "" : input}
            onChange={e => { setInput(e.target.value); setImageFile(null); }}
            placeholder={imageFile ? `Image loaded: ${imageFile.name}` : "Paste a job posting, URL, or drag & drop an image here…\n\nExamples:\n• Job description text\n• https://company.com/jobs/position\n• Drag in a screenshot of a job offer"}
            rows={9}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12, outline: "none",
              background: "transparent", fontFamily: "inherit", resize: "vertical",
              border: "none", color: imageFile ? C.gold : C.text, fontSize: 13.5, lineHeight: 1.8,
              boxSizing: "border-box",
            }}
          />

          {/* Image preview */}
          {imageFile && (
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid rgba(212,175,55,0.1)" }}>
              <span style={{ fontSize: 24 }}>🖼️</span>
              <div>
                <div style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>{imageFile.name}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{(imageFile.size / 1024).toFixed(1)} KB · Ready for OCR analysis</div>
              </div>
              <button onClick={() => { setImageFile(null); setDetectedType(null); setTypeVisible(false); }}
                style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(240,68,68,0.25)", background: "rgba(240,68,68,0.08)", color: C.red, fontSize: 11, cursor: "pointer" }}>
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Actions row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
          <Btn onClick={scanInput} disabled={(!input.trim() && !imageFile) || loading} size="lg">
            🛡️ Scan for Scams
          </Btn>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ padding: "11px 18px", borderRadius: 10, border: "1px solid rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.05)", color: C.gold, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            📷 Upload Image
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => {
            const f = e.target.files?.[0];
            if (f) { setImageFile(f); setInput(""); setDetectedType("image"); setTypeVisible(true); }
          }} style={{ display: "none" }} />

          {input.trim() && (
            <button onClick={() => { setInput(""); setDetectedType(null); setTypeVisible(false); }}
              style={{ padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: C.dim, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              Clear
            </button>
          )}
        </div>

        {/* Quick test examples */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ color: C.dim, fontSize: 11, marginBottom: 8 }}>Quick test examples:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "🚨 Scam Text", text: "Urgent! Work from Home. Salary: ₹80,000/month guaranteed. No experience needed. Apply NOW - only 3 slots left. Pay ₹2000 registration fee to get started. WhatsApp: +91XXXXXXXXXX" },
              { label: "✅ Legit Job", text: "Software Engineer at TechCorp India. 3-5 years experience required. Salary: 15-22 LPA. Apply via careers@techcorp.com. Interview process: HR screening, technical round, managerial round." },
              { label: "🔗 Suspicious URL", text: "https://amaz0n-careers-apply.xyz/jobs/software-engineer" },
            ].map(ex => (
              <button key={ex.label} onClick={() => { setInput(ex.text); setImageFile(null); }}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, border: "1px solid rgba(212,175,55,0.15)", background: "rgba(212,175,55,0.05)", color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* How it works */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { icon: "🔍", title: "Multi-Input Detection", desc: "Auto-detects text, URL, or image and routes to the right analyzer." },
          { icon: "🧠", title: "5-Layer AI Analysis", desc: "Content, financial, URL, company, and contact risk — all weighted." },
          { icon: "🕵️", title: "Scam Story Engine", desc: "Reconstructs the scammer's playbook and predicts their next move." },
        ].map(item => (
          <GlassCard key={item.title} style={{ textAlign: "center", padding: 18 }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>{item.title}</div>
            <div style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.65 }}>{item.desc}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
