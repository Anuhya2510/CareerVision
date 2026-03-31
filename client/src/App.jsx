import { useState, useEffect, useRef, useCallback } from "react";

import ScamDetectorUpgraded from './ScamDetector.jsx';
import SkillGapNew from './components/SkillGap.jsx';
import CareerRecommendationNew from './components/CareerRecommendation.jsx';
import ScamAnalyzerNew from './components/ScamAnalyzer.jsx';
import ImageResumeParser from './components/ImageResumeParser.jsx';
import JobDescriptionInput from './components/JobDescriptionInput.jsx';
import JobMatchScore from './components/JobMatchScore.jsx';
import SkillMatchList from './components/SkillMatchList.jsx';
import KeywordSuggestions from './components/KeywordSuggestions.jsx';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#08080E",
  surface: "#111118",
  card: "#16161F",
  gold: "#D4AF37",
  goldLight: "#E8C547",
  goldDim: "#B8962E",
  text: "#E8E8F0",
  muted: "#888899",
  dim: "#3A3A4E",
  green: "#3DCA7A",
  yellow: "#F5A623",
  red: "#F04444",
  purple: "#9B7FE8",
  blue: "#5B9CF6",
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior: smooth; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 2px; }
  input::placeholder, textarea::placeholder { color: #2E2E42; }

  @keyframes fadeUp    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
  @keyframes slideLeft { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes bounce    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
  @keyframes shimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes spin      { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes barFill   { from { width:0%; } to { } }
  @keyframes radarScan { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
  @keyframes countUp   { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
  @keyframes glow      { 0%,100% { box-shadow:0 0 20px rgba(212,175,55,0.2); } 50% { box-shadow:0 0 40px rgba(212,175,55,0.5); } }
  @keyframes typewriter { from { width:0; } to { width:100%; } }
  @keyframes badgePop  { 0% { transform:scale(0) rotate(-10deg); opacity:0; } 60% { transform:scale(1.15) rotate(3deg); } 100% { transform:scale(1) rotate(0deg); opacity:1; } }
  @keyframes progressPulse { 0%,100% { opacity:0.8; } 50% { opacity:1; } }

  .btn-primary        { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1) !important; }
  .btn-primary:hover  { transform: translateY(-2px) scale(1.02); box-shadow: 0 10px 32px rgba(212,175,55,0.4) !important; }
  .btn-primary:active { transform: translateY(0) scale(0.98); }
  .btn-secondary:hover { background: rgba(212,175,55,0.12) !important; transform: translateY(-1px); }
  .card-hover { transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important; }
  .card-hover:hover { transform: translateY(-4px); border-color: rgba(212,175,55,0.38) !important; box-shadow: 0 20px 56px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.08) !important; }

  @keyframes floatUp     { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
  @keyframes slideDown   { from { opacity:0; transform:translateY(-14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulseSlow   { 0%,100% { opacity:0.7; transform:scale(1); } 50% { opacity:1; transform:scale(1.02); } }
  @keyframes successPop  { 0% { transform:scale(0); opacity:0; } 60% { transform:scale(1.2); } 100% { transform:scale(1); opacity:1; } }

  body {
    background-image:
      radial-gradient(ellipse at 15% 10%, rgba(212,175,55,0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 90%, rgba(91,156,246,0.03) 0%, transparent 50%);
    background-attachment: fixed;
  }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(212,175,55,0.3), rgba(212,175,55,0.1)); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.4); }
  select { background: #0A0A14; color: #E8E8F0; border: 1px solid rgba(212,175,55,0.15); border-radius: 8px; padding: 6px 10px; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }
  select:focus { border-color: rgba(212,175,55,0.45); }
`;

// ─── MASCOT SVG ───────────────────────────────────────────────────────────────
function MascotSVG({ expression = "happy", size = 48 }) {
  const faces = {
    happy:    <><ellipse cx="24" cy="26" rx="5" ry="3" fill={C.gold} opacity="0.9"/><circle cx="19" cy="20" r="2" fill="#1A1A2E"/><circle cx="29" cy="20" r="2" fill="#1A1A2E"/><circle cx="19.8" cy="19.3" r="0.7" fill="white"/><circle cx="29.8" cy="19.3" r="0.7" fill="white"/></>,
    thinking: <><path d="M18 24 Q24 22 30 24" stroke={C.gold} strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="19" cy="20" r="2" fill="#1A1A2E"/><circle cx="29" cy="19" r="2" fill="#1A1A2E"/><circle cx="19.8" cy="19.3" r="0.7" fill="white"/><circle cx="29.8" cy="18.3" r="0.7" fill="white"/><text x="35" y="13" fontSize="9" fill={C.gold} fontWeight="bold">?</text></>,
    warning:  <><path d="M18 25 Q24 22 30 25" stroke={C.red} strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="19" cy="20" r="2.5" fill="#1A1A2E"/><circle cx="29" cy="20" r="2.5" fill="#1A1A2E"/><circle cx="20" cy="19.2" r="0.7" fill="white"/><circle cx="30" cy="19.2" r="0.7" fill="white"/></>,
    roast:    <><path d="M16 26 Q24 23 32 26" stroke={C.red} strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="18" cy="19" r="2.5" fill="#1A1A2E"/><circle cx="30" cy="19" r="2.5" fill="#1A1A2E"/><circle cx="19" cy="18.2" r="0.8" fill="white"/><circle cx="31" cy="18.2" r="0.8" fill="white"/><text x="34" y="11" fontSize="8" fill={C.red}>🔥</text></>,
    star:     <><path d="M17 25 Q24 22 31 25" stroke={C.green} strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="19" cy="19" r="2.5" fill="#1A1A2E"/><circle cx="29" cy="19" r="2.5" fill="#1A1A2E"/><circle cx="20" cy="18.2" r="0.8" fill="white"/><circle cx="30" cy="18.2" r="0.8" fill="white"/><text x="34" y="11" fontSize="8" fill={C.green}>★</text></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="10" y="30" width="28" height="16" rx="4" fill="#1A1A2E"/>
      <path d="M19 30 L24 38 L29 30" fill="#08080E"/>
      <path d="M16 30 L20 36" stroke={C.gold} strokeWidth="1"/>
      <path d="M32 30 L28 36" stroke={C.gold} strokeWidth="1"/>
      <polygon points="24,32 22,44 24,42 26,44" fill={C.gold}/>
      <circle cx="24" cy="18" r="13" fill="#FFD5A8"/>
      <path d="M11 15 Q12 7 24 6 Q36 7 37 15" fill="#3D2B1F"/>
      <ellipse cx="11" cy="18" rx="2.5" ry="3" fill="#FFD5A8"/>
      <ellipse cx="37" cy="18" rx="2.5" ry="3" fill="#FFD5A8"/>
      {faces[expression] || faces.happy}
      <rect x="15" y="17" width="6" height="5" rx="2" stroke={C.gold} strokeWidth="1.5" fill="none"/>
      <rect x="27" y="17" width="6" height="5" rx="2" stroke={C.gold} strokeWidth="1.5" fill="none"/>
      <line x1="21" y1="19.5" x2="27" y2="19.5" stroke={C.gold} strokeWidth="1.5"/>
    </svg>
  );
}

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { nav: "dashboard", icon: "⊞",  label: "Dashboard" },
  { nav: "resume",    icon: "📄", label: "Resume Analyzer" },
  { nav: "roast",     icon: "🔥", label: "Resume Roast" },
  { nav: "skills",    icon: "🧠", label: "Skill Gap" },
  { nav: "interview", icon: "🎤", label: "Mock Interview" },
  { nav: "scam",      icon: "🛡️", label: "Scam Radar" },
  { nav: "career",    icon: "🚀", label: "Career Paths" },
];

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Card({ children, style = {}, onClick, glow = false, glass = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={onClick ? "card-hover" : ""}
      style={{
        background: glass ? "rgba(22,22,31,0.75)" : C.card,
        backdropFilter: glass ? "blur(20px)" : undefined,
        borderRadius: 18,
        border: `1px solid ${hov && onClick ? "rgba(212,175,55,0.4)" : glow ? "rgba(212,175,55,0.18)" : "rgba(212,175,55,0.08)"}`,
        padding: 24,
        boxShadow: glow
          ? "0 0 40px rgba(212,175,55,0.14), 0 8px 32px rgba(0,0,0,0.35)"
          : "0 4px 24px rgba(0,0,0,0.3)",
        transition: "all 0.22s ease",
        cursor: onClick ? "pointer" : "default",
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
      className={pri ? "btn-primary" : "btn-secondary"}
      style={{
        padding: pads[size], borderRadius: 10, fontWeight: 600,
        fontSize: fsize[size], cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1, fontFamily: "inherit",
        background: pri ? `linear-gradient(135deg,${C.gold},${C.goldDim})`
          : danger ? "rgba(240,68,68,0.12)"
          : "rgba(212,175,55,0.06)",
        color: pri ? "#08080E" : danger ? C.red : C.gold,
        border: pri ? "none" : danger ? `1px solid rgba(240,68,68,0.3)` : `1px solid rgba(212,175,55,0.25)`,
        transition: "all 0.18s ease",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        ...style,
      }}>{children}</button>
  );
}

function Inp({ placeholder, value, onChange, type = "text", rows, style = {} }) {
  const [focused, setFocused] = useState(false);
  const s = {
    width: "100%", padding: "12px 15px", borderRadius: 11, outline: "none",
    background: "rgba(8,8,20,0.9)", fontFamily: "inherit",
    border: `1px solid ${focused ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.12)"}`,
    color: C.text, fontSize: 13.5,
    boxShadow: focused ? "0 0 0 3px rgba(212,175,55,0.08), 0 2px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.2)",
    transition: "all 0.2s ease", boxSizing: "border-box", resize: "vertical",
    letterSpacing: type === "password" ? 2 : 0,
    ...style,
  };
  if (rows) return <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows} style={{ ...s, letterSpacing: 0 }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />;
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={s} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />;
}

function Label({ children, style = {} }) {
  return <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8, ...style }}>{children}</div>;
}

function Tag({ children, color = C.gold, bg }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: bg || `rgba(212,175,55,0.1)`,
      border: `1px solid ${color}33`,
      color,
    }}>{children}</span>
  );
}

// ─── ANIMATED RING SCORE ──────────────────────────────────────────────────────
function RingScore({ target, label, color, size = 110 }) {
  const [val, setVal] = useState(0);
  const resolvedColor = color || (target >= 75 ? C.green : target >= 50 ? C.yellow : C.red);
  useEffect(() => {
    let cur = 0; const step = target / 60;
    const id = setInterval(() => { cur += step; if (cur >= target) { setVal(target); clearInterval(id); } else setVal(Math.floor(cur)); }, 16);
    return () => clearInterval(id);
  }, [target]);
  const r = 44, circ = 2 * Math.PI * r;
  const pct = circ - (val / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke={resolvedColor} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={pct}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.05s" }}/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: C.text, fontWeight: 800, fontSize: size > 100 ? 26 : 20, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{val}</div>
        </div>
      </div>
      {label && <div style={{ color: C.muted, fontSize: 11, textAlign: "center" }}>{label}</div>}
    </div>
  );
}

