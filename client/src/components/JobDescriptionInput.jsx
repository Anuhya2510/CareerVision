// ─── JOB DESCRIPTION INPUT ───────────────────────────────────────────────────
import { useState } from "react";

const C = {
  gold: "#D4AF37", goldDim: "#B8962E",
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  green: "#3DCA7A",
};

export default function JobDescriptionInput({ value, onChange, compact = false }) {
  const [focused, setFocused] = useState(false);
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const EXAMPLES = [
    {
      label: "Frontend Role",
      text: `We are looking for a skilled Frontend Developer.
Requirements:
- 3+ years React experience
- Proficiency in JavaScript, TypeScript, HTML, CSS
- Experience with REST APIs and state management
- Knowledge of Git and Agile workflows
- Bonus: Next.js, GraphQL, Docker`,
    },
    {
      label: "Full Stack",
      text: `Senior Full Stack Engineer
Required Skills: React, Node.js, REST APIs, SQL, Docker, AWS, TypeScript, Git
- Design and implement scalable backend services
- Build responsive React UIs with great UX
- 5+ years experience in full stack development`,
    },
    {
      label: "Data Science",
      text: `Data Scientist role - Python, Machine Learning, TensorFlow, SQL, Statistics required.
Experience with data visualization, deep learning, cloud platforms (AWS/GCP) is a plus.
3-5 years minimum in a data-focused role.`,
    },
  ];

  return (
    <div style={{
      background: "#16161F", borderRadius: 16,
      border: `1px solid ${focused ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.1)"}`,
      padding: compact ? "16px" : "20px",
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
            Paste Job Description
          </div>
        </div>
        {value && (
          <span style={{ color: C.dim, fontSize: 10 }}>{wordCount} words</span>
        )}
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={"Paste the job description here to get:\n• Job Match Score (0–100%)\n• Matched vs Missing Skills\n• Keyword Suggestions\n• Resume Optimization Tips"}
        rows={compact ? 4 : 7}
        style={{
          width: "100%", padding: "11px 13px", borderRadius: 10, outline: "none",
          background: "#0A0A14", fontFamily: "inherit", resize: "vertical",
          border: "1px solid rgba(212,175,55,0.07)",
          color: C.text, fontSize: 13, lineHeight: 1.7, boxSizing: "border-box",
        }}
      />

      {/* Quick examples */}
      {!value && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: C.dim, fontSize: 10, marginBottom: 6 }}>Quick example:</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {EXAMPLES.map(ex => (
              <button
                key={ex.label}
                onClick={() => onChange(ex.text)}
                style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 10,
                  background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)",
                  color: C.muted, cursor: "pointer", fontFamily: "inherit",
                }}
              >{ex.label}</button>
            ))}
          </div>
        </div>
      )}

      {value && (
        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => onChange("")}
            style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 10,
              background: "rgba(240,68,68,0.06)", border: "1px solid rgba(240,68,68,0.2)",
              color: "#F04444", cursor: "pointer",
            }}
          >✕ Clear</button>
        </div>
      )}
    </div>
  );
}
