import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "mainlync_operator_setup";

export function getOperatorSetup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveOperatorSetup(cfg) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cfg, savedAt: new Date().toISOString() })); } catch {}
}

const TOTAL_STEPS = 8;

const SLIDE = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
};

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#007aff", fontSize: 15, marginBottom: 32, display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter', sans-serif", padding: 0 }}>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M8 1L2 7l6 6" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Back
    </button>
  );
}

function ProgressBar({ step }) {
  return (
    <div style={{ padding: "16px 24px 0" }}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: "#000" }} />
      </div>
      <div style={{ fontSize: 11, color: "#8e8e93", marginTop: 6, fontWeight: 500 }}>Step {step} of {TOTAL_STEPS}</div>
    </div>
  );
}

function OptionCard({ options, value, onChange }) {
  return (
    <div className="card-group">
      {options.map((opt, i) => (
        <button key={opt.id} onClick={() => onChange(opt.id)}
          className="row"
          style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "left", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: value === opt.id ? "#000" : "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={value === opt.id ? "#fff" : "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={opt.icon} />
              </svg>
            </div>
            <div>
              <div className="row-title">{opt.label}</div>
              {opt.sub && <div className="row-sub">{opt.sub}</div>}
            </div>
          </div>
          {value === opt.id && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          )}
        </button>
      ))}
    </div>
  );
}

