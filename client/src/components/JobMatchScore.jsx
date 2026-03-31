// ─── JOB MATCH SCORE ─────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

const C = {
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  gold: "#D4AF37", goldDim: "#B8962E",
  green: "#3DCA7A", yellow: "#F5A623", red: "#F04444", blue: "#5B9CF6",
};

function AnimatedRing({ target, size = 130 }) {
  const [val, setVal] = useState(0);
  const color = target >= 75 ? C.green : target >= 50 ? C.yellow : target >= 30 ? C.gold : C.red;
  const label = target >= 75 ? "Strong Match" : target >= 50 ? "Moderate Match" : target >= 30 ? "Partial Match" : "Low Match";

  useEffect(() => {
    let cur = 0;
    const step = target / 70;
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(cur));
    }, 14);
    return () => clearInterval(id);
  }, [target]);

  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (val / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.04s, stroke 0.3s" }}/>
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ color: C.text, fontWeight: 900, fontSize: 28, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
            {val}%
          </div>
        </div>
      </div>
      <div style={{
        padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: `${color}18`, border: `1px solid ${color}44`, color,
      }}>{label}</div>
    </div>
  );
}

export default function JobMatchScore({ score, totalKeywords, matchedCount }) {
  return (
    <div style={{
      background: "#16161F", borderRadius: 18,
      border: "1px solid rgba(212,175,55,0.1)", padding: "24px",
      animation: "jmsFadeUp 0.4s ease",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
    }}>
      <style>{`@keyframes jmsFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600 }}>
        Job Match Score
      </div>

      <AnimatedRing target={score} size={140}/>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%",
      }}>
        <div style={{
          textAlign: "center", padding: "10px", borderRadius: 10,
          background: "rgba(61,202,122,0.06)", border: "1px solid rgba(61,202,122,0.15)",
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.green, fontFamily: "'Playfair Display', serif" }}>
            {matchedCount}
          </div>
          <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Keywords Matched</div>
        </div>
        <div style={{
          textAlign: "center", padding: "10px", borderRadius: 10,
          background: "rgba(240,68,68,0.06)", border: "1px solid rgba(240,68,68,0.15)",
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.red, fontFamily: "'Playfair Display', serif" }}>
            {totalKeywords - matchedCount}
          </div>
          <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Keywords Missing</div>
        </div>
      </div>

      <div style={{ color: C.muted, fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>
        Based on {totalKeywords} keywords extracted from the job description
      </div>
    </div>
  );
}
