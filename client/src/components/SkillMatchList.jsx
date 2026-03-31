// ─── SKILL MATCH LIST — Staggered animations ─────────────────────────────────
import { useEffect, useState } from "react";

const C = {
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  green: "#3DCA7A", red: "#F04444", gold: "#D4AF37",
  card: "#16161F",
};

function SkillItem({ skill, matched, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", borderRadius: 9,
      background: matched ? "rgba(61,202,122,0.06)" : "rgba(240,68,68,0.06)",
      border: `1px solid ${matched ? "rgba(61,202,122,0.2)" : "rgba(240,68,68,0.18)"}`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.35s ease, transform 0.35s ease",
    }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>
        {matched ? "✔" : "•"}
      </span>
      <span style={{ color: matched ? C.green : "#D0D0D8", fontSize: 13, fontWeight: matched ? 600 : 400 }}>
        {skill}
      </span>
      {matched && (
        <span style={{
          marginLeft: "auto", fontSize: 9, fontWeight: 700, color: C.green,
          background: "rgba(61,202,122,0.1)", padding: "1px 6px", borderRadius: 10,
          border: "1px solid rgba(61,202,122,0.2)",
        }}>IN RESUME</span>
      )}
    </div>
  );
}

export default function SkillMatchList({ matchedSkills = [], missingSkills = [] }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "skill-match-style";
    if (!document.getElementById("skill-match-style")) {
      style.textContent = `@keyframes smlSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }`;
      document.head.appendChild(style);
    }
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  const baseDelay = 80; // ms between items

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
      animation: "smlSlideUp 0.35s ease",
    }}>
      {/* Matched */}
      <div style={{
        background: C.card, borderRadius: 16,
        border: "1px solid rgba(61,202,122,0.18)", padding: "18px 16px",
      }}>
        <div style={{
          color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
          fontWeight: 600, marginBottom: 12,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ color: C.green }}>✔</span> Matched Skills ({matchedSkills.length})
        </div>
        {matchedSkills.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
            No skills matched. Make sure your resume mentions the right keywords.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {matchedSkills.map((skill, i) => (
              <SkillItem key={skill} skill={skill} matched={true} delay={i * baseDelay}/>
            ))}
          </div>
        )}
      </div>

      {/* Missing */}
      <div style={{
        background: C.card, borderRadius: 16,
        border: "1px solid rgba(240,68,68,0.18)", padding: "18px 16px",
      }}>
        <div style={{
          color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
          fontWeight: 600, marginBottom: 12,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ color: C.red }}>•</span> Missing Skills ({missingSkills.length})
        </div>
        {missingSkills.length === 0 ? (
          <div style={{
            padding: "10px 12px", borderRadius: 9,
            background: "rgba(61,202,122,0.07)", border: "1px solid rgba(61,202,122,0.2)",
            color: C.green, fontSize: 13, fontWeight: 600,
          }}>🎉 All job keywords found in your resume!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {missingSkills.map((skill, i) => (
              <SkillItem key={skill} skill={skill} matched={false} delay={i * baseDelay + 200}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
