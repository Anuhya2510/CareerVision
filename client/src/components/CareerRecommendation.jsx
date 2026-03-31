// ─── CAREER PATH RECOMMENDATION ─────────────────────────────────────────────
// Real skill matching algorithm, animated cards, full career database

import { useState, useEffect } from "react";

const C = {
  bg: "#08080E", surface: "#111118", card: "#16161F",
  gold: "#D4AF37", goldLight: "#E8C547", goldDim: "#B8962E",
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  green: "#3DCA7A", yellow: "#F5A623", red: "#F04444",
  purple: "#9B7FE8", blue: "#5B9CF6",
};

// ── Career Database
const CAREERS = [
  {
    title: "Full Stack Developer",
    icon: "💻",
    requiredSkills: ["JavaScript", "React", "Node.js", "HTML", "CSS", "APIs", "SQL", "Git"],
    salaryRange: "$90K–$140K",
    growth: "High",
    description: "Build web applications end-to-end, from UI to backend APIs and databases.",
    category: "Engineering",
    demandLabel: "Very High Demand",
  },
  {
    title: "Frontend Developer",
    icon: "🎨",
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "Responsive Design"],
    salaryRange: "$75K–$120K",
    growth: "High",
    description: "Craft pixel-perfect, responsive user interfaces with modern frameworks.",
    category: "Engineering",
    demandLabel: "High Demand",
  },
  {
    title: "Backend Developer",
    icon: "⚙️",
    requiredSkills: ["Node.js", "Python", "SQL", "APIs", "Docker", "Authentication", "Git", "Databases"],
    salaryRange: "$85K–$135K",
    growth: "High",
    description: "Build scalable server-side logic, APIs, and data storage systems.",
    category: "Engineering",
    demandLabel: "High Demand",
  },
  {
    title: "Product Manager",
    icon: "🎯",
    requiredSkills: ["Communication", "Leadership", "Strategy", "Market Analysis", "Problem Solving", "Agile", "User Research"],
    salaryRange: "$100K–$160K",
    growth: "High",
    description: "Define product vision, prioritize features, and drive cross-functional teams toward goals.",
    category: "Product",
    demandLabel: "High Demand",
  },
  {
    title: "Data Analyst",
    icon: "📊",
    requiredSkills: ["SQL", "Excel", "Python", "Statistics", "Data Visualization", "Business Analysis", "Tableau"],
    salaryRange: "$65K–$110K",
    growth: "High",
    description: "Transform raw data into actionable business insights through analysis and visualization.",
    category: "Data",
    demandLabel: "Very High Demand",
  },
  {
    title: "Data Scientist",
    icon: "🔬",
    requiredSkills: ["Python", "Machine Learning", "Statistics", "SQL", "TensorFlow", "Data Visualization", "Deep Learning"],
    salaryRange: "$110K–$170K",
    growth: "High",
    description: "Apply ML and statistical models to solve complex business problems at scale.",
    category: "Data",
    demandLabel: "High Demand",
  },
  {
    title: "DevOps Engineer",
    icon: "🚀",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git", "Terraform", "Monitoring"],
    salaryRange: "$95K–$150K",
    growth: "High",
    description: "Automate infrastructure, deployments, and ensure systems run reliably at scale.",
    category: "Engineering",
    demandLabel: "Very High Demand",
  },
  {
    title: "Machine Learning Engineer",
    icon: "🤖",
    requiredSkills: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Docker", "SQL", "Statistics", "Cloud Platforms"],
    salaryRange: "$120K–$190K",
    growth: "High",
    description: "Design, build, and deploy production-grade machine learning systems.",
    category: "AI/ML",
    demandLabel: "Very High Demand",
  },
  {
    title: "UI/UX Designer",
    icon: "🖌️",
    requiredSkills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Accessibility", "CSS"],
    salaryRange: "$70K–$120K",
    growth: "Medium",
    description: "Design intuitive, beautiful experiences that users love through research and iteration.",
    category: "Design",
    demandLabel: "High Demand",
  },
  {
    title: "Cloud Solutions Architect",
    icon: "☁️",
    requiredSkills: ["AWS", "Azure", "Docker", "Kubernetes", "Terraform", "System Design", "Security", "Linux"],
    salaryRange: "$130K–$200K",
    growth: "High",
    description: "Design and implement scalable cloud infrastructure for enterprise systems.",
    category: "Engineering",
    demandLabel: "High Demand",
  },
  {
    title: "Cybersecurity Analyst",
    icon: "🛡️",
    requiredSkills: ["Network Security", "Penetration Testing", "Linux", "SIEM", "Risk Analysis", "Python", "Incident Response"],
    salaryRange: "$80K–$140K",
    growth: "High",
    description: "Protect systems, detect threats, and respond to security incidents.",
    category: "Security",
    demandLabel: "Very High Demand",
  },
  {
    title: "Technical Project Manager",
    icon: "📋",
    requiredSkills: ["Communication", "Leadership", "Agile", "Risk Management", "Problem Solving", "Stakeholder Management", "Planning"],
    salaryRange: "$95K–$145K",
    growth: "Medium",
    description: "Lead technical teams, manage timelines, and ensure successful project delivery.",
    category: "Management",
    demandLabel: "Moderate Demand",
  },
  {
    title: "Mobile Developer",
    icon: "📱",
    requiredSkills: ["React Native", "Swift", "Kotlin", "JavaScript", "APIs", "Git", "UI Design"],
    salaryRange: "$85K–$135K",
    growth: "High",
    description: "Build native and cross-platform mobile applications for iOS and Android.",
    category: "Engineering",
    demandLabel: "High Demand",
  },
  {
    title: "Business Analyst",
    icon: "💼",
    requiredSkills: ["Communication", "Data Analysis", "SQL", "Problem Solving", "Requirements Gathering", "Excel", "Stakeholder Management"],
    salaryRange: "$65K–$105K",
    growth: "Medium",
    description: "Bridge business goals with technical solutions through analysis and documentation.",
    category: "Business",
    demandLabel: "Moderate Demand",
  },
];

