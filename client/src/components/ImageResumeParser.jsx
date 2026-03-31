// ─── IMAGE RESUME PARSER — Tesseract.js OCR ───────────────────────────────────
import { useState, useRef, useEffect } from "react";

const C = {
  bg: "#08080E", surface: "#111118", card: "#16161F",
  gold: "#D4AF37", goldLight: "#E8C547", goldDim: "#B8962E",
  text: "#E8E8F0", muted: "#888899", dim: "#3A3A4E",
  green: "#3DCA7A", yellow: "#F5A623", red: "#F04444",
  blue: "#5B9CF6",
};

const OCR_STEPS = [
  { id: "load",    icon: "📷", label: "Loading image…"           },
  { id: "detect",  icon: "🔍", label: "Detecting text regions…" },
  { id: "extract", icon: "⚡", label: "Extracting characters…"   },
  { id: "format",  icon: "📄", label: "Formatting resume text…"  },
];

function OcrPipeline({ current }) {
  const idx = OCR_STEPS.findIndex(s => s.id === current);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "16px 0" }}>
      {OCR_STEPS.map((step, i) => {
        const done   = i < idx;
        const active = step.id === current;
        return (
          <div key={step.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: 9, transition: "all 0.3s",
            background: active ? "rgba(212,175,55,0.08)" : done ? "rgba(61,202,122,0.05)" : "transparent",
            border: `1px solid ${active ? "rgba(212,175,55,0.25)" : done ? "rgba(61,202,122,0.15)" : "rgba(255,255,255,0.04)"}`,
          }}>
            <span style={{ fontSize: 14 }}>{done ? "✓" : step.icon}</span>
            <span style={{
              color: done ? C.green : active ? C.gold : C.dim,
              fontSize: 12.5, fontWeight: done || active ? 600 : 400,
            }}>{step.label}</span>
            {active && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: "50%", background: C.gold,
                    animation: `imgOcrBounce 0.9s ease-in-out ${i*0.2}s infinite`,
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

export default function ImageResumeParser({ onTextExtracted, onError }) {
  const [phase, setPhase]       = useState("idle"); // idle | dragging | ocr | done | error
  const [ocrStep, setOcrStep]   = useState(null);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview]   = useState(null);
  const [errMsg, setErrMsg]     = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes imgOcrBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes imgFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      @keyframes imgPulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
      @keyframes imgScan {
        0%   { top: 0;   opacity: 1; }
        90%  { top: 100%; opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  const loadTesseract = () =>
    new Promise((resolve, reject) => {
      if (window.Tesseract) { resolve(window.Tesseract); return; }
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      s.onload  = () => resolve(window.Tesseract);
      s.onerror = () => reject(new Error("Failed to load Tesseract.js"));
      document.head.appendChild(s);
    });

  const runOcr = async (file) => {
    setPhase("ocr");
    setProgress(0);

    // Show preview
    const url = URL.createObjectURL(file);
    setPreview(url);

    try {
      setOcrStep("load");
      await new Promise(r => setTimeout(r, 400));

      const Tesseract = await loadTesseract();
      setOcrStep("detect");
      await new Promise(r => setTimeout(r, 500));

      setOcrStep("extract");

      const worker = await Tesseract.createWorker("eng", 1, {
        logger: m => {
          if (m.status === "recognizing text") {
            setProgress(Math.round((m.progress || 0) * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setOcrStep("format");
      await new Promise(r => setTimeout(r, 400));

      const cleaned = text
        .replace(/\f/g, "\n")
        .replace(/[ \t]{3,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (!cleaned || cleaned.length < 30) {
        throw new Error("Could not extract readable text from this image. Try a clearer screenshot.");
      }

      setPhase("done");
      onTextExtracted && onTextExtracted(cleaned, file.name);
    } catch (err) {
      setPhase("error");
      setErrMsg(err.message || "OCR failed. Please try a clearer image.");
      onError && onError(err.message);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["png", "jpg", "jpeg", "webp"].includes(ext)) {
      setPhase("error");
      setErrMsg("Please upload a PNG, JPG, or JPEG image.");
      return;
    }
    runOcr(file);
  };

  const handleDrop = e => {
    e.preventDefault();
    setPhase("idle");
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setPhase("idle");
    setOcrStep(null);
    setProgress(0);
    setPreview(null);
    setErrMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── OCR Running ──────────────────────────────────────────────────────────
  if (phase === "ocr") return (
    <div style={{
      padding: "20px 22px", borderRadius: 16,
      background: C.card, border: "1px solid rgba(212,175,55,0.15)",
      animation: "imgFadeUp 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 22, animation: "imgPulse 1.5s ease infinite" }}>🔍</span>
        <div>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 14 }}>Extracting text from screenshot…</div>
          <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>OCR engine running — please wait</div>
        </div>
      </div>

      {/* Preview + scan animation */}
      {preview && (
        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", maxHeight: 160, marginBottom: 12 }}>
          <img src={preview} alt="preview" style={{ width: "100%", objectFit: "cover", display: "block", opacity: 0.6 }}/>
          <div style={{
            position: "absolute", left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            animation: "imgScan 2s linear infinite",
          }}/>
        </div>
      )}

      <OcrPipeline current={ocrStep}/>

      {/* Progress bar */}
      {progress > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: C.dim, fontSize: 11 }}>Recognition progress</span>
            <span style={{ color: C.gold, fontSize: 11, fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg,${C.goldDim},${C.gold})`,
              width: `${progress}%`, transition: "width 0.3s ease",
            }}/>
          </div>
        </div>
      )}
    </div>
  );

  // ── Done ─────────────────────────────────────────────────────────────────
  if (phase === "done") return (
    <div style={{
      padding: "14px 18px", borderRadius: 14,
      background: "rgba(61,202,122,0.07)", border: "1px solid rgba(61,202,122,0.25)",
      display: "flex", alignItems: "center", gap: 12, animation: "imgFadeUp 0.3s ease",
    }}>
      <span style={{ fontSize: 20 }}>✅</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>Text extracted from screenshot!</div>
        <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Resume content is ready for analysis</div>
      </div>
      <button onClick={reset} style={{
        padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(61,202,122,0.3)",
        background: "transparent", color: C.green, fontSize: 11, cursor: "pointer",
      }}>Change</button>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (phase === "error") return (
    <div style={{
      padding: "14px 18px", borderRadius: 14,
      background: "rgba(240,68,68,0.07)", border: "1px solid rgba(240,68,68,0.25)",
      animation: "imgFadeUp 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span style={{ color: C.red, fontWeight: 700, fontSize: 13 }}>OCR Failed</span>
      </div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>{errMsg}</div>
      <button onClick={reset} style={{
        padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(240,68,68,0.3)",
        background: "rgba(240,68,68,0.08)", color: C.red, fontSize: 12, cursor: "pointer",
      }}>Try Again</button>
    </div>
  );

  // ── Idle upload zone ─────────────────────────────────────────────────────
  return (
    <div
      onDragOver={e => { e.preventDefault(); setPhase("dragging"); }}
      onDragLeave={() => setPhase("idle")}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      style={{
        border: `2px dashed ${phase === "dragging" ? C.blue : "rgba(91,156,246,0.25)"}`,
        borderRadius: 14, padding: "22px 18px", textAlign: "center",
        cursor: "pointer", transition: "all 0.2s",
        background: phase === "dragging" ? "rgba(91,156,246,0.05)" : "rgba(22,22,31,0.4)",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/*"
        onChange={e => handleFile(e.target.files?.[0])}
        style={{ display: "none" }}
      />
      <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        Upload Resume Screenshot
      </div>
      <div style={{ color: C.dim, fontSize: 11, marginBottom: 10 }}>
        PNG, JPG, JPEG — OCR will extract text automatically
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {["PNG","JPG","JPEG"].map(f => (
          <span key={f} style={{
            padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500,
            background: "rgba(91,156,246,0.1)", border: "1px solid rgba(91,156,246,0.2)", color: C.blue,
          }}>{f}</span>
        ))}
      </div>
    </div>
  );
}
