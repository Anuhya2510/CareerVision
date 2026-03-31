// ─── SKILL GAP ANALYZER + SMART DAILY LEARNING PLAN ──────────────────────────
// Fully dynamic: real match scoring, animated day cards, progress tracking

import { useState, useEffect, useRef } from "react";

// ── Design tokens
const C = {
  bg: "#08080E", surface: "#111118", card: "#16161F",
  gold: "#D4AF37", goldLight: "#E8C547", goldDim: "#B8962E",
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  green: "#3DCA7A", yellow: "#F5A623", red: "#F04444",
  purple: "#9B7FE8", blue: "#5B9CF6",
};

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);

async function callClaude(prompt, maxTokens = 1200) {
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

// ── Role → Skills Database (for offline match scoring)
const ROLE_SKILLS_DB = {
  "frontend developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "Responsive Design", "REST APIs", "Testing"],
  "backend developer": ["Node.js", "Python", "SQL", "REST APIs", "Git", "Docker", "Authentication", "Databases", "System Design"],
  "full stack developer": ["JavaScript", "React", "Node.js", "HTML", "CSS", "SQL", "REST APIs", "Git", "Docker", "TypeScript"],
  "data scientist": ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization", "TensorFlow", "Pandas", "R", "Deep Learning"],
  "data analyst": ["SQL", "Excel", "Python", "Statistics", "Data Visualization", "Tableau", "Power BI", "Business Analysis"],
  "product manager": ["Communication", "Leadership", "Strategy", "Market Analysis", "Problem Solving", "Agile", "Roadmapping", "User Research"],
  "devops engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Monitoring", "Shell Scripting", "Git"],
  "ui ux designer": ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "CSS", "Accessibility", "Typography"],
  "machine learning engineer": ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Statistics", "Docker", "Cloud Platforms", "Data Pipelines"],
  "software engineer": ["Data Structures", "Algorithms", "Git", "Problem Solving", "System Design", "Testing", "Code Review", "APIs"],
};