// ── Match score algorithm
function normSkill(s) {
  return s.toLowerCase().replace(/[.\-_]/g, " ").trim();
}

function computeCareerMatch(userSkillsRaw, career) {
  const userSkills = userSkillsRaw
    .split(/[,\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => normSkill(s));

  const matched = career.requiredSkills.filter(req => {
    const rn = normSkill(req);
    return userSkills.some(u => u.includes(rn) || rn.includes(u) || u === rn);
  });

  const missing = career.requiredSkills.filter(req => !matched.includes(req));
  const score = Math.round((matched.length / career.requiredSkills.length) * 100);

  return { score, matched, missing };
}

function getTopCareers(userSkills, interests, limit = 3) {
  const results = CAREERS.map(career => {
    const { score, matched, missing } = computeCareerMatch(userSkills, career);
    // Boost score slightly if career matches interests
    const interestBoost = interests
      ? [career.title, career.category, career.description].some(f =>
          interests.toLowerCase().split(/[,\s]+/).some(w => w.length > 2 && f.toLowerCase().includes(w))
        )
        ? 8
        : 0
      : 0;
    return {
      ...career,
      matchScore: Math.min(100, score + interestBoost),
      baseScore: score,
      matchedSkills: matched,
      missingSkills: missing,
    };
  });
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

function buildNextStep(career, missingSkills) {
  if (missingSkills.length === 0) return "You have all required skills! Polish your portfolio and start applying.";
  const top3 = missingSkills.slice(0, 3).join(", ");
  return `Learn ${top3} to significantly improve your ${career.title} match.`;
}

// ── Shared UI components
function Label({ children, style = {} }) {
  return <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8, ...style }}>{children}</div>;
}

function Tag({ children, color = C.gold, bg }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: bg || "rgba(212,175,55,0.1)", border: `1px solid ${color}33`, color,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const pri = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: "11px 24px", borderRadius: 10, fontWeight: 600, fontSize: 13.5,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily: "inherit",
        background: pri ? `linear-gradient(135deg,${C.gold},${C.goldDim})` : "rgba(212,175,55,0.06)",
        color: pri ? "#08080E" : C.gold,
        border: pri ? "none" : "1px solid rgba(212,175,55,0.25)",
        transition: "all 0.18s ease", display: "inline-flex", alignItems: "center", gap: 6, ...style,
      }}>{children}</button>
  );
}

function Inp({ placeholder, value, onChange, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <input placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: "100%", padding: "11px 14px", borderRadius: 10, outline: "none",
        background: "#0A0A14", fontFamily: "inherit",
        border: `1px solid ${focused ? "rgba(212,175,55,0.45)" : "rgba(212,175,55,0.1)"}`,
        color: C.text, fontSize: 13.5, transition: "all 0.18s", boxSizing: "border-box", ...style,
      }}
    />
  );
}

// ── Animated match score badge
function MatchBadge({ score }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = score / 40;
    const id = setInterval(() => {
      cur += step;
      if (cur >= score) { setDisplayed(score); clearInterval(id); }
      else setDisplayed(Math.floor(cur));
    }, 20);
    return () => clearInterval(id);
  }, [score]);

  const color = score >= 75 ? C.green : score >= 50 ? C.yellow : score >= 30 ? C.gold : C.red;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: 32, fontWeight: 900, color,
        fontFamily: "'Playfair Display', serif", lineHeight: 1,
        transition: "color 0.3s",
      }}>{displayed}%</div>
      <div style={{ color: C.dim, fontSize: 9, letterSpacing: 1.5, marginTop: 2 }}>MATCH</div>
    </div>
  );
}