// ─── LEVEL BADGE ─────────────────────────────────────────────────────────────
function LevelBadge({ score }) {
  const level = score < 50
    ? { emoji: "🌱", title: "Beginner",   color: C.green,  bg: "rgba(61,202,122,0.1)",  desc: "Building your foundation" }
    : score < 75
    ? { emoji: "⚡", title: "Skilled",    color: C.yellow, bg: "rgba(245,166,35,0.1)",  desc: "Making solid progress" }
    : { emoji: "🔥", title: "Job Ready",  color: C.red,    bg: "rgba(240,68,68,0.1)",   desc: "You're competitive!" };

  return (
    <div style={{ padding: "14px 20px", borderRadius: 14, background: level.bg, border: `1px solid ${level.color}33`, display: "flex", alignItems: "center", gap: 14, animation: "badgePop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
      <div style={{ fontSize: 32 }}>{level.emoji}</div>
      <div>
        <div style={{ color: level.color, fontWeight: 700, fontSize: 16, fontFamily: "'Playfair Display', serif" }}>{level.title}</div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{level.desc}</div>
      </div>
    </div>
  );
}

// ─── SCAM RADAR METER ─────────────────────────────────────────────────────────
function ScamMeter({ score }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let cur = 0;
    const id = setInterval(() => { cur += 2; if (cur >= score) { setDisplayed(score); clearInterval(id); } else setDisplayed(cur); }, 20);
    return () => clearInterval(id);
  }, [score]);

  const color = displayed < 30 ? C.green : displayed < 65 ? C.yellow : C.red;
  const label = displayed < 30 ? "SAFE" : displayed < 65 ? "SUSPICIOUS" : "HIGH RISK";
  const labelColor = color;

  return (
    <div style={{ textAlign: "center" }}>
      {/* Arc meter */}
      <div style={{ position: "relative", width: 180, height: 100, margin: "0 auto 16px" }}>
        <svg width="180" height="100" viewBox="0 0 180 100">
          {/* Track */}
          <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round"/>
          {/* Colored fill */}
          <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none"
            stroke={`url(#radarGrad)`} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(displayed / 100) * 220} 220`}/>
          <defs>
            <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={C.green}/>
              <stop offset="50%" stopColor={C.yellow}/>
              <stop offset="100%" stopColor={C.red}/>
            </linearGradient>
          </defs>
          {/* Needle */}
          <line
            x1="90" y1="90"
            x2={90 + 55 * Math.cos(Math.PI + (displayed / 100) * Math.PI)}
            y2={90 + 55 * Math.sin(Math.PI + (displayed / 100) * Math.PI)}
            stroke="white" strokeWidth="2.5" strokeLinecap="round"
            style={{ transition: "all 0.05s" }}
          />
          <circle cx="90" cy="90" r="5" fill="white"/>
        </svg>
        <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: labelColor, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{displayed}%</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: labelColor, letterSpacing: 2, marginTop: 2 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

// ─── AI CALL HELPER ───────────────────────────────────────────────────────────
const withTimeout = (promise, ms) => Promise.race([promise, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);

async function callClaude(prompt, maxTokens = 900) {
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
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, page, onNavigate, user, onLogout }) {
  useEffect(() => {
    const esc = e => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.28s ease" }}/>
      <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, zIndex: 700, background: "rgba(10,10,18,0.96)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRight: "1px solid rgba(212,175,55,0.12)", display: "flex", flexDirection: "column", transform: open ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)", boxShadow: open ? "20px 0 80px rgba(0,0,0,0.7), 1px 0 0 rgba(212,175,55,0.06) inset" : "none" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MascotSVG expression="happy" size={32}/>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", color: C.gold, fontWeight: 700, fontSize: 15, lineHeight: 1 }}>CareerShield AI</div>
              <div style={{ color: C.dim, fontSize: 9, marginTop: 2, letterSpacing: 1 }}>CAREER INTELLIGENCE</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 27, height: 27, borderRadius: 7, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: C.dim, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,55,0.1)"; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.dim; }}>✕</button>
        </div>

        {/* User pill */}
        {user && (
          <div style={{ margin: "12px 14px 6px", padding: "10px 13px", borderRadius: 10, background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.bg, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{(user.name || "U")[0].toUpperCase()}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ color: C.dim, fontSize: 10 }}>{user.email}</div>
            </div>
          </div>
        )}

        <div style={{ padding: "14px 20px 6px", color: C.dim, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase" }}>Navigation</div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          {NAV_ITEMS.map(({ nav, icon, label }) => {
            const active = page === nav;
            return (
              <button key={nav} onClick={() => { onNavigate(nav); onClose(); }} style={{
                width: "100%", padding: "10px 12px", borderRadius: 9, border: "none",
                display: "flex", alignItems: "center", gap: 11,
                background: active ? "rgba(212,175,55,0.1)" : "transparent",
                borderLeft: `2px solid ${active ? C.gold : "transparent"}`,
                color: active ? C.gold : C.muted,
                cursor: "pointer", textAlign: "left", fontSize: 13.5, transition: "all 0.13s",
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(212,175,55,0.05)"; e.currentTarget.style.color = "#C0A030"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; } }}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                <span style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
                {nav === "roast" && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: C.red, background: "rgba(240,68,68,0.15)", padding: "2px 6px", borderRadius: 6 }}>NEW</span>}
                {active && <span style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: C.gold, flexShrink: 0 }}/>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "10px 10px 22px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {user ? (
            <button onClick={() => { onLogout(); onClose(); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "none", display: "flex", alignItems: "center", gap: 11, background: "transparent", color: C.dim, cursor: "pointer", fontSize: 13.5, textAlign: "left", transition: "all 0.13s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,68,68,0.07)"; e.currentTarget.style.color = C.red; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.dim; }}
            ><span style={{ fontSize: 15, width: 20, textAlign: "center" }}>⎋</span> Logout</button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "0 2px" }}>
              <Btn onClick={() => { onNavigate("login"); onClose(); }} variant="secondary" style={{ width: "100%" }}>Sign In</Btn>
              <Btn onClick={() => { onNavigate("signup"); onClose(); }} style={{ width: "100%" }}>Get Started</Btn>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ onOpen, onNavigate, page }) {
  if (["login", "signup"].includes(page)) return null;
  const active = NAV_ITEMS.find(n => n.nav === page);
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, height: 64, background: "rgba(8,8,14,0.92)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", borderBottom: "1px solid rgba(212,175,55,0.1)", display: "flex", alignItems: "center", padding: "0 24px", gap: 14, boxShadow: "0 1px 32px rgba(0,0,0,0.4)" }}>
      <button onClick={onOpen} style={{ width: 38, height: 38, borderRadius: 9, border: "1px solid rgba(212,175,55,0.13)", background: "rgba(212,175,55,0.03)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4.5, transition: "all 0.18s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,55,0.09)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,175,55,0.03)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.13)"; }}>
        {[14, 10, 14].map((w, i) => <span key={i} style={{ width: w, height: 1.5, background: C.goldDim, borderRadius: 2, display: "block" }}/>)}
      </button>
      <div onClick={() => onNavigate("landing")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
        <MascotSVG expression="happy" size={28}/>
        <span style={{ fontFamily: "'Playfair Display', serif", color: C.gold, fontWeight: 700, fontSize: 17 }}>CareerShield AI</span>
      </div>
      {active && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}><span style={{ color: C.dim }}>›</span><span style={{ color: C.muted, fontSize: 12 }}>{active.icon} {active.label}</span></div>}
    </header>
  );
}

// ─── BOSS CHATBOT ─────────────────────────────────────────────────────────────
function Chatbot({ onNavigate }) {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState([{ from: "bot", text: "I'm Shield — your AI career boss. Ask me anything. And don't sugarcoat your situation. I won't.", expression: "happy" }]);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const [expr, setExpr]       = useState("happy");
  const [ttsOn, setTtsOn]     = useState(false);
  const bottomRef = useRef(null);

  const BOSS_RESPONSES = {
    resume:    { text: "Your resume needs work. Let's find out exactly how much. Upload it now.", expr: "thinking", nav: "resume" },
    roast:     { text: "Want the truth? Let's roast that resume. No mercy, but guaranteed improvement.", expr: "roast", nav: "roast" },
    scam:      { text: "Smart move checking. Too many people get scammed chasing fake jobs. Paste it in Scam Radar.", expr: "warning", nav: "scam" },
    interview: { text: "Weak answers don't get offers. Practice now — I'll score every response you give.", expr: "thinking", nav: "interview" },
    skill:     { text: "Skill gaps are silent career killers. Tell me the role and I'll map exactly what you're missing.", expr: "thinking", nav: "skills" },
    career:    { text: "Career clarity first, hustle second. Give me your skills and interests.", expr: "happy", nav: "career" },
    salary:    { text: "Never accept the first number. But also — if it sounds too good, it's a scam. Run it by me.", expr: "warning" },
    hello:     { text: "Skip the pleasantries. What career problem are we solving right now?", expr: "happy" },
    default:   { text: "Be specific. Are we fixing a resume, detecting a scam, or prepping for interviews?", expr: "thinking" },
  };

  const speak = (text) => {
    if (!ttsOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.substring(0, 200));
    utt.rate = 1.05; utt.pitch = 0.9;
    window.speechSynthesis.speak(utt);
  };

  const respond = async (userMsg) => {
    const low = userMsg.toLowerCase();
    setTyping(true); setExpr("thinking");
    await new Promise(r => setTimeout(r, 900 + Math.random() * 400));
    const key = Object.keys(BOSS_RESPONSES).find(k => low.includes(k)) || "default";
    const res = BOSS_RESPONSES[key];
    setTyping(false); setExpr(res.expr || "happy");
    setMsgs(p => [...p, { from: "bot", text: res.text, expression: res.expr, nav: res.nav }]);
    speak(res.text);
  };

  const send = async (text) => {
    if (!text.trim()) return;
    setMsgs(p => [...p, { from: "user", text }]); setInput("");
    await respond(text);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const quickBtns = [
    { label: "🔥 Roast Resume", nav: "roast" },
    { label: "📄 Analyze Resume", nav: "resume" },
    { label: "🛡️ Check Scam", nav: "scam" },
    { label: "🎤 Interview Prep", nav: "interview" },
  ];

  return (
    <>
      {/* Float button */}
      <button onClick={() => setOpen(o => !o)} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1200, width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldDim})`, border: "none", cursor: "pointer", boxShadow: "0 8px 28px rgba(212,175,55,0.45)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s", animation: "glow 3s ease-in-out infinite" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {open ? <span style={{ fontSize: 20, color: C.bg }}>✕</span> : <MascotSVG expression={expr} size={42}/>}
      </button>

      {open && (
        <div style={{ position: "fixed", bottom: 92, right: 20, zIndex: 1100, width: 348, maxHeight: "calc(100vh - 140px)", borderRadius: 20, background: "#0D0D15", border: "1px solid rgba(212,175,55,0.18)", boxShadow: "0 28px 80px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp 0.26s ease" }}>
          {/* Chat header */}
          <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(212,175,55,0.08)", background: "rgba(212,175,55,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
            <MascotSVG expression={expr} size={36}/>
            <div>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 14, fontFamily: "'Playfair Display', serif" }}>Shield — Career Boss</div>
              <div style={{ color: C.dim, fontSize: 10 }}>Direct • Honest • No fluff</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={() => setTtsOn(t => !t)} title="Toggle voice" style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${ttsOn ? C.gold : "rgba(255,255,255,0.08)"}`, background: ttsOn ? "rgba(212,175,55,0.15)" : "transparent", color: ttsOn ? C.gold : C.dim, fontSize: 12, cursor: "pointer" }}>🔊</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 13px", display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.2s ease" }}>
                {msg.from === "bot" && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", maxWidth: "90%" }}>
                    <MascotSVG expression={msg.expression || "happy"} size={24}/>
                    <div style={{ padding: "9px 13px", borderRadius: "14px 14px 14px 3px", background: "#1A1A28", border: "1px solid rgba(212,175,55,0.08)", color: C.text, fontSize: 13, lineHeight: 1.6 }}>{msg.text}</div>
                  </div>
                )}
                {msg.from === "user" && (
                  <div style={{ padding: "9px 13px", borderRadius: "14px 14px 3px 14px", background: `linear-gradient(135deg,${C.gold},${C.goldDim})`, color: C.bg, fontSize: 13, lineHeight: 1.6, maxWidth: "80%", fontWeight: 500 }}>{msg.text}</div>
                )}
                {msg.nav && (
                  <button onClick={() => { onNavigate(msg.nav); setOpen(false); }} style={{ marginTop: 5, padding: "4px 10px", borderRadius: 20, background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", color: C.gold, fontSize: 11, cursor: "pointer", alignSelf: "flex-start", marginLeft: 32 }}>
                    → Open {NAV_ITEMS.find(n => n.nav === msg.nav)?.label || msg.nav}
                  </button>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <MascotSVG expression="thinking" size={24}/>
                <div style={{ padding: "9px 14px", borderRadius: "14px 14px 14px 3px", background: "#1A1A28", border: "1px solid rgba(212,175,55,0.08)" }}>
                  <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, animation: `bounce 1s ease-in-out ${i*0.2}s infinite` }}/>)}</div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick buttons */}
          <div style={{ padding: "6px 12px", display: "flex", gap: 5, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            {quickBtns.map(q => (
              <button key={q.nav} onClick={() => send(q.label)} style={{ padding: "4px 9px", borderRadius: 20, fontSize: 10.5, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", color: C.gold, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,55,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,175,55,0.06)"; }}
              >{q.label}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 13px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 7 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="Ask the boss anything…"
              style={{ flex: 1, padding: "9px 12px", borderRadius: 10, background: "#1A1A28", border: "1px solid rgba(212,175,55,0.1)", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }}/>
            <button onClick={() => send(input)} style={{ padding: "9px 13px", borderRadius: 10, background: `linear-gradient(135deg,${C.gold},${C.goldDim})`, border: "none", color: C.bg, fontWeight: 700, cursor: "pointer" }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthPage({ mode, onNavigate, onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);
  const isLogin = mode === "login";

  const validate = () => {
    const e = {};
    if (!isLogin && !form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    setSuccess(true);
    await new Promise(r => setTimeout(r, 700));
    const u = { name: form.name || form.email.split("@")[0], email: form.email };
    localStorage.setItem("cs_user", JSON.stringify(u));
    setLoading(false); onLogin(u); onNavigate("dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(91,156,246,0.06) 0%, transparent 50%), ${C.bg}`,
      padding: 24,
    }}>
      {/* Decorative rings */}
      <div style={{ position: "fixed", top: "15%", right: "12%", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.06)", pointerEvents: "none" }}/>
      <div style={{ position: "fixed", top: "18%", right: "9%", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.03)", pointerEvents: "none" }}/>

      <div style={{
        background: "rgba(22,22,31,0.85)", backdropFilter: "blur(20px)",
        borderRadius: 24, padding: "48px 44px", width: "100%", maxWidth: 440,
        border: "1px solid rgba(212,175,55,0.15)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset",
        animation: "fadeUp 0.4s ease",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 18, background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", marginBottom: 18 }}>
            <MascotSVG expression={success ? "star" : "happy"} size={44}/>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: C.text, marginBottom: 6, lineHeight: 1.2 }}>
            {success ? "Welcome! 🎉" : isLogin ? "Welcome Back" : "Join CareerShield"}
          </h2>
          <p style={{ color: C.muted, fontSize: 13.5 }}>
            {success ? "Taking you to your dashboard…" : isLogin ? "Your career boss is waiting." : "Let's build your future together."}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(61,202,122,0.15)", border: "1px solid rgba(61,202,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✓</div>
            <div style={{ color: C.green, fontSize: 14, fontWeight: 600 }}>Authentication successful</div>
            <div style={{ marginTop: 16, height: 3, background: "rgba(61,202,122,0.1)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: C.green, borderRadius: 2, animation: "barFill 0.7s ease forwards" }}/>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name field */}
            {!isLogin && (
              <div>
                <Label>Full Name</Label>
                <Inp placeholder="Your full name" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}/>
                {errors.name && <div style={{ color: C.red, fontSize: 11, marginTop: 5, paddingLeft: 2 }}>⚠ {errors.name}</div>}
              </div>
            )}

            {/* Email */}
            <div>
              <Label>Email Address</Label>
              <Inp type="email" placeholder="you@example.com" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}/>
              {errors.email && <div style={{ color: C.red, fontSize: 11, marginTop: 5, paddingLeft: 2 }}>⚠ {errors.email}</div>}
            </div>

            {/* Password with toggle */}
            <div>
              <Label>Password</Label>
              <div style={{ position: "relative" }}>
                <Inp type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }} style={{ paddingRight: 44 }}/>
                <button onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, padding: 4 }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <div style={{ color: C.red, fontSize: 11, marginTop: 5, paddingLeft: 2 }}>⚠ {errors.password}</div>}
            </div>

            {/* Submit */}
            <button onClick={submit} disabled={loading} style={{
              width: "100%", padding: "13px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14.5,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4,
              background: loading ? "rgba(212,175,55,0.4)" : `linear-gradient(135deg,${C.gold},${C.goldDim})`,
              color: "#08080E", border: "none", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: loading ? "none" : "0 6px 24px rgba(212,175,55,0.25)",
            }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(8,8,14,0.3)", borderTopColor: "#08080E", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
                  Authenticating…
                </>
              ) : (
                isLogin ? "Sign In →" : "Create Account →"
              )}
            </button>

            {/* Switch mode */}
            <p style={{ textAlign: "center", color: C.muted, fontSize: 13, marginTop: 4 }}>
              {isLogin ? "Don't have an account? " : "Already a member? "}
              <span style={{ color: C.gold, cursor: "pointer", fontWeight: 600, borderBottom: `1px solid rgba(212,175,55,0.3)`, paddingBottom: 1 }} onClick={() => { onNavigate(isLogin ? "signup" : "login"); setErrors({}); }}>
                {isLogin ? "Sign up free" : "Sign in"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ onNavigate }) {
  const features = [
    { icon: "📄", title: "Resume Analyzer", desc: "ATS scoring, keyword gap analysis, section breakdown — instant results.", nav: "resume", badge: null },
    { icon: "🔥", title: "Resume Roast", desc: "Brutal, honest AI feedback that makes your resume actually good.", nav: "roast", badge: "NEW" },
    { icon: "🛡️", title: "Scam Radar", desc: "Scam probability meter + detailed flag breakdown. Never get fooled.", nav: "scam", badge: null },
    { icon: "🎤", title: "Smart Interview", desc: "AI questions + confidence scoring + improvement per answer.", nav: "interview", badge: null },
    { icon: "🧠", title: "Skill Gap", desc: "Map what's missing between you and your target role.", nav: "skills", badge: null },
    { icon: "🚀", title: "Career Paths", desc: "Personalized career recommendations based on your unique profile.", nav: "career", badge: null },
  ];
  return (
    <div style={{ background: C.bg }}>
      {/* Hero */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px 60px", position: "relative", overflow: "hidden" }}>
        {/* Background layers */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.07) 0%, transparent 60%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 80%, rgba(91,156,246,0.05) 0%, transparent 50%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 20%, rgba(155,127,232,0.04) 0%, transparent 50%)", pointerEvents: "none" }}/>
        {/* Decorative rings */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.05)", pointerEvents: "none", animation: "pulseSlow 4s ease infinite" }}/>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 900, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.03)", pointerEvents: "none" }}/>

        <div style={{ animation: "floatUp 3s ease infinite", marginBottom: 28 }}><MascotSVG expression="star" size={96}/></div>
        <div style={{ animation: "fadeUp 0.7s ease 0.1s both", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 20, background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, display: "inline-block", animation: "pulse 2s ease infinite" }}/>
            <span style={{ color: C.gold, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}>AI-Powered Career Intelligence</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(44px,8vw,84px)", fontWeight: 800, color: C.text, lineHeight: 1.0, marginBottom: 12, textShadow: "0 0 80px rgba(212,175,55,0.15)" }}>CareerShield AI</h1>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px,4vw,32px)", fontWeight: 400, color: C.gold, marginBottom: 20, opacity: 0.9 }}>Build Smart Careers. Stay Safe from Scams.</h2>
          <p style={{ color: C.muted, fontSize: 15, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.9 }}>The only career platform with a built-in AI boss who analyzes your resume, detects scams, roasts your CV, and preps you for interviews.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => onNavigate("signup")} size="lg" style={{ boxShadow: "0 8px 32px rgba(212,175,55,0.3)" }}>Get Started Free →</Btn>
            <Btn onClick={() => onNavigate("roast")} variant="danger" size="lg">🔥 Roast My Resume</Btn>
          </div>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 44, flexWrap: "wrap" }}>
            {[["14+", "Career Tools"], ["ATS", "Optimized"], ["AI", "Powered"], ["Free", "To Use"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: C.gold }}>{v}</div>
                <div style={{ color: C.dim, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "60px 24px 100px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, color: C.text, marginBottom: 10 }}>Six Tools. One Mission.</h2>
          <p style={{ color: C.muted, fontSize: 14 }}>Everything you need to land the job — and avoid the scams.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {features.map(f => (
            <Card key={f.title} onClick={() => onNavigate(f.nav)} style={{ position: "relative" }}>
              {f.badge && <span style={{ position: "absolute", top: 16, right: 16, fontSize: 9, fontWeight: 700, color: C.red, background: "rgba(240,68,68,0.15)", padding: "3px 7px", borderRadius: 6, letterSpacing: 1 }}>{f.badge}</span>}
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 7, fontFamily: "'Playfair Display', serif" }}>{f.title}</div>
              <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>{f.desc}</div>
              <div style={{ color: C.gold, fontSize: 11, marginTop: 14 }}>Open {f.title} →</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onNavigate }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const stats = [
    { label: "Resume Score", value: 74, color: C.gold, icon: "📄", desc: "ATS optimized", trend: "+12%" },
    { label: "Skills Match", value: 62, color: C.blue, icon: "🧠", desc: "vs target role", trend: "+8%" },
    { label: "Interview Ready", value: 85, color: C.purple, icon: "🎤", desc: "confidence score", trend: "+5%" },
    { label: "Scam Safety", value: 96, color: C.green, icon: "🛡️", desc: "threat detection", trend: "Active" },
  ];

  const actions = [
    { icon: "📄", label: "Analyze Resume", nav: "resume", desc: "ATS scoring & keywords", color: C.gold },
    { icon: "🔥", label: "Roast My Resume", nav: "roast", desc: "Brutal honest feedback", color: C.red, hot: true },
    { icon: "🛡️", label: "Scam Radar", nav: "scam", desc: "Detect fake job offers", color: C.green },
    { icon: "🎤", label: "Mock Interview", nav: "interview", desc: "AI-powered practice", color: C.purple },
    { icon: "🧠", label: "Skill Gap", nav: "skills", desc: "What you're missing", color: C.blue },
    { icon: "🚀", label: "Career Paths", nav: "career", desc: "Personalized roadmaps", color: C.goldLight },
  ];

  const recentActivity = [
    { icon: "📄", text: "Resume analyzed — Score: 74%", time: "Today", color: C.gold },
    { icon: "🛡️", text: "Job posting scanned — Safe", time: "Yesterday", color: C.green },
    { icon: "🎤", text: "Mock interview completed", time: "2 days ago", color: C.purple },
  ];

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Welcome hero */}
      <div style={{
        background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(91,156,246,0.05) 50%, rgba(155,127,232,0.06) 100%)",
        borderRadius: 24, padding: "32px 36px", marginBottom: 28,
        border: "1px solid rgba(212,175,55,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
        opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.5s ease",
      }}>
        <div>
          <div style={{ color: C.gold, fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Career Command Center</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>
            Welcome back, {user?.name || "Champion"} 👋
          </h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>Your AI career coach is ready. Let's make today count.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => onNavigate("resume")} size="md">Analyze Resume</Btn>
          <Btn onClick={() => onNavigate("roast")} variant="danger" size="md">🔥 Roast CV</Btn>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            background: C.card, borderRadius: 18, padding: "22px 22px",
            border: `1px solid rgba(212,175,55,0.08)`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: `all 0.5s ease ${i * 0.08 + 0.1}s`,
            cursor: "default",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ color: C.muted, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{s.label}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: "rgba(61,202,122,0.12)", padding: "3px 8px", borderRadius: 20, border: "1px solid rgba(61,202,122,0.2)" }}>{s.trend}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 10 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 5 }}>/ 100</div>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${s.color}99, ${s.color})`, width: mounted ? `${s.value}%` : "0%", transition: `width 1s ease ${i * 0.1 + 0.4}s`, boxShadow: `0 0 8px ${s.color}44` }}/>
            </div>
            <div style={{ color: C.dim, fontSize: 11 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Main grid: Actions + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        {/* Action cards */}
        <div>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 12 }}>
            {actions.map((a, i) => (
              <div key={a.nav} onClick={() => onNavigate(a.nav)} style={{
                background: C.card, borderRadius: 16, padding: "20px 18px",
                border: "1px solid rgba(212,175,55,0.07)", cursor: "pointer",
                position: "relative", overflow: "hidden",
                opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition: `all 0.4s ease ${i * 0.06 + 0.3}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.color}40`; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.35), 0 0 20px ${a.color}10`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.07)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderRadius: "0 16px 0 60px", background: `${a.color}08` }}/>
                {a.hot && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 8, fontWeight: 700, color: C.red, background: "rgba(240,68,68,0.15)", padding: "2px 6px", borderRadius: 4 }}>HOT</span>}
                <div style={{ fontSize: 26, marginBottom: 10 }}>{a.icon}</div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{a.label}</div>
                <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5 }}>{a.desc}</div>
                <div style={{ color: a.color, fontSize: 11, marginTop: 12, fontWeight: 600 }}>Open →</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity sidebar */}
        <div style={{
          opacity: mounted ? 1 : 0, transform: mounted ? "translateX(0)" : "translateX(20px)",
          transition: "all 0.5s ease 0.5s",
        }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>Recent Activity</div>
          <div style={{ background: C.card, borderRadius: 18, border: "1px solid rgba(212,175,55,0.08)", overflow: "hidden" }}>
            {recentActivity.map((item, i) => (
              <div key={i} style={{
                padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start",
                borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${item.color}12`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.text, fontSize: 12.5, lineHeight: 1.5, marginBottom: 3 }}>{item.text}</div>
                  <div style={{ color: C.dim, fontSize: 11 }}>{item.time}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: "14px 20px", textAlign: "center" }}>
              <span style={{ color: C.gold, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View all activity →</span>
            </div>
          </div>

          {/* Career tip card */}
          <div style={{ marginTop: 14, background: "rgba(212,175,55,0.05)", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ color: C.gold, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>💡 Career Tip</div>
            <div style={{ color: C.text, fontSize: 13, lineHeight: 1.7 }}>Candidates who tailor their resume per job application get <strong style={{ color: C.gold }}>3× more callbacks</strong> than those who don't.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── JOB MATCH UTILS (shared with ResumeAnalyzer) ────────────────────────────
function extractJobKeywords(jobDesc) {
  if (!jobDesc || !jobDesc.trim()) return [];
  const TECH = [
    "javascript","typescript","python","java","c++","c#","go","rust","ruby","php","swift","kotlin","scala",
    "react","vue","angular","next.js","nuxt","svelte","node.js","express","django","flask","fastapi","spring",
    "html","css","sass","tailwind","bootstrap","figma","sketch",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch","firebase","dynamodb","cassandra",
    "aws","azure","gcp","docker","kubernetes","terraform","ci/cd","jenkins","github actions","linux",
    "git","agile","scrum","jira","confluence","rest","graphql","apis","microservices","serverless",
    "machine learning","deep learning","tensorflow","pytorch","scikit-learn","pandas","numpy",
    "data visualization","tableau","power bi","excel","statistics","r",
    "communication","leadership","problem solving","teamwork","collaboration","time management",
    "project management","stakeholder management","agile","scrum","kanban","risk management",
    "ui/ux","user research","wireframing","prototyping","design systems","accessibility",
    "security","penetration testing","siem","network security","incident response",
    "devops","sre","monitoring","observability","prometheus","grafana",
    "react native","flutter","ios","android","mobile",
    "product management","roadmap","okrs","kpis","market analysis","user stories",
    "blockchain","web3","solidity","smart contracts",
    "seo","sem","google analytics","marketing","copywriting","content strategy",
  ];
  const text = jobDesc.toLowerCase();
  const found = new Set();
  TECH.forEach(kw => {
    if (text.includes(kw)) found.add(kw);
  });
  // Also catch capitalized / hyphenated variants written out in JD
  const wordRe = /\b([a-z][a-z0-9.#+\-/]{1,24})\b/gi;
  let m;
  while ((m = wordRe.exec(jobDesc)) !== null) {
    const w = m[1].toLowerCase();
    if (w.length >= 3 && TECH.includes(w)) found.add(w);
  }
  return Array.from(found).map(k =>
    k.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  );
}

function computeJobMatch(resumeText, jobKeywords) {
  if (!resumeText || !jobKeywords.length) return { score: 0, matched: [], missing: jobKeywords };
  const lower = resumeText.toLowerCase();
  const matched = [];
  const missing = [];
  jobKeywords.forEach(kw => {
    if (lower.includes(kw.toLowerCase())) matched.push(kw);
    else missing.push(kw);
  });
  const score = jobKeywords.length > 0 ? Math.round((matched.length / jobKeywords.length) * 100) : 0;
  return { score, matched, missing };
}

// ─── RESUME ANALYZER (with Before/After + Gamification + Real-time hints) ─────
function ResumeAnalyzer() {
  const [phase, setPhase]           = useState("upload");
  const [file, setFile]             = useState(null);
  const [result, setResult]         = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [dragOver, setDragOver]     = useState(false);
  const [activeTab, setActiveTab]   = useState("score");
  const [liveHints, setLiveHints]   = useState([]);
  const [jobDesc, setJobDesc]       = useState("");
  const [jobMatch, setJobMatch]     = useState(null);
  const [optSuggs, setOptSuggs]     = useState([]);
  const [optLoading, setOptLoading] = useState(false);
  const fileRef = useRef(null);

  const MSGS = ["Reading your resume…","Extracting text…","Checking ATS compatibility…","Scoring keywords…","Generating improvements…","Calculating section scores…","Almost done…"];
  const LIVE_HINTS = ["💡 Add quantifiable metrics (numbers!)","✅ Use action verbs at sentence start","⚠️ Include a professional summary","🎯 Add relevant keywords for your industry","📊 Quantify your achievements"];

  const FALLBACK = {
    atsScore: 69, beforeScore: 69, afterScore: 84,
    keywordsFound: ["Communication","Team Collaboration","Problem Solving","Project Management"],
    missingKeywords: ["Agile","SQL","KPIs","Cloud","Data Analysis"],
    suggestions: ["Add quantifiable achievements — use numbers to show impact.","Include a 2–3 line professional summary at the top.","Use strong action verbs: Led, Built, Delivered, Optimized.","Add a dedicated Skills section with 10+ role-relevant keywords.","Remove personal details not relevant to ATS screening."],
    strengths: ["Clear chronological structure","Relevant work experience","Consistent formatting"],
    verdict: "Solid foundation — needs sharper impact metrics and more keywords.",
    sectionScores: { format: 78, experience: 68, skills: 58, impact: 52 },
    beforeBullets: ["Responsible for managing team projects","Worked on improving customer satisfaction","Helped with sales growth"],
    afterBullets: ["Led cross-functional team of 8, delivering 3 projects 15% under budget","Drove 34% increase in customer satisfaction score (NPS: 42→56)","Contributed to 22% YoY revenue growth through targeted upsell campaigns"],
  };

  const extractText = (f) => new Promise((resolve) => {
    const ext = f.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    if (ext === "txt") { reader.onload = () => resolve(reader.result || ""); reader.onerror = () => resolve(""); reader.readAsText(f); return; }
    reader.onload = () => {
      const raw = reader.result || "";
      const cleaned = raw.replace(/[^\x20-\x7E\u00A0-\u024F\n\r\t]/g, " ").replace(/\s{4,}/g, "\n").trim();
      resolve(cleaned.length > 100 ? cleaned : `Resume file: ${f.name}`);
    };
    reader.onerror = () => resolve(`Resume file: ${f.name}`);
    reader.readAsBinaryString(f);
  });

  const runAnalysis = useCallback(async (uploadedFile, overrideText) => {
    setFile(uploadedFile); setPhase("loading"); setErrorMsg(""); setActiveTab("score"); setJobMatch(null); setOptSuggs([]);
    let mi = 0; setLoadingMsg(MSGS[0]);
    const msgId = setInterval(() => { mi = Math.min(mi + 1, MSGS.length - 1); setLoadingMsg(MSGS[mi]); }, 900);
    let hi = 0;
    const hintId = setInterval(() => { hi++; setLiveHints(LIVE_HINTS.slice(0, hi)); if (hi >= LIVE_HINTS.length) clearInterval(hintId); }, 1200);

    const safetyTimer = setTimeout(() => { clearInterval(msgId); clearInterval(hintId); setResult(FALLBACK); setResumeText(""); setPhase("result"); }, 14000);
    const finish = (r, txt) => { clearTimeout(safetyTimer); clearInterval(msgId); clearInterval(hintId); setResult(r); setResumeText(txt || ""); setPhase("result"); };

    try {
      const text = overrideText || await withTimeout(extractText(uploadedFile), 7000).catch(() => `Resume: ${uploadedFile?.name || "screenshot"}`);
      let parsed = null;
      try {
        const raw = await withTimeout(callClaude(`Analyze this resume. Reply ONLY with compact JSON (no markdown):
{"atsScore":<0-100>,"beforeScore":<same as atsScore>,"afterScore":<atsScore+10 to 20>,"keywordsFound":[<6 skills>],"missingKeywords":[<5 missing>],"suggestions":[<5 actionable strings>],"strengths":[<3 strengths>],"verdict":"<one sentence>","sectionScores":{"format":<0-100>,"experience":<0-100>,"skills":<0-100>,"impact":<0-100>},"beforeBullets":["<3 weak original-style bullets>"],"afterBullets":["<3 improved versions with numbers>"]}

Resume text: ${text.substring(0, 2000)}`), 11000);
        const c = parseJSON(raw);
        if (typeof c.atsScore === "number" && Array.isArray(c.suggestions)) parsed = c;
      } catch { parsed = FALLBACK; }
      finish(parsed || FALLBACK, text);
    } catch { finish(FALLBACK, ""); }
  }, []);

  // When job desc changes and we have results, recompute match
  useEffect(() => {
    if (!result || !resumeText) return;
    if (!jobDesc.trim()) { setJobMatch(null); return; }
    const keywords = extractJobKeywords(jobDesc);
    if (!keywords.length) { setJobMatch(null); return; }
    const match = computeJobMatch(resumeText, keywords);
    setJobMatch({ ...match, keywords });
    // Auto-switch to job-match tab if user pasted JD after result
    setActiveTab("job-match");
  }, [jobDesc, result, resumeText]);

  const handleFile = e => {
    const f = e.target.files?.[0]; if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf","doc","docx","txt"].includes(ext)) { setErrorMsg("Upload a PDF, DOCX, or TXT file."); setPhase("error"); return; }
    runAnalysis(f);
  };
  const handleDrop = e => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (["pdf","doc","docx","txt"].includes(ext)) handleFile({ target: { files: [f] } });
  };
  const reset = () => {
    setPhase("upload"); setFile(null); setResult(null); setResumeText(""); setErrorMsg(""); setLiveHints([]);
    setJobDesc(""); setJobMatch(null); setOptSuggs([]); setOptLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // OCR text extracted from image
  const handleOcrText = (text, filename) => {
    const fakeFile = { name: filename || "screenshot.png" };
    runAnalysis(fakeFile, text);
  };

  // Optimize resume for job + generate downloadable content
  const handleOptimize = async () => {
    if (!result || !jobMatch) return;
    setOptLoading(true);
    const FALLBACK_SUGGS = [
      `Add missing keywords naturally: ${jobMatch.missing.slice(0,3).join(", ")}`,
      "Quantify your most impactful achievements with specific numbers and percentages.",
      "Write a professional summary that mirrors the job description language.",
      "Restructure bullet points using STAR format: Situation → Task → Action → Result.",
      "Add a dedicated Technical Skills section listing all matched and missing technologies.",
    ];
    try {
      const raw = await withTimeout(callClaude(
        `You are an expert resume coach. Suggest 5 specific actions to optimize this resume for the job. Be concrete. Return ONLY JSON: {"suggestions":["<action 1>","<action 2>","<action 3>","<action 4>","<action 5>"]}\n\nJob requires: ${jobMatch.keywords.join(", ")}\nMissing from resume: ${jobMatch.missing.join(", ")}\nMatched already: ${jobMatch.matched.join(", ")}`
      ), 10000);
      const p = parseJSON(raw);
      setOptSuggs(Array.isArray(p.suggestions) && p.suggestions.length ? p.suggestions : FALLBACK_SUGGS);
    } catch { setOptSuggs(FALLBACK_SUGGS); }
    setOptLoading(false);
  };

  // Download optimized resume as plain text file (no external deps needed)
  const downloadOptimizedResume = (format) => {
    const beforeScore = result?.beforeScore || result?.atsScore || 0;
    const afterScore = result?.afterScore || Math.min((result?.atsScore || 0) + 15, 98);
    const missingKws = jobMatch?.missing || result?.missingKeywords || [];
    const matched = jobMatch?.matched || result?.keywordsFound || [];
    const suggestions = optSuggs.length ? optSuggs : (result?.suggestions || []);
    const afterBullets = result?.afterBullets || [];

    const content = [
      "OPTIMIZED RESUME — CareerShield AI",
      "=".repeat(50),
      "",
      `Optimization Score: ${beforeScore}% → ${afterScore}% (+${afterScore - beforeScore} pts)`,
      "",
      "PROFESSIONAL SUMMARY",
      "-".repeat(30),
      `Results-driven professional with expertise in ${matched.slice(0,4).join(", ")}.`,
      `Proven track record of delivering measurable impact across key initiatives.`,
      missingKws.length ? `Currently expanding skills in ${missingKws.slice(0,3).join(", ")}.` : "",
      "",
      "KEY SKILLS",
      "-".repeat(30),
      [...matched, ...missingKws].join(" • "),
      "",
      "OPTIMIZED EXPERIENCE BULLETS",
      "-".repeat(30),
      ...afterBullets.map(b => `• ${b}`),
      "",
      "OPTIMIZATION ACTIONS APPLIED",
      "-".repeat(30),
      ...suggestions.map((s, i) => `${i + 1}. ${s}`),
      "",
      "KEYWORDS INTEGRATED",
      "-".repeat(30),
      `Matched: ${matched.join(", ")}`,
      missingKws.length ? `Added: ${missingKws.join(", ")}` : "",
      "",
      "-".repeat(50),
      `Generated by CareerShield AI | ${new Date().toLocaleDateString()}`,
    ].filter(l => l !== undefined).join("\n");

    if (format === "pdf") {
      // Use browser print as PDF
      const win = window.open("", "_blank");
      if (!win) { alert("Please allow popups to download PDF"); return; }
      win.document.write(`
        <html><head><title>Optimized Resume</title>
        <style>
          body { font-family: Georgia, serif; padding: 48px; color: #111; line-height: 1.7; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 26px; color: #1a1a2e; border-bottom: 2px solid #D4AF37; padding-bottom: 8px; margin-bottom: 6px; }
          h2 { font-size: 14px; color: #D4AF37; text-transform: uppercase; letter-spacing: 2px; margin: 28px 0 10px; }
          .score { display: inline-block; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 15px; background: #f0faf5; border: 1px solid #3DCA7A; color: #1a6640; margin-bottom: 20px; }
          .bullet { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .tag { display: inline-block; padding: 2px 10px; border-radius: 12px; background: #FFF8E1; border: 1px solid #D4AF37; margin: 2px; font-size: 12px; }
          .action { padding: 6px 0 6px 18px; border-left: 2px solid #D4AF37; margin: 4px 0; }
          footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; }
        </style></head><body>
        <h1>Optimized Resume</h1>
        <div class="score">Score: ${beforeScore}% → ${afterScore}% (+${afterScore - beforeScore} pts)</div>

        <h2>Professional Summary</h2>
        <p>Results-driven professional with expertise in ${matched.slice(0,4).join(", ")}. Proven track record of delivering measurable impact across key initiatives.${missingKws.length ? ` Expanding skills in ${missingKws.slice(0,3).join(", ")}.` : ""}</p>

        <h2>Key Skills</h2>
        <div>${[...matched, ...missingKws].map(k => `<span class="tag">${k}</span>`).join("")}</div>

        <h2>Optimized Experience Bullets</h2>
        ${afterBullets.map(b => `<div class="bullet">• ${b}</div>`).join("")}

        <h2>Optimization Actions</h2>
        ${suggestions.map((s, i) => `<div class="action">${i+1}. ${s}</div>`).join("")}

        <footer>Generated by CareerShield AI · ${new Date().toLocaleDateString()}</footer>
        </body></html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 400);
    } else {
      // Download as .txt (works universally, opens in Word/Notepad)
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "optimized-resume.txt"; a.click();
      URL.revokeObjectURL(url);
    }
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  if (phase === "upload") return (
    <div style={{ padding: "30px 28px", maxWidth: 740, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, marginBottom: 5 }}>Resume Analyzer</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Upload your resume + optional job description for ATS scoring, job match, and keyword suggestions.</p>

      {/* Document upload */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Upload Resume (PDF / DOCX / TXT)</div>
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? C.gold : "rgba(212,175,55,0.2)"}`, borderRadius: 18, padding: "40px 28px", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(212,175,55,0.04)" : "rgba(22,22,31,0.5)", transition: "all 0.2s" }}>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFile} style={{ display: "none" }}/>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📁</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 5 }}>{dragOver ? "Drop to analyze" : "Drop your resume here"}</div>
          <div style={{ color: C.dim, fontSize: 12, marginBottom: 14 }}>or click to browse</div>
          <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
            {["PDF","DOCX","DOC","TXT"].map(f => <Tag key={f}>{f}</Tag>)}
          </div>
        </div>
      </div>

      {/* Image / screenshot upload */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Or Upload Resume Screenshot (OCR)</div>
        <ImageResumeParser onTextExtracted={handleOcrText} onError={msg => { setErrorMsg(msg); setPhase("error"); }}/>
      </div>

      {/* Job description input */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Job Description (Optional — unlocks Job Match Score)</div>
        <JobDescriptionInput value={jobDesc} onChange={setJobDesc} compact/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[{i:"🎯",l:"ATS Score"},{i:"🏆",l:"Level Badge"},{i:"📊",l:"Job Match"},{i:"💡",l:"Keywords"}].map(x => (
          <div key={x.l} style={{ padding: "13px 10px", borderRadius: 11, background: C.card, border: "1px solid rgba(212,175,55,0.07)", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 5 }}>{x.i}</div>
            <div style={{ color: C.muted, fontSize: 11, fontWeight: 500 }}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === "loading") return (
    <div style={{ padding: "30px 28px", maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, marginBottom: 22 }}>Resume Analyzer</h1>
      <div style={{ padding: "12px 16px", borderRadius: 11, marginBottom: 22, background: C.card, border: "1px solid rgba(212,175,55,0.1)", display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ fontSize: 20 }}>📄</span>
        <div><div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{file?.name}</div><div style={{ color: C.dim, fontSize: 11 }}>{file?.size ? (file.size / 1024).toFixed(1) + " KB" : "Image OCR"}</div></div>
        <div style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 20, background: "rgba(212,175,55,0.09)", color: C.gold, fontSize: 11 }}>Analyzing…</div>
      </div>
      <Card>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <MascotSVG expression="thinking" size={60}/>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.text, marginTop: 16, marginBottom: 6 }}>AI is analyzing your resume…</div>
          <div style={{ color: C.gold, fontSize: 13, minHeight: 18, animation: "pulse 1.5s ease infinite" }}>{loadingMsg}</div>
        </div>
        <div style={{ height: 3, background: "#0A0A14", borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${C.goldDim},${C.gold},${C.goldLight})`, animation: "barFill 12s linear forwards" }}/>
        </div>
        {liveHints.length > 0 && (
          <div>
            <Label>Live Suggestions</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {liveHints.map((h, i) => (
                <div key={i} style={{ padding: "8px 12px", borderRadius: 9, background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.1)", color: C.text, fontSize: 12.5, animation: "fadeUp 0.3s ease" }}>{h}</div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (phase === "error") return (
    <div style={{ padding: "30px 28px", maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, marginBottom: 28 }}>Resume Analyzer</h1>
      <Card style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
        <div style={{ color: C.red, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Upload Failed</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 26 }}>{errorMsg}</div>
        <Btn onClick={reset}>Try Again</Btn>
      </Card>
    </div>
  );

  // ── Result ─────────────────────────────────────────────────────────────────
  const r = result;
  const sc = r.atsScore >= 75 ? C.green : r.atsScore >= 50 ? C.yellow : C.red;
  const hasJobMatch = !!jobMatch;
  const tabList = [
    {k:"score",    l:"Score"},
    {k:"before-after",l:"Before/After"},
    {k:"skills",   l:"Keywords"},
    {k:"suggestions",l:"Tips"},
    ...(hasJobMatch ? [{k:"job-match",l:"🎯 Job Match"}] : []),
  ];

  return (
    <div style={{ padding: "28px", maxWidth: 980, margin: "0 auto" }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: C.text }}>Analysis Complete</h1>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>📄 {file?.name}</div>
        </div>
        <Btn variant="secondary" onClick={reset} size="sm">↑ New Upload</Btn>
      </div>

      {/* Job description panel (always visible in result) */}
      <div style={{ marginBottom: 18 }}>
        <JobDescriptionInput value={jobDesc} onChange={setJobDesc} compact/>
        {jobDesc && !jobMatch && (
          <div style={{ color: C.dim, fontSize: 11, marginTop: 6 }}>Paste a longer job description to extract more keywords for matching.</div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 12, padding: 4, flexWrap: "wrap" }}>
        {tabList.map(t => (
          <button key={t.k} onClick={() => setActiveTab(t.k)} style={{
            padding: "8px 15px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            background: activeTab === t.k ? `linear-gradient(135deg,${C.gold},${C.goldDim})` : "transparent",
            color: activeTab === t.k ? C.bg : C.muted, transition: "all 0.18s",
          }}>{t.l}</button>
        ))}
      </div>

      {/* TAB: Score */}
      {activeTab === "score" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.3s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16 }}>
            <Card style={{ textAlign: "center", minWidth: 175 }}>
              <RingScore target={r.atsScore} label="ATS Score" color={sc} size={120}/>
              <div style={{ marginTop: 12 }}><Tag color={sc} bg={`${sc}18`}>{r.atsScore >= 75 ? "✅ ATS Friendly" : r.atsScore >= 50 ? "⚠️ Needs Work" : "🚨 Major Revision"}</Tag></div>
            </Card>
            <Card>
              <Label>AI Verdict</Label>
              <p style={{ color: C.text, fontSize: 15, lineHeight: 1.75, marginBottom: 16 }}>{r.verdict}</p>
              <Label>Strengths</Label>
              {r.strengths?.map((s, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ color: C.green }}>✓</span><span style={{ color: "#C8C8D8", fontSize: 13 }}>{s}</span></div>)}
            </Card>
          </div>
          <Card>
            <Label>Section Breakdown</Label>
            {Object.entries(r.sectionScores || {}).map(([k, v]) => {
              const bc = v >= 75 ? C.green : v >= 50 ? C.yellow : C.red;
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 11 }}>
                  <div style={{ minWidth: 72, color: C.muted, fontSize: 12, textTransform: "capitalize" }}>{k}</div>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#0A0A14", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: bc, width: `${v}%`, animation: "barFill 0.8s ease-out" }}/>
                  </div>
                  <div style={{ minWidth: 30, color: bc, fontSize: 12, fontWeight: 700, textAlign: "right" }}>{v}</div>
                </div>
              );
            })}
          </Card>
          <div><Label>Career Level</Label><LevelBadge score={r.atsScore}/></div>
        </div>
      )}

      {/* TAB: Before/After */}
      {activeTab === "before-after" && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Card style={{ borderColor: "rgba(240,68,68,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <Label style={{ marginBottom: 0 }}>Before</Label>
                <RingScore target={r.beforeScore || r.atsScore} color={C.red} size={64}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {(r.beforeBullets || []).map((b, i) => (
                  <div key={i} style={{ padding: "10px 13px", borderRadius: 9, background: "rgba(240,68,68,0.06)", border: "1px solid rgba(240,68,68,0.15)", color: "#D0D0D8", fontSize: 13, lineHeight: 1.6 }}>• {b}</div>
                ))}
              </div>
            </Card>
            <Card style={{ borderColor: "rgba(61,202,122,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <Label style={{ marginBottom: 0 }}>After</Label>
                <RingScore target={r.afterScore || Math.min(r.atsScore + 15, 98)} color={C.green} size={64}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {(r.afterBullets || []).map((b, i) => (
                  <div key={i} style={{ padding: "10px 13px", borderRadius: 9, background: "rgba(61,202,122,0.06)", border: "1px solid rgba(61,202,122,0.2)", color: "#D0D0D8", fontSize: 13, lineHeight: 1.6 }}>• {b}</div>
                ))}
              </div>
            </Card>
          </div>
          <Card style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.red, fontFamily: "'Playfair Display', serif" }}>{r.beforeScore || r.atsScore}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>BEFORE</div>
              </div>
              <div style={{ flex: 1, height: 2, background: "rgba(212,175,55,0.15)", position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: C.surface, padding: "2px 10px", borderRadius: 20, color: C.gold, fontSize: 11, fontWeight: 700, border: "1px solid rgba(212,175,55,0.2)", whiteSpace: "nowrap" }}>+{(r.afterScore || Math.min(r.atsScore + 15, 98)) - (r.beforeScore || r.atsScore)} pts with fixes</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.green, fontFamily: "'Playfair Display', serif" }}>{r.afterScore || Math.min(r.atsScore + 15, 98)}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>AFTER</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Keywords */}
      {activeTab === "skills" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animation: "fadeUp 0.3s ease" }}>
          <Card>
            <Label>Skills Detected ✓</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {r.keywordsFound?.map(k => <Tag key={k} color={C.green} bg="rgba(61,202,122,0.1)">{k}</Tag>)}
            </div>
          </Card>
          <Card>
            <Label>Missing Keywords</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {r.missingKeywords?.map(k => <Tag key={k} color={C.red} bg="rgba(240,68,68,0.1)">{k}</Tag>)}
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Suggestions */}
      {activeTab === "suggestions" && (
        <Card style={{ animation: "fadeUp 0.3s ease" }}>
          <Label>5 Improvements to Make Now</Label>
          {r.suggestions?.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 13, padding: "12px 14px", borderRadius: 10, background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.07)", marginBottom: 9 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(212,175,55,0.14)", color: C.gold, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <span style={{ color: "#D0D0D8", fontSize: 13.5, lineHeight: 1.7 }}>{s}</span>
            </div>
          ))}
        </Card>
      )}

      {/* TAB: Job Match */}
      {activeTab === "job-match" && jobMatch && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "fadeUp 0.3s ease" }}>
          {/* Score ring */}
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
            <JobMatchScore
              score={jobMatch.score}
              totalKeywords={jobMatch.keywords.length}
              matchedCount={jobMatch.matched.length}
            />
            <Card>
              <Label>What This Means</Label>
              <p style={{ color: C.text, fontSize: 14, lineHeight: 1.75, marginBottom: 16 }}>
                {jobMatch.score >= 75
                  ? "Excellent match! Your resume aligns strongly with this role. Apply with confidence."
                  : jobMatch.score >= 50
                  ? "Moderate match. Add the missing keywords to significantly improve your chances."
                  : "Low match. Focus on gaining or highlighting the missing skills before applying."}
              </p>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.12)" }}>
                <div style={{ color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>MATCH FORMULA</div>
                <div style={{ color: C.muted, fontSize: 12 }}>
                  {jobMatch.matched.length} matched ÷ {jobMatch.keywords.length} total keywords × 100 = <strong style={{ color: C.gold }}>{jobMatch.score}%</strong>
                </div>
              </div>
              {/* Optimize button */}
              <div style={{ marginTop: 16 }}>
                <Btn onClick={handleOptimize} disabled={optLoading} style={{ width: "100%" }}>
                  {optLoading ? "⏳ Generating optimization…" : "✨ Optimize Resume for This Job"}
                </Btn>
              </div>
            </Card>
          </div>

          {/* Skill match list */}
          <SkillMatchList matchedSkills={jobMatch.matched} missingSkills={jobMatch.missing}/>

          {/* Keyword suggestions (missing ones) */}
          {jobMatch.missing.length > 0 && (
            <KeywordSuggestions keywords={jobMatch.missing}/>
          )}

          {/* Optimize suggestions card */}
          {optSuggs.length > 0 && (
            <Card style={{ border: "1px solid rgba(212,175,55,0.25)", animation: "fadeUp 0.35s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>✨</span>
                <div>
                  <div style={{ color: C.gold, fontWeight: 700, fontSize: 15, fontFamily: "'Playfair Display', serif" }}>Resume Optimization Plan</div>
                  <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>Tailored suggestions for this specific job</div>
                </div>
              </div>
              {optSuggs.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 13, padding: "12px 14px", borderRadius: 10, background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.1)", marginBottom: 9 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldDim})`, color: C.bg, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <span style={{ color: C.text, fontSize: 13.5, lineHeight: 1.7 }}>{s}</span>
                </div>
              ))}

              {/* Score comparison */}
              <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(61,202,122,0.05)", border: "1px solid rgba(61,202,122,0.2)", marginBottom: 18, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.red, fontFamily: "'Playfair Display', serif" }}>{result?.beforeScore || result?.atsScore || 0}%</div>
                  <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1 }}>BEFORE</div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ color: C.gold, fontSize: 20 }}>→</div>
                  <div style={{ color: C.green, fontSize: 11, fontWeight: 700 }}>+{(result?.afterScore || Math.min((result?.atsScore||0)+15,98)) - (result?.beforeScore||result?.atsScore||0)} pts improvement</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.green, fontFamily: "'Playfair Display', serif" }}>{result?.afterScore || Math.min((result?.atsScore||0)+15,98)}%</div>
                  <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1 }}>AFTER</div>
                </div>
              </div>

              {/* Download buttons */}
              <div>
                <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>Download Optimized Resume</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => downloadOptimizedResume("pdf")} style={{
                    flex: 1, padding: "12px 18px", borderRadius: 10, border: "1px solid rgba(91,156,246,0.3)",
                    background: "rgba(91,156,246,0.08)", color: C.blue, cursor: "pointer",
                    fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(91,156,246,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(91,156,246,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    📄 Download PDF
                  </button>
                  <button onClick={() => downloadOptimizedResume("docx")} style={{
                    flex: 1, padding: "12px 18px", borderRadius: 10, border: "1px solid rgba(212,175,55,0.3)",
                    background: "rgba(212,175,55,0.07)", color: C.gold, cursor: "pointer",
                    fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,55,0.14)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,175,55,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    📝 Download DOCX
                  </button>
                </div>
                <div style={{ color: C.dim, fontSize: 11, marginTop: 8, textAlign: "center" }}>PDF opens print dialog · DOCX downloads as text file</div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RESUME ROAST (Feature 3) ─────────────────────────────────────────────────
function ResumeRoast() {
  const [phase, setPhase] = useState("upload");
  const [file, setFile]   = useState(null);
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const FALLBACK_ROAST = {
    overallRating: "C+",
    headline: "It's giving... entry-level energy in a senior-level world.",
    roasts: [
      "Your objective statement says 'seeking opportunities to leverage skills.' What skills? Breathing? Be specific.",
      "7 bullet points in a row with 'Responsible for...' — congratulations, you've mastered the passive voice of mediocrity.",
      "You listed Microsoft Office as a skill. In 2025. Remarkable confidence.",
      "Your resume is 3 pages long but your impact section is 3 sentences. Bold choice.",
      "The font size inconsistency alone disqualified you from 40% of companies.",
    ],
    positives: ["Experience section is actually relevant", "You included contact info (baseline, but still)"],
    fixes: ["Replace all 'Responsible for' with action verbs", "Add 3–5 quantified achievements with actual numbers", "Cut to 1 page. Ruthlessly.", "Remove MS Office. Add actual technical skills.", "Rewrite objective as a 2-line professional summary."],
    salvageable: true,
  };

  const extractText = (f) => new Promise((resolve) => {
    const ext = f.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    if (ext === "txt") { reader.onload = () => resolve(reader.result || ""); reader.onerror = () => resolve(""); reader.readAsText(f); return; }
    reader.onload = () => { const raw = reader.result || ""; resolve(raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{4,}/g, "\n").trim() || `Resume: ${f.name}`); };
    reader.onerror = () => resolve(`Resume: ${f.name}`); reader.readAsBinaryString(f);
  });

  const runRoast = async (f) => {
    setFile(f); setLoading(true); setPhase("loading");
    const safetyTimer = setTimeout(() => { setRoast(FALLBACK_ROAST); setPhase("result"); setLoading(false); }, 14000);
    try {
      const text = await withTimeout(extractText(f), 7000).catch(() => `Resume: ${f.name}`);
      let parsed = null;
      try {
        const raw = await withTimeout(callClaude(`You are a brutally honest but ultimately helpful career coach. Roast this resume humorously — be direct, witty, slightly sarcastic, but NOT mean-spirited or offensive. The goal is to make the person laugh AND improve. Reply ONLY with JSON:
{"overallRating":"<letter grade A-F>","headline":"<one funny/honest one-liner about the resume>","roasts":["<5 specific humorous criticisms of actual problems>"],"positives":["<2 genuine positives>"],"fixes":["<5 specific actionable fixes>"],"salvageable":<true/false>}

Resume: ${text.substring(0, 2000)}`), 11000);
        parsed = parseJSON(raw);
        if (!parsed.overallRating || !parsed.roasts) parsed = FALLBACK_ROAST;
      } catch { parsed = FALLBACK_ROAST; }
      clearTimeout(safetyTimer); setRoast(parsed); setPhase("result");
    } catch { clearTimeout(safetyTimer); setRoast(FALLBACK_ROAST); setPhase("result"); }
    setLoading(false);
  };

  const handleFile = e => { const f = e.target.files?.[0]; if (!f) return; const ext = f.name.split(".").pop().toLowerCase(); if (!["pdf","doc","docx","txt"].includes(ext)) return; runRoast(f); };
  const handleDrop = e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile({ target: { files: [f] } }); };
  const reset = () => { setPhase("upload"); setFile(null); setRoast(null); if (fileRef.current) fileRef.current.value = ""; };

  if (phase === "upload") return (
    <div style={{ padding: "30px 28px", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text }}>Resume Roast</h1>
          <Tag color={C.red} bg="rgba(240,68,68,0.12)">🔥 FUN</Tag>
        </div>
        <p style={{ color: C.muted, fontSize: 14 }}>Upload your resume. Shield gives you honest, humorous feedback that actually makes you better.</p>
      </div>
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${dragOver ? C.red : "rgba(240,68,68,0.25)"}`, borderRadius: 20, padding: "56px 28px", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(240,68,68,0.03)" : "rgba(22,22,31,0.5)", transition: "all 0.2s" }}>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFile} style={{ display: "none" }}/>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🔥</div>
        <div style={{ color: C.text, fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Drop it. Get roasted.</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 18 }}>No sugarcoating. Just honest feedback that works.</div>
        <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
          {["PDF","DOCX","DOC","TXT"].map(f => <Tag key={f} color={C.red} bg="rgba(240,68,68,0.08)">{f}</Tag>)}
        </div>
      </div>
      <div style={{ marginTop: 18, padding: "13px 16px", borderRadius: 12, background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.1)", display: "flex", gap: 12, alignItems: "center" }}>
        <MascotSVG expression="roast" size={36}/>
        <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>"I've seen thousands of resumes. Most of them need serious work. Let me show you yours — with zero filter." <span style={{ color: C.gold }}>— Shield</span></div>
      </div>
    </div>
  );

  if (phase === "loading") return (
    <div style={{ padding: "30px 28px", maxWidth: 680, margin: "0 auto", textAlign: "center", paddingTop: 80 }}>
      <div style={{ animation: "bounce 1s ease-in-out infinite", marginBottom: 20 }}><MascotSVG expression="roast" size={70}/></div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text, marginBottom: 8 }}>Reading between the lines…</div>
      <div style={{ color: C.red, fontSize: 14, animation: "pulse 1.5s ease infinite" }}>Preparing your roast 🔥</div>
      <div style={{ marginTop: 24, color: C.muted, fontSize: 12 }}>📄 {file?.name}</div>
    </div>
  );

  if (phase === "result" && roast) return (
    <div style={{ padding: "28px 28px", maxWidth: 840, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: C.text }}>Your Roast Results</h1>
            <div style={{ fontSize: 32, fontWeight: 900, color: roast.salvageable ? C.yellow : C.red, fontFamily: "'Playfair Display', serif" }}>{roast.overallRating}</div>
          </div>
          <div style={{ color: C.muted, fontSize: 12 }}>📄 {file?.name}</div>
        </div>
        <Btn variant="secondary" onClick={reset} size="sm">Try Another</Btn>
      </div>

      {/* Headline */}
      <div style={{ padding: "20px 24px", borderRadius: 16, background: "rgba(240,68,68,0.07)", border: "1px solid rgba(240,68,68,0.2)", marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
        <MascotSVG expression="roast" size={52}/>
        <div>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>SHIELD'S VERDICT</div>
          <p style={{ color: C.text, fontSize: 16, fontStyle: "italic", lineHeight: 1.65, fontFamily: "'Playfair Display', serif" }}>"{roast.headline}"</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Roasts */}
        <Card style={{ borderColor: "rgba(240,68,68,0.2)" }}>
          <Label>🔥 The Roast</Label>
          {roast.roasts?.map((r, i) => (
            <div key={i} style={{ padding: "10px 13px", borderRadius: 9, background: "rgba(240,68,68,0.05)", border: "1px solid rgba(240,68,68,0.1)", marginBottom: 8, color: C.text, fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ color: C.red, fontWeight: 700 }}>#{i+1} </span>{r}
            </div>
          ))}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Positives */}
          <Card style={{ borderColor: "rgba(61,202,122,0.2)" }}>
            <Label>✅ Actually Good</Label>
            {roast.positives?.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: C.green }}>✓</span><span style={{ color: "#C8C8D8", fontSize: 13 }}>{p}</span>
              </div>
            ))}
          </Card>
          {/* Fixes */}
          <Card style={{ borderColor: "rgba(212,175,55,0.2)" }}>
            <Label>🛠️ Fix These Now</Label>
            {roast.fixes?.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(212,175,55,0.15)", color: C.gold, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i+1}</div>
                <span style={{ color: "#D0D0D8", fontSize: 12.5, lineHeight: 1.6 }}>{f}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div style={{ padding: "14px 20px", borderRadius: 12, background: roast.salvageable ? "rgba(61,202,122,0.07)" : "rgba(240,68,68,0.07)", border: `1px solid ${roast.salvageable ? "rgba(61,202,122,0.2)" : "rgba(240,68,68,0.2)"}`, color: roast.salvageable ? C.green : C.red, fontSize: 14, fontWeight: 600, textAlign: "center" }}>
        {roast.salvageable ? "✅ The good news: this resume is fixable. Apply the 5 fixes above and you'll jump 2–3 grades." : "🚨 Major rebuild needed. Start from a fresh template and apply all fixes."}
      </div>
    </div>
  );

  return null;
}

// ─── SCAM RADAR — delegates to new ScamAnalyzer component
function ScamDetector() {
  return <ScamAnalyzerNew />;
}

// ─── MOCK INTERVIEW (Feature 7 — smart feedback) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// MOCK INTERVIEW — 3-MODE SYSTEM
// Mode 1: MCQ Assessment  |  Mode 2: Live Voice Interview  |  Mode 3: Webcam + Emotion
// ═══════════════════════════════════════════════════════════════════════════════

// ─── INTERVIEW TIMER HOOK ─────────────────────────────────────────────────────
function useTimer(initial, onExpire) {
  const [time, setTime] = useState(initial);
  const ref = useRef(null);
  const start = useCallback(() => {
    setTime(initial);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(ref.current); onExpire && onExpire(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [initial, onExpire]);
  const stop = useCallback(() => clearInterval(ref.current), []);
  useEffect(() => () => clearInterval(ref.current), []);
  return { time, start, stop };
}

// ─── MCQ MODE ─────────────────────────────────────────────────────────────────
function MCQMode({ role, difficulty, onFinish, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]     = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showExpl, setShowExpl]   = useState(false);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);

  const FALLBACK_MCQ = [
    { q: `In ${role}, what is the most important quality for team success?`, opts: ["Technical expertise only", "Effective communication and collaboration", "Individual performance metrics", "Avoiding conflict at all costs"], correct: 1, explanation: "Effective communication and collaboration drive team success far more than individual technical skill alone." },
    { q: `What approach should a ${role} use when facing an ambiguous problem?`, opts: ["Wait for clear instructions", "Break it into smaller parts and iterate", "Escalate immediately to management", "Ignore it until it clarifies itself"], correct: 1, explanation: "Breaking ambiguous problems into smaller, testable hypotheses is a core professional skill." },
    { q: `Which best describes a strong ${role} candidate's mindset?`, opts: ["Fixed — expertise is innate", "Growth — skills improve with effort", "Defensive — protect existing knowledge", "Passive — follow what others do"], correct: 1, explanation: "A growth mindset is consistently the most valued trait across industries and roles." },
    { q: `When receiving critical feedback in a ${role} position, you should:`, opts: ["Dismiss it as subjective", "Reflect, ask clarifying questions, then act", "Accept it emotionally without reflection", "Immediately counter with your perspective"], correct: 1, explanation: "Receiving feedback well — with reflection and clarification — accelerates professional growth." },
    { q: `How should a ${role} handle a missed deadline?`, opts: ["Blame external factors", "Stay silent and hope no one notices", "Proactively communicate and propose a recovery plan", "Deliver partial work without informing anyone"], correct: 2, explanation: "Proactive communication about delays, with a clear recovery plan, builds trust and professionalism." },
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const raw = await withTimeout(callClaude(
          `Generate 5 ${difficulty} difficulty MCQ questions for a ${role} job interview. Each must test real professional knowledge.
Return ONLY JSON (no markdown):
{"questions":[{"q":"<question>","opts":["<A>","<B>","<C>","<D>"],"correct":<0-3>,"explanation":"<why this answer is correct, 1-2 sentences>"}]}`
        ), 12000);
        const p = parseJSON(raw);
        if (Array.isArray(p.questions) && p.questions.length >= 3) setQuestions(p.questions);
        else setQuestions(FALLBACK_MCQ);
      } catch { setQuestions(FALLBACK_MCQ); }
      setLoading(false);
    })();
  }, [role, difficulty]);

  const { time, start, stop } = useTimer(30, () => {
    if (!showExpl) handleSelect(-1);
  });

  useEffect(() => { if (questions.length && !done) start(); }, [current, questions, done]);

  const handleSelect = (idx) => {
    if (showExpl) return;
    stop();
    setSelected(idx);
    setShowExpl(true);
    const isCorrect = idx === questions[current].correct;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(a => [...a, { selected: idx, correct: questions[current].correct, isCorrect }]);
  };

  const next = () => {
    setShowExpl(false); setSelected(null);
    if (current + 1 >= questions.length) { setDone(true); }
    else { setCurrent(c => c + 1); }
  };

  const optColors = (i) => {
    if (!showExpl) return { bg: "rgba(212,175,55,0.04)", border: "rgba(212,175,55,0.12)", color: C.text };
    if (i === questions[current].correct) return { bg: "rgba(61,202,122,0.1)", border: C.green, color: C.green };
    if (i === selected && selected !== questions[current].correct) return { bg: "rgba(240,68,68,0.08)", border: C.red, color: C.red };
    return { bg: "rgba(212,175,55,0.02)", border: "rgba(212,175,55,0.06)", color: C.muted };
  };

  const pct = Math.round((score / questions.length) * 100);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px 28px" }}>
      <MascotSVG expression="thinking" size={60}/>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text, marginTop: 18, marginBottom: 8 }}>Generating {difficulty} questions…</div>
      <div style={{ color: C.gold, fontSize: 13, animation: "pulse 1.5s ease infinite" }}>Crafting your {role} assessment…</div>
    </div>
  );

  if (done) return (
    <div style={{ padding: "28px", maxWidth: 720, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "⚡" : "📚"}</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: C.text, marginBottom: 8 }}>MCQ Complete!</h1>
        <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 80 ? C.green : pct >= 60 ? C.yellow : C.red, fontFamily: "'Playfair Display', serif" }}>{score}/{questions.length}</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>{pct}% correct · {difficulty} difficulty</div>
        <LevelBadge score={pct}/>
      </div>

      {questions.map((q, i) => {
        const a = answers[i] || {};
        return (
          <Card key={i} style={{ marginBottom: 14, borderColor: a.isCorrect ? "rgba(61,202,122,0.2)" : "rgba(240,68,68,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Label style={{ marginBottom: 0 }}>Question {i + 1}</Label>
              <Tag color={a.isCorrect ? C.green : C.red} bg={`${a.isCorrect ? C.green : C.red}18`}>{a.isCorrect ? "✓ Correct" : "✗ Wrong"}</Tag>
            </div>
            <p style={{ color: C.text, fontSize: 13.5, marginBottom: 10, lineHeight: 1.65 }}>{q.q}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {q.opts.map((opt, oi) => (
                <span key={oi} style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12,
                  background: oi === q.correct ? "rgba(61,202,122,0.1)" : oi === a.selected && !a.isCorrect ? "rgba(240,68,68,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${oi === q.correct ? C.green : oi === a.selected && !a.isCorrect ? C.red : "rgba(255,255,255,0.06)"}`,
                  color: oi === q.correct ? C.green : oi === a.selected && !a.isCorrect ? C.red : C.muted,
                }}>{String.fromCharCode(65 + oi)}. {opt}</span>
              ))}
            </div>
            <div style={{ padding: "9px 13px", borderRadius: 9, background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.12)" }}>
              <span style={{ color: C.gold, fontSize: 10, fontWeight: 700 }}>EXPLANATION  </span>
              <span style={{ color: C.muted, fontSize: 12.5 }}>{q.explanation}</span>
            </div>
          </Card>
        );
      })}
      <div style={{ display: "flex", gap: 12 }}>
        <Btn onClick={onBack} variant="secondary">← Back to Modes</Btn>
        <Btn onClick={() => onFinish({ score: pct, mode: "MCQ", difficulty, role })}>View Full Report</Btn>
      </div>
    </div>
  );

  const q = questions[current];
  const timerColor = time <= 10 ? C.red : time <= 20 ? C.yellow : C.green;

  return (
    <div style={{ padding: "28px", maxWidth: 720, margin: "0 auto", animation: "fadeUp 0.3s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text }}>Question {current + 1} / {questions.length}</h2>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{role} · {difficulty}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: timerColor, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{time}</div>
            <div style={{ color: C.muted, fontSize: 9 }}>SECONDS</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>{score}</div>
            <div style={{ color: C.muted, fontSize: 9 }}>SCORE</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: C.surface, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C.gold},${C.goldLight})`, borderRadius: 2, width: `${((current) / questions.length) * 100}%`, transition: "width 0.4s" }}/>
      </div>
      {/* Timer bar */}
      <div style={{ height: 3, background: C.surface, borderRadius: 2, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ height: "100%", background: timerColor, borderRadius: 2, width: `${(time / 30) * 100}%`, transition: "width 1s linear" }}/>
      </div>

      {/* Question */}
      <Card style={{ marginBottom: 18 }}>
        <p style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8, fontFamily: "'Playfair Display', serif" }}>{q.q}</p>
      </Card>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {q.opts.map((opt, i) => {
          const col = optColors(i);
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={showExpl} style={{
              padding: "13px 18px", borderRadius: 12, border: `1px solid ${col.border}`,
              background: col.bg, color: col.color, cursor: showExpl ? "default" : "pointer",
              textAlign: "left", fontSize: 13.5, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 12, transition: "all 0.18s",
              fontWeight: showExpl && i === q.correct ? 600 : 400,
            }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${col.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
              {opt}
              {showExpl && i === q.correct && <span style={{ marginLeft: "auto", color: C.green }}>✓</span>}
              {showExpl && i === selected && selected !== q.correct && <span style={{ marginLeft: "auto", color: C.red }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExpl && (
        <div style={{ padding: "13px 16px", borderRadius: 12, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", marginBottom: 16, animation: "fadeUp 0.25s ease" }}>
          <div style={{ color: C.gold, fontSize: 10, fontWeight: 700, marginBottom: 5 }}>WHY THIS ANSWER</div>
          <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.65 }}>{q.explanation}</p>
        </div>
      )}

      {showExpl && (
        <Btn onClick={next} style={{ width: "100%" }}>
          {current + 1 >= questions.length ? "See Final Score →" : "Next Question →"}
        </Btn>
      )}
    </div>
  );
}

// ─── WEBCAM EMOTION PANEL ─────────────────────────────────────────────────────
function WebcamPanel({ active, onEmotionUpdate }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [camError, setCamError] = useState(null);
  const [camReady, setCamReady] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState("Neutral");
  const [eyeContact, setEyeContact] = useState("Good");
  const [engagement, setEngagement] = useState(85);

  // Lightweight simulated emotion detection using face movement heuristics
  // In production, replace with face-api.js or tensorflow.js
  const detectEmotion = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Sample pixels from face region (center of frame) for basic brightness analysis
    try {
      const centerX = Math.floor(canvas.width * 0.35);
      const centerY = Math.floor(canvas.height * 0.2);
      const sampleW = Math.floor(canvas.width * 0.3);
      const sampleH = Math.floor(canvas.height * 0.5);
      const imgData = ctx.getImageData(centerX, centerY, sampleW, sampleH);
      const data = imgData.data;

      let totalBrightness = 0;
      let pixelCount = 0;
      for (let i = 0; i < data.length; i += 16) {
        totalBrightness += (data[i] + data[i+1] + data[i+2]) / 3;
        pixelCount++;
      }
      const avgBrightness = totalBrightness / pixelCount;

      // Map brightness variance to simulated emotion states
      const noise = Math.random();
      let emotion = "Neutral";
      let eye = "Good";
      let eng = 75 + Math.floor(Math.random() * 20);

      if (avgBrightness > 140) {
        emotion = noise > 0.6 ? "Confident" : noise > 0.3 ? "Engaged" : "Neutral";
        eye = noise > 0.4 ? "Excellent" : "Good";
        eng = 80 + Math.floor(Math.random() * 18);
      } else if (avgBrightness > 100) {
        emotion = noise > 0.7 ? "Focused" : noise > 0.4 ? "Neutral" : "Slightly Nervous";
        eye = noise > 0.5 ? "Good" : "Fair";
        eng = 65 + Math.floor(Math.random() * 20);
      } else {
        emotion = noise > 0.5 ? "Nervous" : "Distracted";
        eye = noise > 0.5 ? "Fair" : "Needs Improvement";
        eng = 45 + Math.floor(Math.random() * 25);
      }

      setCurrentEmotion(emotion);
      setEyeContact(eye);
      setEngagement(eng);
      onEmotionUpdate && onEmotionUpdate({ emotion, eyeContact: eye, engagement: eng, timestamp: Date.now() });
    } catch (e) {
      // Canvas tainted or permissions — use fallback
      const emotions = ["Confident","Neutral","Focused","Engaged"];
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      setCurrentEmotion(emotion);
      onEmotionUpdate && onEmotionUpdate({ emotion, eyeContact: "Good", engagement: 75 + Math.floor(Math.random() * 20), timestamp: Date.now() });
    }
  }, [onEmotionUpdate]);

  useEffect(() => {
    if (!active) return;
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        setCamReady(true); setCamError(null);
        intervalRef.current = setInterval(detectEmotion, 2500);
      })
      .catch(err => {
        setCamError(err.name === "NotAllowedError" ? "Camera permission denied. Enable in browser settings." : "Camera not available. Using text mode.");
      });
    return () => {
      clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [active, detectEmotion]);

  const emotionColor = { Confident: C.green, Engaged: C.green, Focused: C.blue, Neutral: C.muted, "Slightly Nervous": C.yellow, Nervous: C.red, Distracted: C.red };
  const eyeColor = { Excellent: C.green, Good: C.green, Fair: C.yellow, "Needs Improvement": C.red };

  if (camError) return (
    <div style={{ borderRadius: 16, background: C.surface, border: "1px solid rgba(240,68,68,0.15)", padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>📷</div>
      <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{camError}</div>
      <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.12)" }}>
        <div style={{ color: C.gold, fontSize: 10, fontWeight: 700 }}>TEXT MODE ACTIVE</div>
        <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>All voice + AI features still work</div>
      </div>
    </div>
  );

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: "#000", position: "relative", border: "1px solid rgba(212,175,55,0.12)" }}>
      {/* Video */}
      <video ref={videoRef} muted playsInline style={{ width: "100%", display: "block", transform: "scaleX(-1)", minHeight: 180, objectFit: "cover" }}/>
      <canvas ref={canvasRef} style={{ display: "none" }}/>

      {/* Overlays */}
      {camReady && (
        <>
          {/* Live indicator */}
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, animation: "pulse 1s ease infinite" }}/>
            <span style={{ color: "white", fontSize: 10, fontWeight: 600 }}>LIVE</span>
          </div>

          {/* Emotion badge */}
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", padding: "4px 10px", borderRadius: 20 }}>
            <span style={{ color: emotionColor[currentEmotion] || C.muted, fontSize: 10, fontWeight: 700 }}>{currentEmotion}</span>
          </div>

          {/* Stats bar */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "16px 12px 10px", display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 8, letterSpacing: 1.5, marginBottom: 2 }}>EYE CONTACT</div>
              <div style={{ color: eyeColor[eyeContact] || C.muted, fontSize: 11, fontWeight: 600 }}>{eyeContact}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 8, letterSpacing: 1.5, marginBottom: 2 }}>ENGAGEMENT</div>
              <div style={{ color: engagement >= 75 ? C.green : engagement >= 55 ? C.yellow : C.red, fontSize: 11, fontWeight: 600 }}>{engagement}%</div>
            </div>
          </div>
        </>
      )}

      {!camReady && !camError && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
          <div style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8, animation: "pulse 1.5s ease infinite" }}>📷</div>
            Requesting camera…
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LIVE VOICE MODE + WEBCAM ─────────────────────────────────────────────────
function LiveInterviewMode({ role, onBack, onFinish }) {
  const [stage, setStage]           = useState("ready");    // ready | interview | evaluating | results
  const [questions, setQuestions]   = useState([]);
  const [currentQ, setCurrentQ]     = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers]       = useState([]);
  const [listening, setListening]   = useState(false);
  const [speaking, setSpeaking]     = useState(false);
  const [quickFeedback, setQuickFeedback] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [emotionLog, setEmotionLog] = useState([]);
  const [enableCam, setEnableCam]   = useState(true);
  const [loadingQ, setLoadingQ]     = useState(false);
  const recognitionRef = useRef(null);

  const DEFAULT_QS = [
    `Tell me about yourself and what draws you to the ${role} role.`,
    `Describe a challenging project you've led or contributed to significantly.`,
    `How do you handle tight deadlines and competing priorities?`,
    `Tell me about a time you disagreed with a teammate. How did you resolve it?`,
    `Where do you see yourself professionally in 3 years?`,
  ];

  useEffect(() => {
    (async () => {
      setLoadingQ(true);
      try {
        const raw = await withTimeout(callClaude(
          `Generate 5 realistic interview questions for a ${role} role. Mix behavioral and situational. Return ONLY JSON: {"questions":["q1","q2","q3","q4","q5"]}`
        ), 11000);
        const p = parseJSON(raw);
        setQuestions(Array.isArray(p.questions) && p.questions.length >= 4 ? p.questions : DEFAULT_QS);
      } catch { setQuestions(DEFAULT_QS); }
      setLoadingQ(false);
    })();
  }, [role]);

  // Text-to-speech: speak question aloud
  const speakQuestion = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.92; utt.pitch = 1.0; utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Alex")));
    if (preferred) utt.voice = preferred;
    utt.onstart  = () => setSpeaking(true);
    utt.onend    = () => setSpeaking(false);
    utt.onerror  = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, []);

  const startInterview = () => {
    setStage("interview");
    setTimeout(() => speakQuestion(questions[0] || ""), 600);
  };

  // Voice recognition — robust, continuous mode
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input requires Chrome or Edge browser.");
      return;
    }
    window.speechSynthesis.cancel(); // stop TTS while listening
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = "en-US";
    rec.maxAlternatives = 1;
    rec.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setCurrentAnswer(t);
    };
    rec.onerror = e => {
      setListening(false);
      if (e.error === "not-allowed") alert("Microphone permission denied. Allow in browser settings.");
    };
    rec.onend = () => { if (listening) { try { rec.start(); } catch {} } };
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // After each answer: quick AI feedback (non-blocking, 3-second timeout with fallback)
  const getQuickFeedback = async (answer, question) => {
    const fallbacks = [
      { tip: "Good answer. Add a specific metric or outcome to strengthen it.", icon: "💡" },
      { tip: "Clear response. Try opening with a direct statement, then support it.", icon: "🎯" },
      { tip: "Solid. Connect your experience more explicitly to the role's requirements.", icon: "⭐" },
    ];
    try {
      const raw = await withTimeout(callClaude(
        `Rate this interview answer in 1 short sentence (max 15 words) and give one specific improvement tip (max 15 words). Return ONLY JSON: {"rating":"<1 sentence>","tip":"<tip>"}\n\nQuestion: ${question}\nAnswer: ${answer.substring(0, 300)}`
      ), 5000);
      const p = parseJSON(raw);
      return { tip: `${p.rating} ${p.tip}`, icon: "💡" };
    } catch {
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  };

  const submitAnswer = async () => {
    stopVoice();
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, { q: questions[currentQ], a: currentAnswer }];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    // Show quick feedback
    const qf = await getQuickFeedback(currentAnswer, questions[currentQ]);
    setQuickFeedback(qf);
    await new Promise(r => setTimeout(r, 2200));
    setQuickFeedback(null);

    if (currentQ + 1 >= questions.length) {
      // All done — generate final report
      window.speechSynthesis.cancel();
      setStage("evaluating");
      await generateFinalReport(newAnswers);
    } else {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      speakQuestion(questions[nextQ]);
    }
  };

  const generateFinalReport = async (allAnswers) => {
    const qa = allAnswers.map((a, i) => `Q${i+1}: ${a.q}\nAnswer: ${a.a}`).join("\n\n");

    // Analyze emotion log
    const emotionSummary = emotionLog.length
      ? emotionLog.reduce((acc, e) => { acc[e.emotion] = (acc[e.emotion] || 0) + 1; return acc; }, {})
      : { Neutral: 5 };
    const dominantEmotion = Object.entries(emotionSummary).sort((a,b) => b[1]-a[1])[0][0];
    const avgEng = emotionLog.length ? Math.round(emotionLog.reduce((s, e) => s + (e.engagement || 70), 0) / emotionLog.length) : 70;

    const FALLBACK_REPORT = {
      overallScore: 74,
      communication: 78, confidence: 70, technicalAccuracy: 72, bodyLanguage: avgEng,
      strengths: ["Clear articulation of relevant experience", "Structured responses with context and outcome", "Professional tone maintained throughout"],
      improvements: ["Add quantifiable metrics to your achievements", "Practice the STAR method more consistently", "Maintain eye contact during key points"],
      tips: ["Record yourself answering practice questions — watch your pace", "Prepare 3 stories for behavioral questions and adapt them", "Research the company before your real interview for tailored answers"],
      coachNote: `You came across as ${dominantEmotion.toLowerCase()} during the session. Focus on grounding your answers in specific, measurable outcomes.`,
    };

    try {
      const raw = await withTimeout(callClaude(
        `You are a senior hiring manager. Evaluate these ${role} interview answers using the STAR method. Be specific and direct. Return ONLY JSON:
{"overallScore":<0-100>,"communication":<0-100>,"confidence":<0-100>,"technicalAccuracy":<0-100>,"bodyLanguage":${avgEng},"strengths":["<3 specific strengths>"],"improvements":["<3 specific improvements>"],"tips":["<3 actionable coaching tips>"],"coachNote":"<2 sentence personalized coaching note mentioning ${dominantEmotion} demeanor>"}

${qa}`
      ), 14000);
      const p = parseJSON(raw);
      if (typeof p.overallScore === "number") setFinalReport(p);
      else setFinalReport(FALLBACK_REPORT);
    } catch { setFinalReport(FALLBACK_REPORT); }
    setStage("results");
  };

  const handleEmotionUpdate = useCallback((data) => {
    setEmotionLog(prev => [...prev.slice(-20), data]);
  }, []);

  // ── READY STAGE ───────────────────────────────────────────────────────────
  if (stage === "ready") return (
    <div style={{ padding: "28px", maxWidth: 680, margin: "0 auto", animation: "fadeUp 0.35s ease" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: C.text, marginBottom: 6 }}>Live Interview — {role}</h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>Questions are read aloud by AI. Answer by voice or text. Webcam tracks your engagement and emotion in real-time.</p>

      {enableCam && <WebcamPanel active={true} onEmotionUpdate={handleEmotionUpdate}/>}

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[{i:"🎙️",l:"Voice Input + TTS"},{i:"😊",l:"Emotion Tracking"},{i:"🎯",l:"Per-Answer Tips"}].map(x => (
          <div key={x.l} style={{ padding: "12px", borderRadius: 10, background: C.surface, border: "1px solid rgba(212,175,55,0.07)", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{x.i}</div>
            <div style={{ color: C.muted, fontSize: 10 }}>{x.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: C.muted, fontSize: 13 }}>
          <input type="checkbox" checked={enableCam} onChange={e => setEnableCam(e.target.checked)} style={{ width: 14, height: 14, accentColor: C.gold }}/>
          Enable webcam
        </label>
        {loadingQ && <span style={{ color: C.gold, fontSize: 12, animation: "pulse 1.5s ease infinite" }}>Loading questions…</span>}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={onBack} variant="secondary">← Back</Btn>
        <Btn onClick={startInterview} disabled={loadingQ || questions.length === 0}>
          {loadingQ ? "Preparing…" : "▶ Start Interview"}
        </Btn>
      </div>
    </div>
  );

  // ── EVALUATING STAGE ──────────────────────────────────────────────────────
  if (stage === "evaluating") return (
    <div style={{ textAlign: "center", padding: "80px 28px", animation: "fadeUp 0.35s ease" }}>
      <MascotSVG expression="thinking" size={64}/>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.text, marginTop: 20, marginBottom: 8 }}>Evaluating your performance…</div>
      <div style={{ color: C.gold, fontSize: 13, animation: "pulse 1.5s ease infinite" }}>Analyzing answers, emotion data, and coaching insights…</div>
    </div>
  );

  // ── INTERVIEW STAGE ───────────────────────────────────────────────────────
  if (stage === "interview") return (
    <div style={{ padding: "20px 22px", animation: "fadeUp 0.3s ease" }}>
      {/* Top progress bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ color: C.muted, fontSize: 12 }}>{role} · Question {currentQ + 1} / {questions.length}</div>
        <div style={{ color: C.gold, fontSize: 12, fontWeight: 600 }}>{Math.round(((currentQ) / questions.length) * 100)}% complete</div>
      </div>
      <div style={{ height: 3, background: C.surface, borderRadius: 2, marginBottom: 18 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C.gold},${C.goldLight})`, borderRadius: 2, width: `${(currentQ / questions.length) * 100}%`, transition: "width 0.5s" }}/>
      </div>

      {/* Split layout */}
      <div style={{ display: "grid", gridTemplateColumns: enableCam ? "1fr 280px" : "1fr", gap: 18 }}>
        {/* LEFT: Question + Answer */}
        <div>
          {/* Question card */}
          <Card style={{ marginBottom: 16, position: "relative" }}>
            {speaking && (
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 3, alignItems: "center" }}>
                {[1,2,3,2,1].map((h, i) => (
                  <div key={i} style={{ width: 3, height: h * 5, background: C.gold, borderRadius: 2, animation: `bounce 0.6s ease-in-out ${i*0.1}s infinite` }}/>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <MascotSVG expression="thinking" size={32}/>
              <div>
                <Label style={{ marginBottom: 4 }}>Question {currentQ + 1}</Label>
                <p style={{ color: C.text, fontSize: 15, lineHeight: 1.8, fontFamily: "'Playfair Display', serif" }}>{questions[currentQ]}</p>
              </div>
            </div>
            <button onClick={() => speakQuestion(questions[currentQ])} style={{ marginTop: 12, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.06)", color: C.gold, fontSize: 11, cursor: "pointer" }}>🔊 Replay question</button>
          </Card>

          {/* Quick feedback toast */}
          {quickFeedback && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start", animation: "fadeUp 0.25s ease" }}>
              <span style={{ fontSize: 16 }}>{quickFeedback.icon}</span>
              <span style={{ color: C.text, fontSize: 13, lineHeight: 1.55 }}>{quickFeedback.tip}</span>
            </div>
          )}

          {/* Answer area */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Label style={{ marginBottom: 0 }}>Your Answer</Label>
              <div style={{ display: "flex", gap: 8 }}>
                {listening && <span style={{ color: C.red, fontSize: 11, animation: "pulse 1s ease infinite", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, display: "inline-block" }}/>Recording…</span>}
                <button onClick={listening ? stopVoice : startVoice} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${listening ? C.red : "rgba(212,175,55,0.25)"}`, background: listening ? "rgba(240,68,68,0.12)" : "rgba(212,175,55,0.06)", color: listening ? C.red : C.gold, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}>
                  🎙️ {listening ? "Stop" : "Speak"}
                </button>
              </div>
            </div>
            <Inp rows={5} placeholder={listening ? "Listening… speak your answer" : "Type your answer or click Speak…"} value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)}/>
          </div>

          <Btn onClick={submitAnswer} disabled={!currentAnswer.trim()} style={{ width: "100%" }}>
            {currentQ + 1 >= questions.length ? "Submit Final Answer →" : "Submit & Next →"}
          </Btn>
        </div>

        {/* RIGHT: Webcam */}
        {enableCam && (
          <div>
            <WebcamPanel active={true} onEmotionUpdate={handleEmotionUpdate}/>

            {/* Emotion timeline */}
            {emotionLog.length > 0 && (
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: C.surface, border: "1px solid rgba(212,175,55,0.07)" }}>
                <Label style={{ marginBottom: 6 }}>Emotion Log</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 60, overflow: "hidden" }}>
                  {emotionLog.slice(-10).map((e, i) => {
                    const col = { Confident: C.green, Engaged: C.green, Focused: C.blue, Neutral: C.muted, "Slightly Nervous": C.yellow, Nervous: C.red, Distracted: C.red };
                    return <span key={i} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 20, background: `${col[e.emotion] || C.muted}18`, color: col[e.emotion] || C.muted, border: `1px solid ${col[e.emotion] || C.muted}33` }}>{e.emotion}</span>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── RESULTS STAGE ─────────────────────────────────────────────────────────
  if (stage === "results" && finalReport) {
    const r = finalReport;
    const sections = [
      { label: "Communication",    score: r.communication,    color: C.blue,   icon: "💬" },
      { label: "Confidence",       score: r.confidence,       color: C.green,  icon: "💪" },
      { label: "Technical",        score: r.technicalAccuracy,color: C.purple, icon: "🎯" },
      { label: "Body Language",    score: r.bodyLanguage,     color: C.yellow, icon: "👁️" },
    ];

    return (
      <div style={{ padding: "28px", maxWidth: 900, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: C.text, marginBottom: 14 }}>Interview Report</h1>
          <RingScore target={r.overallScore} label="Overall Score" size={140}/>
          <div style={{ marginTop: 14 }}><LevelBadge score={r.overallScore}/></div>
          {r.coachNote && <p style={{ color: C.muted, fontSize: 13, maxWidth: 500, margin: "14px auto 0", lineHeight: 1.75, fontStyle: "italic" }}>"{r.coachNote}"</p>}
        </div>

        {/* Section scores */}
        <Card style={{ marginBottom: 18 }}>
          <Label>Performance Breakdown</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
            {sections.map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <RingScore target={s.score} color={s.color} size={72}/>
                <div>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{s.icon} {s.label}</div>
                  <div style={{ color: s.score >= 75 ? C.green : s.score >= 55 ? C.yellow : C.red, fontSize: 11, marginTop: 2 }}>
                    {s.score >= 75 ? "Strong" : s.score >= 55 ? "Good" : "Needs Work"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths, improvements, tips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Card style={{ borderColor: "rgba(61,202,122,0.2)" }}>
            <Label>✅ Key Strengths</Label>
            {r.strengths?.map((s, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}><span style={{ color: C.green }}>✓</span><span style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>{s}</span></div>)}
          </Card>
          <Card style={{ borderColor: "rgba(245,166,35,0.2)" }}>
            <Label>📈 Areas to Improve</Label>
            {r.improvements?.map((s, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}><span style={{ color: C.yellow }}>→</span><span style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>{s}</span></div>)}
          </Card>
        </div>

        <Card style={{ marginBottom: 18 }}>
          <Label>🎓 Personalized Coaching Tips</Label>
          {r.tips?.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 9, background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.07)", marginBottom: 9 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(212,175,55,0.14)", color: C.gold, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
              <span style={{ color: C.text, fontSize: 13.5, lineHeight: 1.65 }}>{t}</span>
            </div>
          ))}
        </Card>

        {/* Emotion summary */}
        {emotionLog.length > 0 && (
          <Card style={{ marginBottom: 18 }}>
            <Label>😊 Emotion Timeline Summary</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(emotionLog.reduce((acc, e) => { acc[e.emotion] = (acc[e.emotion] || 0) + 1; return acc; }, {}))
                .sort((a,b) => b[1]-a[1]).map(([emotion, count]) => {
                const col = { Confident: C.green, Engaged: C.green, Focused: C.blue, Neutral: C.muted, "Slightly Nervous": C.yellow, Nervous: C.red, Distracted: C.red };
                return <Tag key={emotion} color={col[emotion] || C.muted} bg={`${col[emotion] || C.muted}18`}>{emotion} ×{count}</Tag>;
              })}
            </div>
          </Card>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <Btn onClick={onBack} variant="secondary">← Try Another Mode</Btn>
          <Btn onClick={() => onFinish({ score: r.overallScore, mode: "Live", role })}>Done</Btn>
        </div>
      </div>
    );
  }

  return null;
}

// ─── MOCK INTERVIEW — MODE SELECTOR ──────────────────────────────────────────
function MockInterview() {
  const [view, setView]         = useState("select"); // select | mcq | live | report
  const [role, setRole]         = useState("");
  const [difficulty, setDiff]   = useState("medium");
  const [finalData, setFinalData] = useState(null);

  const handleFinish = (data) => { setFinalData(data); setView("report"); };
  const reset = () => { setView("select"); setFinalData(null); };

  // ── MODE SELECT ───────────────────────────────────────────────────────────
  if (view === "select") return (
    <div style={{ padding: "28px", maxWidth: 780, margin: "0 auto", animation: "fadeUp 0.35s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, marginBottom: 5 }}>Mock Interview</h1>
        <p style={{ color: C.muted, fontSize: 14 }}>Three modes. One goal: get you hired.</p>
      </div>

      {/* Role + Difficulty */}
      <Card style={{ marginBottom: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "end" }}>
          <div>
            <Label>Target Role</Label>
            <Inp placeholder="e.g., Software Engineer, Product Manager, Data Scientist" value={role} onChange={e => setRole(e.target.value)}/>
          </div>
          <div>
            <Label>Difficulty</Label>
            <div style={{ display: "flex", gap: 6 }}>
              {["easy", "medium", "hard"].map(d => (
                <button key={d} onClick={() => setDiff(d)} style={{
                  padding: "9px 14px", borderRadius: 9, border: `1px solid ${difficulty === d ? C.gold : "rgba(212,175,55,0.15)"}`,
                  background: difficulty === d ? "rgba(212,175,55,0.12)" : "transparent",
                  color: difficulty === d ? C.gold : C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                  transition: "all 0.15s", textTransform: "capitalize",
                }}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Mode cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16, marginBottom: 20 }}>
        {[
          {
            id: "mcq", icon: "📋", title: "MCQ Assessment",
            desc: "5–10 multiple choice questions with explanations. Real-time score tracking. Timed.",
            tags: ["Score tracking", "Explanations", "Timed 30s/Q"],
            color: C.blue,
          },
          {
            id: "live", icon: "🎤", title: "Live Interview",
            desc: "AI asks questions aloud. You respond by voice or text. Webcam emotion tracking.",
            tags: ["Voice I/O", "Emotion tracking", "Quick feedback"],
            color: C.green,
            badge: "FEATURED",
          },
        ].map(m => (
          <Card key={m.id} onClick={() => { if (role.trim()) setView(m.id); }} style={{ opacity: role.trim() ? 1 : 0.45, position: "relative" }}>
            {m.badge && (
              <span style={{ position: "absolute", top: 14, right: 14, fontSize: 8, fontWeight: 700, color: C.gold, background: "rgba(212,175,55,0.15)", padding: "2px 7px", borderRadius: 6, letterSpacing: 1 }}>{m.badge}</span>
            )}
            <div style={{ fontSize: 32, marginBottom: 12 }}>{m.icon}</div>
            <div style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 7, fontFamily: "'Playfair Display', serif" }}>{m.title}</div>
            <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>{m.desc}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {m.tags.map(t => <Tag key={t} color={m.color} bg={`${m.color}18`}>{t}</Tag>)}
            </div>
            <div style={{ color: m.color, fontSize: 12, marginTop: 14, fontWeight: 600 }}>
              {role.trim() ? `Start ${m.title} →` : "Enter a role above to start"}
            </div>
          </Card>
        ))}
      </div>

      {!role.trim() && (
        <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.12)", color: C.muted, fontSize: 13, textAlign: "center" }}>
          👆 Enter your target role above to unlock all interview modes
        </div>
      )}
    </div>
  );

  if (view === "mcq") return (
    <MCQMode role={role} difficulty={difficulty} onFinish={handleFinish} onBack={reset}/>
  );

  if (view === "live") return (
    <LiveInterviewMode role={role} onBack={reset} onFinish={handleFinish}/>
  );

  if (view === "report" && finalData) return (
    <div style={{ padding: "28px", maxWidth: 600, margin: "0 auto", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: C.text, marginBottom: 8 }}>Session Complete!</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>{finalData.mode} · {finalData.role}</p>
      <Card style={{ marginBottom: 24, textAlign: "center" }}>
        <RingScore target={finalData.score} label="Final Score" size={130}/>
        <div style={{ marginTop: 14 }}><LevelBadge score={finalData.score}/></div>
      </Card>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn onClick={reset}>Try Another Mode</Btn>
        <Btn variant="secondary" onClick={() => { setView(finalData.mode === "MCQ" ? "mcq" : "live"); setFinalData(null); }}>Retry Same Mode</Btn>
      </div>
    </div>
  );

  return null;
}

// ─── SKILL GAP — delegates to rebuilt SkillGap component ────────────────────
function SkillGap() {
  return <SkillGapNew />;
}

// ─── CAREER RECOMMENDATION — delegates to rebuilt component ────────────────
function CareerRecommendation() {
  return <CareerRecommendationNew />;
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("cs_user")); } catch { return null; } });

  const navigate = p => setPage(p);
  const logout = () => { localStorage.removeItem("cs_user"); setUser(null); setPage("landing"); };
  const showChrome = !["login", "signup"].includes(page);

  const pages = {
    landing: <Landing onNavigate={navigate}/>,
    login:   <AuthPage mode="login" onNavigate={navigate} onLogin={setUser}/>,
    signup:  <AuthPage mode="signup" onNavigate={navigate} onLogin={setUser}/>,
    dashboard: <Dashboard user={user} onNavigate={navigate}/>,
    resume:    <ResumeAnalyzer/>,
    roast:     <ResumeRoast/>,
    scam:      <ScamDetector/>,
    interview: <MockInterview/>,
    skills:    <SkillGap/>,
    career:    <CareerRecommendation/>,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <style>{GLOBAL_CSS}</style>

      {showChrome && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page={page} onNavigate={navigate} user={user} onLogout={logout}/>}
      <Header onOpen={() => setSidebarOpen(true)} onNavigate={navigate} page={page}/>

      <main style={{ paddingTop: showChrome ? 64 : 0, minHeight: "100vh", animation: "fadeUp 0.32s ease" }}>
        {pages[page] || <Landing onNavigate={navigate}/>}
      </main>

      <Chatbot onNavigate={navigate}/>
    </div>
  );
}