// ── Learning resources per skill
const SKILL_RESOURCES = {
  TypeScript: { resource: "TypeScript Handbook (typescriptlang.org)", url: "https://typescriptlang.org/docs/handbook/intro.html" },
  "System Design": { resource: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer" },
  Docker: { resource: "Docker Official Docs + Play with Docker", url: "https://docs.docker.com/get-started/" },
  "Node.js": { resource: "Node.js Official Docs + The Odin Project", url: "https://nodejs.org/en/docs" },
  Python: { resource: "Python.org Tutorial + Automate the Boring Stuff", url: "https://docs.python.org/3/tutorial/" },
  SQL: { resource: "Mode Analytics SQL Tutorial", url: "https://mode.com/sql-tutorial/" },
  React: { resource: "React Official Docs (react.dev)", url: "https://react.dev/learn" },
  "Machine Learning": { resource: "fast.ai Practical Deep Learning", url: "https://course.fast.ai/" },
  AWS: { resource: "AWS Free Tier + AWS Skill Builder", url: "https://aws.amazon.com/training/" },
  Kubernetes: { resource: "Kubernetes.io Interactive Tutorial", url: "https://kubernetes.io/docs/tutorials/" },
  Figma: { resource: "Figma Official Academy", url: "https://help.figma.com/hc/en-us/categories/360002051613" },
  "Data Visualization": { resource: "D3.js Tutorials + Observable", url: "https://observablehq.com/@d3/learn-d3" },
  "REST APIs": { resource: "REST API Tutorial + Postman Learning Center", url: "https://www.postman.com/api-platform/api-documentation/" },
  Git: { resource: "Pro Git Book (git-scm.com)", url: "https://git-scm.com/book/en/v2" },
  Agile: { resource: "Agile Alliance Resources + Scrum Guide", url: "https://www.scrumguides.org/" },
  DEFAULT: { resource: "Coursera / YouTube / Official Documentation", url: "https://coursera.org" },
};

// ── Day count per skill (hard vs soft)
const HARD_SKILLS = new Set([
  "TypeScript", "System Design", "Docker", "Kubernetes", "AWS", "Node.js", "Python",
  "SQL", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Terraform",
  "React", "Vue", "Angular", "MongoDB", "PostgreSQL", "Redis", "GraphQL", "gRPC",
  "Data Structures", "Algorithms", "CI/CD", "Linux", "Shell Scripting", "Rust", "Go"
]);

function getDaysForSkill(skill) {
  return HARD_SKILLS.has(skill) ? 3 : 1;
}

// ── Normalize skill for matching
function normSkill(s) {
  return s.toLowerCase().replace(/[.\-_]/g, " ").trim();
}

// ── Match user skills against role
function computeMatch(userSkills, roleKey) {
  const required = ROLE_SKILLS_DB[roleKey] || [];
  if (required.length === 0) return { score: 0, matched: [], missing: required };
  const userNorm = userSkills.map(s => normSkill(s));
  const matched = required.filter(req => {
    const rn = normSkill(req);
    return userNorm.some(u => u.includes(rn) || rn.includes(u));
  });
  const missing = required.filter(req => !matched.includes(req));
  return {
    score: Math.round((matched.length / required.length) * 100),
    matched,
    missing,
  };
}

function findClosestRole(jobRole) {
  const jn = normSkill(jobRole);
  return Object.keys(ROLE_SKILLS_DB).find(k => jn.includes(k) || k.includes(jn)) || null;
}

// ── Daily plan generator
function generateDailyPlan(missingSkills) {
  let dayCounter = 1;
  const days = [];
  missingSkills.forEach(skill => {
    const numDays = getDaysForSkill(skill);
    const res = SKILL_RESOURCES[skill] || SKILL_RESOURCES.DEFAULT;
    for (let d = 0; d < numDays; d++) {
      const isFirstDay = d === 0;
      const tasks = isFirstDay
        ? [
            `Learn ${skill} fundamentals`,
            `Watch ${skill} crash course (YouTube / official docs)`,
            `Complete 2–3 beginner exercises`,
          ]
        : numDays === 3 && d === 1
        ? [
            `Build a small project using ${skill}`,
            `Read official documentation in depth`,
            `Solve 3 intermediate problems`,
          ]
        : [
            `Build a real-world ${skill} mini-project`,
            `Review and refactor yesterday's code`,
            `Add this skill to your portfolio / GitHub`,
          ];

      days.push({
        day: dayCounter,
        skill,
        tasks: tasks.map(t => ({ text: t, done: false })),
        estimatedTime: isFirstDay ? "1.5 hours" : "2 hours",
        resource: res.resource,
        url: res.url,
      });
      dayCounter++;
    }
  });
  return days;
}

// ── Shared UI
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16,
      border: "1px solid rgba(212,175,55,0.09)",
      padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      ...style,
    }}>{children}</div>
  );
}

function Label({ children, style = {} }) {
  return <div style={{ color: C.muted, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8, ...style }}>{children}</div>;
}

function Tag({ children, color = C.gold, bg }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: bg || `rgba(212,175,55,0.1)`, border: `1px solid ${color}33`, color,
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

// ── Animated ring score
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
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={resolvedColor} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={pct}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.05s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: C.text, fontWeight: 800, fontSize: size > 100 ? 26 : 20, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{val}</div>
        </div>
      </div>
      {label && <div style={{ color: C.muted, fontSize: 11, textAlign: "center" }}>{label}</div>}
    </div>
  );
}

// ── Animated progress bar
function ProgressBar({ completed, total, style = {} }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);
  const color = pct >= 80 ? C.green : pct >= 50 ? C.yellow : C.gold;
  return (
    <div style={style}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: C.muted, fontSize: 11 }}>{completed} / {total} tasks done</span>
        <span style={{ color, fontWeight: 700, fontSize: 12 }}>{displayed}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, background: color,
          width: `${displayed}%`, transition: "width 0.6s ease",
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}