// ── Match bar (animated fill)
function MatchBar({ score }) {
  const [width, setWidth] = useState(0);
  const color = score >= 75 ? C.green : score >= 50 ? C.yellow : score >= 30 ? C.gold : C.red;
  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 150);
    return () => clearTimeout(timer);
  }, [score]);
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
      <div style={{
        height: "100%", borderRadius: 2, background: color,
        width: `${width}%`, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `0 0 8px ${color}55`,
      }} />
    </div>
  );
}

// ── Career card
function CareerCard({ career, rank, index }) {
  const [expanded, setExpanded] = useState(index < 2);
  const GC = { High: C.green, Medium: C.yellow, Low: C.muted };
  const color = career.matchScore >= 75 ? C.green : career.matchScore >= 50 ? C.yellow : career.matchScore >= 30 ? C.gold : C.red;

  return (
    <div style={{
      background: C.card, borderRadius: 18,
      border: `1px solid ${career.matchScore >= 60 ? `${color}33` : "rgba(212,175,55,0.09)"}`,
      overflow: "hidden",
      boxShadow: career.matchScore >= 70 ? `0 0 24px ${color}15, 0 8px 32px rgba(0,0,0,0.3)` : "0 4px 20px rgba(0,0,0,0.25)",
      animation: `careerSlideUp 0.45s ease ${index * 0.1}s both`,
      transition: "all 0.3s ease",
    }}>
      {/* Card header — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: "20px 22px",
          cursor: "pointer",
          display: "flex", gap: 16, alignItems: "center",
          background: expanded ? "rgba(212,175,55,0.02)" : "transparent",
        }}
      >
        {/* Rank + icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `rgba(212,175,55,0.07)`, border: "1px solid rgba(212,175,55,0.15)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          flexShrink: 0, position: "relative",
        }}>
          <span style={{ fontSize: 22 }}>{career.icon}</span>
          <div style={{
            position: "absolute", top: -6, left: -6,
            width: 20, height: 20, borderRadius: "50%",
            background: rank === 1 ? C.gold : rank === 2 ? C.muted : C.dim,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color: "#08080E",
          }}>#{rank}</div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: C.text, fontWeight: 700, marginBottom: 3 }}>
            {career.title}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Tag color={GC[career.growth]} bg={`${GC[career.growth]}18`}>📈 {career.growth} Growth</Tag>
            <Tag color={C.gold}>💰 {career.salaryRange}</Tag>
          </div>
          <MatchBar score={career.matchScore} />
        </div>

        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 14 }}>
          <MatchBadge score={career.matchScore} />
          <div style={{ color: C.dim, fontSize: 14 }}>{expanded ? "▲" : "▼"}</div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: "0 22px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {/* Description */}
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginTop: 14, marginBottom: 14 }}>
            {career.description}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {/* Matched skills */}
            <div>
              <Label>✅ Skills You Have ({career.matchedSkills.length}/{career.requiredSkills.length})</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {career.matchedSkills.length > 0
                  ? career.matchedSkills.map(s => (
                      <Tag key={s} color={C.green} bg="rgba(61,202,122,0.1)">{s}</Tag>
                    ))
                  : <span style={{ color: C.muted, fontSize: 12 }}>None yet — start learning!</span>
                }
              </div>
            </div>

            {/* Missing skills */}
            <div>
              <Label>🎯 Skills to Learn ({career.missingSkills.length})</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {career.missingSkills.length > 0
                  ? career.missingSkills.slice(0, 4).map(s => (
                      <Tag key={s} color={C.red} bg="rgba(240,68,68,0.1)">{s}</Tag>
                    ))
                  : <Tag color={C.green} bg="rgba(61,202,122,0.1)">🎉 All skills covered!</Tag>
                }
                {career.missingSkills.length > 4 && (
                  <Tag color={C.muted}> +{career.missingSkills.length - 4} more</Tag>
                )}
              </div>
            </div>
          </div>

          {/* Next step */}
          <div style={{
            padding: "12px 16px", borderRadius: 10,
            background: `${color}0D`, border: `1px solid ${color}33`,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>→</span>
            <div>
              <div style={{ color: color, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 3 }}>NEXT STEP</div>
              <div style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>
                {buildNextStep(career, career.missingSkills)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component
export default function CareerRecommendation() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@keyframes careerSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const recommend = () => {
    if (!skills.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const careers = getTopCareers(skills, interests, 3);
      setResult(careers);
      setLoading(false);
    }, 600);
  };

  const GC = { High: C.green, Medium: C.yellow, Low: C.muted };

  return (
    <div style={{ padding: "28px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, marginBottom: 5 }}>
          Career Path Finder
        </h1>
        <p style={{ color: C.muted, fontSize: 14 }}>
          Real skill-matching against {CAREERS.length} career paths. Ranked by how well your profile fits.
        </p>
      </div>

      {/* Input */}
      {!result ? (
        <div style={{
          background: C.card, borderRadius: 18, border: "1px solid rgba(212,175,55,0.09)",
          padding: 24, marginBottom: 24,
        }}>
          <div style={{ marginBottom: 14 }}>
            <Label>Your Skills</Label>
            <Inp
              placeholder="e.g., JavaScript, React, HTML, CSS, Problem Solving, Communication"
              value={skills}
              onChange={e => setSkills(e.target.value)}
            />
            <div style={{ color: C.dim, fontSize: 11, marginTop: 6 }}>
              Tip: The more skills you list, the more accurate your matches will be.
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Label>Interests (Optional)</Label>
            <Inp
              placeholder="e.g., AI, finance, design, building products, helping people"
              value={interests}
              onChange={e => setInterests(e.target.value)}
            />
          </div>

          {/* Quick skill presets */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: C.dim, fontSize: 11, marginBottom: 8 }}>Quick fill with example profile:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {[
                { label: "Frontend Dev", skills: "HTML, CSS, JavaScript, React, Git, Figma" },
                { label: "Data Person", skills: "Python, SQL, Excel, Statistics, Tableau, Communication" },
                { label: "PM Profile", skills: "Communication, Leadership, Problem Solving, Agile, Market Analysis, Strategy" },
                { label: "Backend Dev", skills: "Node.js, Python, SQL, Docker, REST APIs, Git" },
              ].map(preset => (
                <button key={preset.label} onClick={() => setSkills(preset.skills)}
                  style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11,
                    background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)",
                    color: C.muted, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>{preset.label}</button>
              ))}
            </div>
          </div>

          <Btn onClick={recommend} disabled={!skills.trim() || loading}>
            {loading ? "Matching…" : "🚀 Find My Career Paths"}
          </Btn>
        </div>
      ) : (
        <div style={{ animation: "careerSlideUp 0.35s ease" }}>
          {/* Results header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.text, marginBottom: 4 }}>
                Top 3 Career Matches
              </div>
              <div style={{ color: C.muted, fontSize: 13 }}>
                Based on {skills.split(",").filter(s => s.trim()).length} skills · Sorted by fit score
              </div>
            </div>
            <Btn variant="secondary" onClick={() => { setResult(null); setSkills(""); setInterests(""); }}>
              🔄 New Search
            </Btn>
          </div>

          {/* Top career highlight */}
          {result[0] && (
            <div style={{
              padding: "14px 18px", borderRadius: 12, marginBottom: 18,
              background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ fontSize: 24 }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.gold, fontWeight: 700, fontSize: 14 }}>Best Match: {result[0].title}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                  {result[0].matchScore}% match · {result[0].matchedSkills.length}/{result[0].requiredSkills.length} skills covered
                </div>
              </div>
              <div style={{ color: C.gold, fontSize: 11 }}>{result[0].demandLabel}</div>
            </div>
          )}

          {/* Career cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {result.map((career, i) => (
              <CareerCard key={career.title} career={career} rank={i + 1} index={i} />
            ))}
          </div>

          {/* Insight footer */}
          <div style={{
            marginTop: 20, padding: "20px 24px", borderRadius: 16,
            background: "linear-gradient(135deg, rgba(22,22,31,1) 0%, rgba(16,16,24,1) 100%)",
            border: "1px solid rgba(212,175,55,0.12)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.gold, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                  {result[0]?.matchScore || 0}%
                </div>
                <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1.5, marginTop: 4 }}>BEST MATCH</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }}/>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.green, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                  {result[0]?.matchedSkills?.length || 0}
                </div>
                <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1.5, marginTop: 4 }}>SKILLS ALIGNED</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }}/>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.blue, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                  {result.filter(c => c.matchScore >= 50).length}
                </div>
                <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1.5, marginTop: 4 }}>VIABLE PATHS</div>
              </div>
            </div>

            {/* Next Skill to Learn — prominently displayed */}
            {result[0]?.missingSkills?.length > 0 && (
              <div style={{
                padding: "14px 18px", borderRadius: 12,
                background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ fontSize: 28 }}>🎯</div>
                <div>
                  <div style={{ color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Next Skill to Learn</div>
                  <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>
                    {result[0].missingSkills[0]}
                  </div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                    Learning this will boost your {result[0].title} match from {result[0].matchScore}% to ~{Math.min(100, result[0].matchScore + Math.round(100 / result[0].requiredSkills.length))}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