export default function OperatorOnboarding({ onDone }) {
  const [step, setStep]         = useState(1);
  const [direction, setDir]     = useState(1);
  const [cfg, setCfg]           = useState({
    propertyName: "",
    propertyType: "",
    unitCount: "",
    focusAreas: [],
    teamSize: "",
    notifyUrgent: true,
    notifyDigest: false,
    currency: "USD",
  });

  function next() { setDir(1); setStep(s => s + 1); }
  function back() { setDir(-1); setStep(s => s - 1); }
  function set(key, val) { setCfg(c => ({ ...c, [key]: val })); }
  function toggleFocus(id) {
    setCfg(c => ({
      ...c,
      focusAreas: c.focusAreas.includes(id)
        ? c.focusAreas.filter(x => x !== id)
        : [...c.focusAreas, id],
    }));
  }

  const slideVariants = {
    initial: { opacity: 0, x: direction * 40 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: direction * -40 },
  };

  const wrap = (content) => (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", display: "flex", flexDirection: "column", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <ProgressBar step={step} />
      <AnimatePresence mode="wait">
        <motion.div key={step} variants={slideVariants} initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.22 }}
          style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 24px 40px", overflowY: "auto" }}>
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // Step 1 — Welcome
  if (step === 1) return wrap(
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 48, marginTop: 16 }}>
        <div style={{ width: 52, height: 52, background: "#000", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.2 }}>Set up your property.</h1>
      <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 40, lineHeight: 1.6 }}>We'll personalize Mainlync for how you operate. Takes about 2 minutes.</p>
      <div className="card-group" style={{ marginBottom: 24 }}>
        {[
          { icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10", label: "Property profile", sub: "Name, type, and unit count" },
          { icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", label: "Team & focus areas", sub: "What matters most to you" },
          { icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0", label: "Notification preferences", sub: "Alerts and daily digest" },
        ].map(item => (
          <div key={item.label} className="row">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
            </div>
            <div>
              <div className="row-title">{item.label}</div>
              <div className="row-sub">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px 48px", background: "#f2f2f7", display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={next} className="btn-primary">Get started</button>
        <button onClick={() => onDone(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#007aff", fontSize: 15, fontWeight: 500, fontFamily: "'Inter', sans-serif", padding: "10px 0" }}>← Back to role selection</button>
      </div>
    </>
  );

  // Step 2 — Property name
  if (step === 2) return wrap(
    <>
      <BackBtn onClick={back} />
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>What's your property called?</h1>
      <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 32, lineHeight: 1.5 }}>This is how it'll appear across the app.</p>
      <input autoFocus className="input-field"
        placeholder="e.g. Riverside Gardens"
        value={cfg.propertyName}
        onChange={e => set("propertyName", e.target.value)}
        onKeyDown={e => e.key === "Enter" && cfg.propertyName.trim() && next()}
        style={{ marginBottom: 48, fontSize: 20, fontWeight: 500 }}
      />
      <div style={{ marginTop: "auto" }}>
        <button onClick={next} disabled={!cfg.propertyName.trim()} className="btn-primary">Continue</button>
      </div>
    </>
  );

  // Step 3 — Property type
  if (step === 3) return wrap(
    <>
      <BackBtn onClick={back} />
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>What type of property?</h1>
      <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 24, lineHeight: 1.5 }}>Helps us tailor workflows and defaults.</p>
      <OptionCard
        value={cfg.propertyType}
        onChange={v => { set("propertyType", v); setTimeout(next, 180); }}
        options={[
          { id: "apartment",  label: "Apartment Complex",   sub: "Multi-family residential",  icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
          { id: "mixed",      label: "Mixed-Use",           sub: "Residential + commercial",  icon: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0-2-2h-4a2 2 0 0 0-2 2v16" },
          { id: "commercial", label: "Commercial Building",  sub: "Office, retail, or industrial", icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0" },
          { id: "hoa",        label: "HOA / Community",     sub: "Townhomes, condos, or PUD",  icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
        ]}
      />
    </>
  );

  // Step 4 — Unit count
  if (step === 4) return wrap(
    <>
      <BackBtn onClick={back} />
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>How many units?</h1>
      <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 24, lineHeight: 1.5 }}>Approximate is fine.</p>
      <OptionCard
        value={cfg.unitCount}
        onChange={v => { set("unitCount", v); setTimeout(next, 180); }}
        options={[
          { id: "1-25",    label: "1 – 25 units",    sub: "Small portfolio",   icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
          { id: "26-100",  label: "26 – 100 units",  sub: "Mid-size",          icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
          { id: "101-300", label: "101 – 300 units",  sub: "Large community",   icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
          { id: "300+",    label: "300+ units",       sub: "Enterprise scale",  icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
        ]}
      />
    </>
  );

  // Step 5 — Focus areas (multi-select)
  if (step === 5) return wrap(
    <>
      <BackBtn onClick={back} />
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>What do you focus on?</h1>
      <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 24, lineHeight: 1.5 }}>Select all that apply — we'll surface these first.</p>
      <div className="card-group" style={{ marginBottom: 32 }}>
        {[
          { id: "maintenance",  label: "Maintenance & repairs",   icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
          { id: "leasing",      label: "Leasing & occupancy",     icon: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0-2-2h-4a2 2 0 0 0-2 2v16" },
          { id: "budget",       label: "Budget & expenses",       icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
          { id: "compliance",   label: "Compliance & inspections",icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
          { id: "residents",    label: "Resident relations",      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
        ].map(item => {
          const active = cfg.focusAreas.includes(item.id);
          return (
            <button key={item.id} onClick={() => toggleFocus(item.id)}
              className="row"
              style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "left", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? "#000" : "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                </div>
                <div className="row-title">{item.label}</div>
              </div>
              {active && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: "auto" }}>
        <button onClick={next} disabled={cfg.focusAreas.length === 0} className="btn-primary">Continue</button>
      </div>
    </>
  );

  // Step 6 — Team size
  if (step === 6) return wrap(
    <>
      <BackBtn onClick={back} />
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>How big is your team?</h1>
      <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 24, lineHeight: 1.5 }}>Maintenance, leasing, and admin staff combined.</p>
      <OptionCard
        value={cfg.teamSize}
        onChange={v => { set("teamSize", v); setTimeout(next, 180); }}
        options={[
          { id: "solo",  label: "Just me",        sub: "Solo operator",        icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
          { id: "2-5",   label: "2 – 5 people",   sub: "Small team",           icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
          { id: "6-15",  label: "6 – 15 people",  sub: "Mid-size team",        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
          { id: "16+",   label: "16+ people",      sub: "Large team",           icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
        ]}
      />
    </>
  );

  // Step 7 — Notifications
  if (step === 7) return wrap(
    <>
      <BackBtn onClick={back} />
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>Stay in the loop.</h1>
      <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 24, lineHeight: 1.5 }}>Choose how Mainlync keeps you informed.</p>
      <div className="card-group" style={{ marginBottom: 32 }}>
        {[
          { key: "notifyUrgent", label: "Urgent alerts",     sub: "Critical work orders, overdue items" },
          { key: "notifyDigest", label: "Daily digest",       sub: "Morning summary of open items" },
        ].map(item => (
          <button key={item.key} onClick={() => set(item.key, !cfg[item.key])}
            className="row"
            style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "left", justifyContent: "space-between" }}>
            <div>
              <div className="row-title">{item.label}</div>
              <div className="row-sub">{item.sub}</div>
            </div>
            <div style={{ width: 44, height: 26, borderRadius: 13, background: cfg[item.key] ? "#000" : "#e5e5ea", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: cfg[item.key] ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: "auto" }}>
        <button onClick={next} className="btn-primary">Continue</button>
      </div>
    </>
  );

  // Step 8 — Done
  if (step === 8) return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", display: "flex", flexDirection: "column", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <ProgressBar step={8} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 24px 40px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32, marginTop: 16 }}>
          <div style={{ width: 64, height: 64, background: "#000", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>You're all set.</h1>
        <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 32, lineHeight: 1.6 }}>Here's a summary of your setup for <strong style={{ color: "#000" }}>{cfg.propertyName}</strong>.</p>
        <div className="card-group" style={{ marginBottom: 24 }}>
          {[
            { label: "Property",    value: cfg.propertyName },
            { label: "Type",        value: { apartment: "Apartment Complex", mixed: "Mixed-Use", commercial: "Commercial Building", hoa: "HOA / Community" }[cfg.propertyType] || cfg.propertyType },
            { label: "Units",       value: cfg.unitCount },
            { label: "Team",        value: { solo: "Just me", "2-5": "2 – 5 people", "6-15": "6 – 15 people", "16+": "16+ people" }[cfg.teamSize] || cfg.teamSize },
            { label: "Focus areas", value: cfg.focusAreas.length + " selected" },
          ].map(row => (
            <div key={row.label} className="row" style={{ justifyContent: "space-between" }}>
              <div className="row-sub" style={{ fontSize: 13 }}>{row.label}</div>
              <div className="row-title" style={{ fontSize: 13 }}>{row.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto" }}>
          <button onClick={() => onDone(cfg)} className="btn-primary">Open Mainlync</button>
        </div>
      </motion.div>
    </div>
  );

  return null;
}