// ── Task item with checkbox
function TaskItem({ task, onToggle, index }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px",
        borderRadius: 8, cursor: "pointer",
        background: task.done ? "rgba(61,202,122,0.06)" : "transparent",
        border: `1px solid ${task.done ? "rgba(61,202,122,0.2)" : "transparent"}`,
        transition: "all 0.2s ease",
        animation: `skillFadeUp 0.3s ease ${index * 0.07}s both`,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 5, border: `2px solid ${task.done ? C.green : "rgba(212,175,55,0.3)"}`,
        background: task.done ? C.green : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1, transition: "all 0.2s",
      }}>
        {task.done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{
        color: task.done ? C.muted : C.text, fontSize: 13, lineHeight: 1.5,
        textDecoration: task.done ? "line-through" : "none",
        transition: "all 0.2s",
      }}>{task.text}</span>
    </div>
  );
}

// ── Day card with sequential animation
function DayCard({ day, index, onToggleTask }) {
  const [expanded, setExpanded] = useState(index < 3);
  const completedCount = day.tasks.filter(t => t.done).length;
  const isComplete = completedCount === day.tasks.length;

  return (
    <div style={{
      background: isComplete ? "rgba(61,202,122,0.06)" : C.card,
      borderRadius: 14,
      border: `1px solid ${isComplete ? "rgba(61,202,122,0.3)" : "rgba(212,175,55,0.09)"}`,
      overflow: "hidden",
      transition: "all 0.3s ease",
      animation: `skillFadeUp 0.4s ease ${index * 0.08}s both`,
      boxShadow: isComplete ? "0 0 20px rgba(61,202,122,0.1)" : "0 4px 16px rgba(0,0,0,0.25)",
    }}>
      {/* Card Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
          cursor: "pointer",
          background: expanded ? "rgba(212,175,55,0.03)" : "transparent",
        }}
      >
        {/* Day badge */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: isComplete ? "rgba(61,202,122,0.15)" : "rgba(212,175,55,0.1)",
          border: `1px solid ${isComplete ? "rgba(61,202,122,0.3)" : "rgba(212,175,55,0.2)"}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <div style={{ color: C.muted, fontSize: 7, letterSpacing: 1.5, textTransform: "uppercase" }}>DAY</div>
          <div style={{ color: isComplete ? C.green : C.gold, fontWeight: 800, fontSize: 15, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{day.day}</div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>
            {isComplete && <span style={{ color: C.green }}>✓ </span>}
            {day.skill}
          </div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
            ⏱ {day.estimatedTime} · {completedCount}/{day.tasks.length} tasks
          </div>
        </div>

        {/* Mini progress */}
        <div style={{ width: 60 }}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: isComplete ? C.green : C.gold,
              width: `${(completedCount / day.tasks.length) * 100}%`,
              transition: "width 0.4s ease",
            }} />
          </div>
          <div style={{ color: isComplete ? C.green : C.muted, fontSize: 9, marginTop: 3, textAlign: "center" }}>
            {Math.round((completedCount / day.tasks.length) * 100)}%
          </div>
        </div>

        <div style={{ color: C.dim, fontSize: 16, marginLeft: 4 }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ marginTop: 12, marginBottom: 10 }}>
            <Label>Tasks</Label>
            {day.tasks.map((task, i) => (
              <TaskItem
                key={i}
                task={task}
                index={i}
                onToggle={() => onToggleTask(day.day - 1, i)}
              />
            ))}
          </div>

          {/* Resource link */}
          <div style={{
            padding: "10px 12px", borderRadius: 9,
            background: "rgba(91,156,246,0.08)", border: "1px solid rgba(91,156,246,0.18)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 14 }}>📚</span>
            <div>
              <div style={{ color: C.blue, fontSize: 11, fontWeight: 600 }}>Learning Resource</div>
              <a href={day.url} target="_blank" rel="noreferrer"
                style={{ color: "#A8C4F0", fontSize: 12, textDecoration: "none" }}
                onClick={e => e.stopPropagation()}>
                {day.resource}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Missing skill card with importance
function MissingSkillCard({ skill, importance, timeToLearn, index }) {
  const IC = { High: C.red, Medium: C.yellow, Low: C.green };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
      borderRadius: 10, background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
      animation: `skillFadeUp 0.3s ease ${index * 0.06}s both`,
      transition: "all 0.2s",
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: IC[importance] || C.muted, flexShrink: 0,
      }} />
      <span style={{ color: C.text, flex: 1, fontSize: 13.5 }}>{skill}</span>
      <Tag color={IC[importance] || C.muted} bg={`${IC[importance] || C.muted}18`}>{importance}</Tag>
      <span style={{ color: C.dim, fontSize: 12, minWidth: 70, textAlign: "right" }}>{timeToLearn}</span>
    </div>
  );
}

// ── Main SkillGap component
export default function SkillGap() {
  const [jobRole, setJobRole] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planDays, setPlanDays] = useState([]);
  const [activeTab, setActiveTab] = useState("gap"); // gap | plan

  // Inject CSS animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes skillFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      @keyframes planPulse { 0%,100% { opacity:0.7; } 50% { opacity:1; } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const FALLBACK = {
    matchScore: 55,
    matchedSkills: ["JavaScript", "Problem Solving", "Communication", "HTML", "CSS"],
    missingSkills: [
      { skill: "TypeScript", importance: "High", timeToLearn: "2–4 weeks" },
      { skill: "System Design", importance: "High", timeToLearn: "1–2 months" },
      { skill: "Docker", importance: "Medium", timeToLearn: "1 week" },
      { skill: "Node.js", importance: "High", timeToLearn: "3–4 weeks" },
      { skill: "REST APIs", importance: "Medium", timeToLearn: "1 week" },
    ],
    learningPath: [
      "Master TypeScript fundamentals",
      "Build a full-stack project with Node.js",
      "Study system design patterns",
      "Learn Docker and containerization",
    ],
    resources: [
      { name: "TypeScript Handbook", type: "Docs" },
      { name: "System Design Primer", type: "Book" },
      { name: "Docker Official Docs", type: "Docs" },
    ],
  };

  const analyze = async () => {
    if (!jobRole || !userSkills) return;
    setLoading(true);
    setResult(null);
    setDailyPlan(null);
    setPlanDays([]);
    setActiveTab("gap");

    // Client-side match first (instant feedback)
    const userSkillList = userSkills.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
    const roleKey = findClosestRole(jobRole);
    const localMatch = roleKey ? computeMatch(userSkillList, roleKey) : null;

    const safetyTimer = setTimeout(() => {
      if (localMatch) {
        setResult({
          matchScore: localMatch.score,
          matchedSkills: localMatch.matched,
          missingSkills: localMatch.missing.map(s => ({
            skill: s,
            importance: HARD_SKILLS.has(s) ? "High" : "Medium",
            timeToLearn: getDaysForSkill(s) > 1 ? "2–4 weeks" : "3–5 days",
          })),
          learningPath: localMatch.missing.slice(0, 4).map(s => `Learn ${s}`),
          resources: localMatch.missing.slice(0, 3).map(s => ({
            name: (SKILL_RESOURCES[s] || SKILL_RESOURCES.DEFAULT).resource,
            type: "Docs",
          })),
        });
      } else {
        setResult(FALLBACK);
      }
      setLoading(false);
    }, 13000);

    try {
      const raw = await withTimeout(
        callClaude(`Analyze skill gap for the role "${jobRole}". User has these skills: "${userSkills}".
Return ONLY compact JSON (no markdown):
{
  "matchScore": <0-100, percentage of required skills the user has>,
  "matchedSkills": [<list of matched skills from user's profile>],
  "missingSkills": [{"skill": "<name>", "importance": "High|Medium|Low", "timeToLearn": "<realistic estimate>"}],
  "learningPath": [<4 ordered steps to close the gap>],
  "resources": [{"name": "<resource name>", "type": "Course|Book|Docs|Practice"}]
}`),
        11000
      );
      clearTimeout(safetyTimer);
      const p = parseJSON(raw);
      if (typeof p.matchScore === "number" && Array.isArray(p.missingSkills)) {
        setResult(p);
      } else {
        setResult(localMatch ? {
          matchScore: localMatch.score,
          matchedSkills: localMatch.matched,
          missingSkills: localMatch.missing.map(s => ({ skill: s, importance: HARD_SKILLS.has(s) ? "High" : "Medium", timeToLearn: "2–3 weeks" })),
          learningPath: localMatch.missing.slice(0, 4).map(s => `Learn ${s}`),
          resources: [],
        } : FALLBACK);
      }
    } catch {
      clearTimeout(safetyTimer);
      setResult(localMatch ? {
        matchScore: localMatch.score,
        matchedSkills: localMatch.matched,
        missingSkills: localMatch.missing.map(s => ({
          skill: s,
          importance: HARD_SKILLS.has(s) ? "High" : "Medium",
          timeToLearn: getDaysForSkill(s) > 1 ? "2–4 weeks" : "3–5 days",
        })),
        learningPath: localMatch.missing.slice(0, 4).map(s => `Learn ${s}`),
        resources: [],
      } : FALLBACK);
    }
    setLoading(false);
  };

  const generatePlan = async () => {
    if (!result) return;
    setGeneratingPlan(true);
    setActiveTab("plan");

    const missingSkillNames = result.missingSkills.map(s => s.skill);
    const days = generateDailyPlan(missingSkillNames);
    setPlanDays(days);
    setDailyPlan({ totalDays: days.length, skills: missingSkillNames });
    setGeneratingPlan(false);
  };

  const toggleTask = (dayIndex, taskIndex) => {
    setPlanDays(prev => prev.map((day, di) =>
      di !== dayIndex ? day : {
        ...day,
        tasks: day.tasks.map((task, ti) =>
          ti !== taskIndex ? task : { ...task, done: !task.done }
        ),
      }
    ));
  };

  const totalTasks = planDays.reduce((s, d) => s + d.tasks.length, 0);
  const completedTasks = planDays.reduce((s, d) => s + d.tasks.filter(t => t.done).length, 0);

  const matchColor = result
    ? result.matchScore >= 75 ? C.green : result.matchScore >= 50 ? C.yellow : C.red
    : C.gold;

  const IC = { High: C.red, Medium: C.yellow, Low: C.green };

  return (
    <div style={{ padding: "28px", maxWidth: 920, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, marginBottom: 5 }}>
          Skill Gap Analyzer
        </h1>
        <p style={{ color: C.muted, fontSize: 14 }}>
          See exactly what's missing — then generate a personalized daily learning plan.
        </p>
      </div>

      {/* Input */}
      {!result ? (
        <div style={{
          background: C.card, borderRadius: 18, border: "1px solid rgba(212,175,55,0.09)",
          padding: 24, marginBottom: 24,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <Label>Target Role</Label>
              <Inp
                placeholder="e.g., Full Stack Developer"
                value={jobRole}
                onChange={e => setJobRole(e.target.value)}
              />
            </div>
            <div>
              <Label>Your Current Skills</Label>
              <Inp
                placeholder="e.g., JavaScript, HTML, CSS, React"
                value={userSkills}
                onChange={e => setUserSkills(e.target.value)}
              />
            </div>
          </div>

          {/* Quick role suggestions */}
          <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 7 }}>
            {["Full Stack Developer", "Data Analyst", "Product Manager", "DevOps Engineer", "UI UX Designer"].map(role => (
              <button key={role} onClick={() => setJobRole(role)}
                style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 11,
                  background: jobRole === role ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.05)",
                  border: `1px solid ${jobRole === role ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.12)"}`,
                  color: jobRole === role ? C.gold : C.muted, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>{role}</button>
            ))}
          </div>

          <Btn onClick={analyze} disabled={!jobRole || !userSkills || loading}>
            {loading ? "Analyzing…" : "🔍 Analyze Skill Gap"}
          </Btn>
        </div>
      ) : (
        <>
          {/* Tab navigation */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 12, padding: 4, width: "fit-content" }}>
            {[
              { k: "gap", l: "📊 Gap Analysis" },
              { k: "plan", l: "📅 Daily Learning Plan" },
            ].map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k)} style={{
                padding: "8px 18px", borderRadius: 9, border: "none", cursor: "pointer",
                fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
                background: activeTab === t.k ? `linear-gradient(135deg,${C.gold},${C.goldDim})` : "transparent",
                color: activeTab === t.k ? "#08080E" : C.muted, transition: "all 0.18s",
              }}>{t.l}</button>
            ))}
          </div>

          {/* ── GAP ANALYSIS TAB */}
          {activeTab === "gap" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "skillFadeUp 0.35s ease" }}>
              {/* Score + matched skills */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16 }}>
                <Card style={{ textAlign: "center", minWidth: 170, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <RingScore target={result.matchScore} label="Role Match" color={matchColor} size={110} />
                  <div style={{ marginTop: 12 }}>
                    <div style={{
                      padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${matchColor}18`, color: matchColor, border: `1px solid ${matchColor}44`,
                      display: "inline-block",
                    }}>
                      {result.matchScore >= 75 ? "✅ Strong Match" : result.matchScore >= 50 ? "⚡ Close Match" : "🌱 Skills Needed"}
                    </div>
                  </div>
                </Card>

                <Card>
                  <Label>✅ Skills You Already Have ({result.matchedSkills?.length || 0})</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                    {result.matchedSkills?.map(s => (
                      <Tag key={s} color={C.green} bg="rgba(61,202,122,0.1)">{s}</Tag>
                    ))}
                    {(!result.matchedSkills || result.matchedSkills.length === 0) && (
                      <span style={{ color: C.muted, fontSize: 13 }}>No exact matches found — add more skills above.</span>
                    )}
                  </div>
                  <Label>Learning Path</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {result.learningPath?.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%", background: "rgba(212,175,55,0.12)",
                          color: C.gold, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, flexShrink: 0, marginTop: 1,
                        }}>{i + 1}</div>
                        <span style={{ color: "#D0D0D8", fontSize: 13 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Missing skills */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <Label style={{ marginBottom: 0 }}>
                    🎯 Skills to Learn ({result.missingSkills?.length || 0} missing)
                  </Label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["High", "Medium", "Low"].map(imp => (
                      <div key={imp} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: IC[imp] }} />
                        <span style={{ color: C.dim, fontSize: 10 }}>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.missingSkills?.map((s, i) => (
                    <MissingSkillCard key={i} skill={s.skill} importance={s.importance} timeToLearn={s.timeToLearn} index={i} />
                  ))}
                  {(!result.missingSkills || result.missingSkills.length === 0) && (
                    <div style={{ textAlign: "center", padding: 20, color: C.green, fontSize: 15, fontWeight: 600 }}>
                      🏆 You already have all required skills for this role!
                    </div>
                  )}
                </div>
              </Card>

              {/* Resources */}
              {result.resources?.length > 0 && (
                <Card>
                  <Label>📚 Recommended Resources</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {result.resources.map((r, i) => (
                      <div key={i} style={{
                        padding: "8px 14px", borderRadius: 10,
                        background: "rgba(91,156,246,0.07)", border: "1px solid rgba(91,156,246,0.18)",
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                        <Tag color={C.blue} bg="rgba(91,156,246,0.12)">{r.type}</Tag>
                        <span style={{ color: C.text, fontSize: 13 }}>{r.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Generate plan button */}
              {result.missingSkills?.length > 0 && (
                <div style={{
                  padding: "20px 24px", borderRadius: 16,
                  background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 14,
                }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                      📅 Ready to close the gap?
                    </div>
                    <div style={{ color: C.muted, fontSize: 13 }}>
                      Generate a structured daily plan across {result.missingSkills.reduce((s, sk) => s + getDaysForSkill(sk.skill), 0)} days for {result.missingSkills.length} missing skills.
                    </div>
                  </div>
                  <Btn onClick={generatePlan} disabled={generatingPlan}>
                    {generatingPlan ? "Generating…" : "📅 Generate Daily Plan"}
                  </Btn>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="secondary" onClick={() => { setResult(null); setJobRole(""); setUserSkills(""); setDailyPlan(null); setPlanDays([]); }}>
                  🔄 Analyze Another Role
                </Btn>
              </div>
            </div>
          )}

          {/* ── DAILY PLAN TAB */}
          {activeTab === "plan" && (
            <div style={{ animation: "skillFadeUp 0.35s ease" }}>
              {generatingPlan ? (
                <Card style={{ textAlign: "center", padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 14, animation: "planPulse 1.5s ease infinite" }}>📅</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text, marginBottom: 8 }}>
                    Building Your Learning Plan…
                  </div>
                  <div style={{ color: C.gold, fontSize: 13 }}>
                    Creating day-by-day roadmap for {result?.missingSkills?.length || 0} skills
                  </div>
                </Card>
              ) : planDays.length === 0 ? (
                <Card style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 44, marginBottom: 14 }}>📅</div>
                  <div style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No Plan Generated Yet</div>
                  <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Go to Gap Analysis and click "Generate Daily Plan"</div>
                  <Btn onClick={() => setActiveTab("gap")}>← Back to Gap Analysis</Btn>
                </Card>
              ) : (
                <>
                  {/* Plan header */}
                  <Card style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.text, marginBottom: 4 }}>
                          {dailyPlan?.totalDays}-Day Learning Roadmap
                        </div>
                        <div style={{ color: C.muted, fontSize: 13 }}>
                          Covering {dailyPlan?.skills?.length} skills · {totalTasks} total tasks
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: C.green, fontFamily: "'Playfair Display', serif" }}>
                            {completedTasks}
                          </div>
                          <div style={{ color: C.muted, fontSize: 10 }}>DONE</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: C.muted, fontFamily: "'Playfair Display', serif" }}>
                            {totalTasks - completedTasks}
                          </div>
                          <div style={{ color: C.muted, fontSize: 10 }}>LEFT</div>
                        </div>
                      </div>
                    </div>
                    <ProgressBar completed={completedTasks} total={totalTasks} />
                  </Card>

                  {/* Skills summary row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {dailyPlan?.skills?.map((skill, i) => {
                      const skillDays = planDays.filter(d => d.skill === skill);
                      const skillDone = skillDays.every(d => d.tasks.every(t => t.done));
                      return (
                        <div key={i} style={{
                          padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                          background: skillDone ? "rgba(61,202,122,0.12)" : "rgba(212,175,55,0.07)",
                          border: `1px solid ${skillDone ? "rgba(61,202,122,0.3)" : "rgba(212,175,55,0.18)"}`,
                          color: skillDone ? C.green : C.gold,
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          {skillDone ? "✓" : "○"} {skill}
                          <span style={{ color: skillDone ? C.green : C.dim, fontSize: 10 }}>
                            ({skillDays.length}d)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Day cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {planDays.map((day, i) => (
                      <DayCard key={day.day} day={day} index={i} onToggleTask={toggleTask} />
                    ))}
                  </div>

                  {/* Completion message */}
                  {completedTasks === totalTasks && totalTasks > 0 && (
                    <div style={{
                      marginTop: 20, padding: "20px 24px", borderRadius: 16,
                      background: "rgba(61,202,122,0.08)", border: "1px solid rgba(61,202,122,0.3)",
                      textAlign: "center", animation: "skillFadeUp 0.5s ease",
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.green, marginBottom: 6 }}>
                        Plan Complete!
                      </div>
                      <div style={{ color: C.muted, fontSize: 13 }}>
                        You've finished your learning roadmap. You're now significantly closer to landing the role.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
