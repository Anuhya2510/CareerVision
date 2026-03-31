// ─── KEYWORD SUGGESTIONS ─────────────────────────────────────────────────────
import { useState, useEffect } from "react";

const C = {
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  gold: "#D4AF37", goldDim: "#B8962E",
  green: "#3DCA7A", yellow: "#F5A623", red: "#F04444",
  card: "#16161F",
};

function KeywordChip({ keyword, delay, priority }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const priorityConfig = {
    high:   { color: C.red,    bg: "rgba(240,68,68,0.09)",   badge: "HIGH PRIORITY" },
    medium: { color: C.yellow, bg: "rgba(245,166,35,0.09)",  badge: "RECOMMENDED"  },
    low:    { color: C.gold,   bg: "rgba(212,175,55,0.09)",  badge: "BONUS"         },
  };
  const cfg = priorityConfig[priority] || priorityConfig.medium;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "9px 13px", borderRadius: 10,
      background: cfg.bg, border: `1px solid ${cfg.color}33`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(-12px)",
      transition: "opacity 0.35s ease, transform 0.35s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ color: cfg.color, fontSize: 14 }}>•</span>
        <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{keyword}</span>
      </div>
      <span style={{
        fontSize: 8, fontWeight: 700, color: cfg.color,
        background: `${cfg.color}18`, padding: "2px 6px", borderRadius: 8,
        border: `1px solid ${cfg.color}33`, letterSpacing: 0.5,
      }}>{cfg.badge}</span>
    </div>
  );
}

export default function KeywordSuggestions({ keywords = [], onCopy }) {
  const [copied, setCopied] = useState(false);

  if (keywords.length === 0) return null;

  // Assign priority buckets
  const withPriority = keywords.map((kw, i) => ({
    kw,
    priority: i < Math.ceil(keywords.length * 0.3) ? "high"
      : i < Math.ceil(keywords.length * 0.7) ? "medium"
      : "low",
  }));

  const handleCopy = () => {
    const text = keywords.join(", ");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      onCopy && onCopy(text);
    });
  };

  return (
    <div style={{
      background: C.card, borderRadius: 18,
      border: "1px solid rgba(212,175,55,0.15)", padding: "22px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
            💡 Recommended Keywords to Add
          </div>
          <div style={{ color: C.dim, fontSize: 11 }}>
            Add these to your resume to improve ATS compatibility
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: copied ? "rgba(61,202,122,0.1)" : "rgba(212,175,55,0.07)",
            border: `1px solid ${copied ? "rgba(61,202,122,0.3)" : "rgba(212,175,55,0.2)"}`,
            color: copied ? C.green : C.gold, cursor: "pointer", transition: "all 0.2s",
          }}
        >{copied ? "✓ Copied!" : "📋 Copy All"}</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {withPriority.map(({ kw, priority }, i) => (
          <KeywordChip key={kw} keyword={kw} delay={i * 70} priority={priority}/>
        ))}
      </div>

      <div style={{
        marginTop: 14, padding: "10px 14px", borderRadius: 9,
        background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.08)",
        color: C.dim, fontSize: 11, lineHeight: 1.6,
      }}>
        💡 <strong style={{ color: C.gold }}>Tip:</strong> Naturally weave these keywords into your work experience bullets,
        skills section, and professional summary for maximum ATS impact.
      </div>
    </div>
  );
}
