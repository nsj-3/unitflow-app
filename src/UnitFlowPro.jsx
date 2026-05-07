/**
 * 
 *          UNITFLOW PRO — FULL REMAKE                   
 *   Systems Architect Agent orchestrated rebuild        
 *                                                       
 *   AGENTS DEPLOYED:                                    
 *   •   Systems Architect  — data schemas + routing   
 *   •   UI/UX Designer     — design system + layout   
 *   •   Frontend Agent     — all React components     
 *   •   Backend Agent      — storage + data layer     
 *   •   DevSecOps Agent    — validation + integrity   
 *                                                       
 *   REAL DATA: window.storage persistence               
 *   AI: Anthropic API (work order analysis, AI agent)   
 * 
 */

import { useState, useEffect, useCallback, useRef, createContext, useContext, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────

const DB_KEY     = "mainlync_pro_db";
const DB_VERSION = 5;
const AppCtx     = createContext(null);
const useApp     = () => useContext(AppCtx);

function genId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)  return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Icon component — inline SVG paths
const ICONS = {
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  chevron_right: "M9 18l6-6-6-6",
  chevron_left: "M15 18l-6-6 6-6",
  chevron_down: "M6 9l6 6 6-6",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13",
  copy: "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  check_circle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  loader: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  clipboard: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2z",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

function Icon({ name, size = 18, style = {} }) {
  const d = ICONS[name] || ICONS.wrench;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split(" M").map((segment, i) => (
        <path key={i} d={i === 0 ? segment : "M" + segment} />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// THEME — full CSS for the app
// ─────────────────────────────────────────────

const THEME = {
  // ── iOS Native Design Tokens ──────────────────
  // Backgrounds
  bg:        "#f2f2f7",   // iOS systemGroupedBackground
  bg2:       "#ffffff",   // iOS secondarySystemGroupedBackground
  bg3:       "#f2f2f7",   // iOS tertiarySystemGroupedBackground
  // Labels
  label:     "#000000",   // iOS label
  label2:    "#3c3c43",   // iOS secondaryLabel (60% opacity)
  label3:    "#8e8e93",   // iOS tertiaryLabel
  label4:    "#c7c7cc",   // iOS quaternaryLabel
  // Separators
  sep:       "#c6c6c8",   // iOS separator
  sepNonop:  "#e5e5ea",   // non-opaque separator
  // System fills
  fill:      "#787880",   // iOS systemFill (15% opacity)
  fill2:     "#787880",   // secondary
  // iOS accent
  blue:      "#007aff",   // iOS blue — used only for active nav
  // Status — semantic only, never for branding
  critical:  "#dc2626",
  atRisk:    "#e07d2a",
  onTrack:   "#16a34a",
  ready:     "#0284c7",

  css: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f2f2f7;
      color: #000000;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { display: none; }
    input, textarea, select { font-family: 'Inter', -apple-system, sans-serif; }

    /* ── Cards & Groups ── */
    .card {
      background: #ffffff;
      border-radius: 12px;
    }
    .card-group {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
    }

    /* ── Status left border ── */
    .card-critical { border-left: 3px solid #dc2626; }
    .card-at_risk  { border-left: 3px solid #e07d2a; }
    .card-on_track { border-left: 3px solid #16a34a; }
    .card-ready    { border-left: 3px solid #0284c7; }

    /* ── Rows ── */
    .row {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 14px;
      background: #ffffff;
    }
    .row + .row { border-top: 0.5px solid #e5e5ea; }
    .row-title { font-size: 14px; font-weight: 500; color: #000; }
    .row-sub   { font-size: 12px; color: #8e8e93; margin-top: 1px; }

    /* ── Section headers ── */
    .section-header {
      font-size: 11px; font-weight: 600; color: #8e8e93;
      text-transform: uppercase; letter-spacing: 0.07em;
      padding: 16px 16px 6px;
    }

    /* ── Inputs ── */
    .input-dark, .input-field {
      width: 100%;
      background: #ffffff;
      border: none;
      border-bottom: 1.5px solid #c6c6c8;
      color: #000000;
      border-radius: 0;
      padding: 10px 0;
      font-size: 17px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.2s;
    }
    .input-dark:focus, .input-field:focus { border-color: #000; }
    .input-dark::placeholder, .input-field::placeholder { color: #c7c7cc; }

    /* ── Buttons ── */
    .btn-primary {
      width: 100%;
      background: #000000;
      color: #ffffff;
      border: none;
      border-radius: 100px;
      padding: 16px 20px;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn-primary:hover { opacity: 0.85; }
    .btn-primary:active { opacity: 0.7; transform: scale(0.98); }
    .btn-primary:disabled {
      background: #e5e5ea; color: #c7c7cc;
      cursor: not-allowed; transform: none; opacity: 1;
    }

    .btn-ghost {
      width: 100%;
      background: #f2f2f7;
      color: #000000;
      border: none;
      border-radius: 100px;
      padding: 14px 20px;
      font-size: 15px;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
    }
    .btn-ghost:hover { background: #e5e5ea; }

    .btn-link {
      background: none; border: none; cursor: pointer;
      color: #007aff; font-size: 14px; font-weight: 500;
      font-family: 'Inter', sans-serif; padding: 0;
    }

    .btn-danger {
      background: #fff1f2; color: #dc2626;
      border: none; border-radius: 100px;
      padding: 14px 20px; font-size: 15px; font-weight: 500;
      font-family: 'Inter', sans-serif; cursor: pointer; width: 100%;
    }

    /* ── Progress bar ── */
    .progress-bar { height: 3px; background: #e5e5ea; border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }

    /* ── Chips / Tags ── */
    .chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: 6px;
      font-size: 11px; font-weight: 600;
    }
    .chip-critical { background: #fef2f2; color: #dc2626; }
    .chip-at_risk  { background: #fff7ed; color: #c45e0a; }
    .chip-on_track { background: #f0fdf4; color: #15803d; }
    .chip-ready    { background: #f0f9ff; color: #0369a1; }
    .chip-leased   { background: #f0fdf4; color: #15803d; }
    .chip-unleased { background: #fefce8; color: #a16207; }

    /* ── Status dot ── */
    .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
    .dot-critical { background: #dc2626; }
    .dot-at_risk  { background: #e07d2a; }
    .dot-on_track { background: #16a34a; }
    .dot-ready    { background: #0284c7; }

    /* ── Unit avatar ── */
    .unit-avatar {
      width: 34px; height: 34px; border-radius: 10px;
      background: #f2f2f7;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #3c3c43;
      flex-shrink: 0;
    }

    /* ── Stage icons ── */
    .stage-done   { background: #f2f2f7; }
    .stage-active { background: #fffbf5; }
    .stage-idle   { background: #ffffff; }

    /* ── Modal sheet ── */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(8px);
      z-index: 80;
      display: flex; align-items: flex-end; justify-content: center;
      max-width: 480px; margin: 0 auto;
    }
    .modal-sheet {
      background: #ffffff;
      border-radius: 20px 20px 0 0;
      padding: 20px 20px 40px;
      width: 100%; max-height: 92vh; overflow-y: auto;
    }
    .modal-handle {
      width: 36px; height: 4px; border-radius: 2px;
      background: #d1d1d6; margin: 0 auto 16px;
    }

    /* ── Skeleton ── */
    .skeleton {
      background: linear-gradient(90deg, #f2f2f7 25%, #e5e5ea 50%, #f2f2f7 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes pulse-a { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    @keyframes spin    { to { transform: rotate(360deg); } }

    /* ── Utility ── */
    .chevron-right {
      font-size: 14px; color: #c7c7cc; flex-shrink: 0;
    }
  `
};



// 
//  SYSTEMS ARCHITECT: DATA SCHEMAS + SEED
// 


// Helper builds a stage-aware turnover with realistic task completion
function makeTurnover(id, unitId, propId, unitNum, propName, targetDaysFromNow, leaseStatus, assignedTo, assignedName, stageProgress, createdDaysAgo) {
  const stageIds = ["cleaning","repairs","paint","flooring","final_clean","inspection"];
  const stageTasks = {
    cleaning:    [{id:"cl-1",label:"Remove all trash & debris"},{id:"cl-2",label:"Deep clean kitchen appliances"},{id:"cl-3",label:"Scrub bathrooms top to bottom"},{id:"cl-4",label:"Wipe all surfaces & cabinets"},{id:"cl-5",label:"Clean windows & blinds"}],
    repairs:     [{id:"rp-1",label:"Patch holes & drywall damage"},{id:"rp-2",label:"Fix doors, locks & hardware"},{id:"rp-3",label:"Check & repair plumbing"},{id:"rp-4",label:"Test all electrical outlets"},{id:"rp-5",label:"Service HVAC & replace filters"},{id:"rp-6",label:"Test all appliances"}],
    paint:       [{id:"pt-1",label:"Prime repaired walls"},{id:"pt-2",label:"Paint walls"},{id:"pt-3",label:"Paint trim & baseboards"},{id:"pt-4",label:"Touch up ceilings"}],
    flooring:    [{id:"fl-1",label:"Clean / shampoo carpets"},{id:"fl-2",label:"Replace damaged sections"},{id:"fl-3",label:"Polish hard floors"}],
    final_clean: [{id:"fc-1",label:"Full unit vacuum & mop"},{id:"fc-2",label:"Clean all glass & mirrors"},{id:"fc-3",label:"Wipe fixtures & switches"},{id:"fc-4",label:"Remove construction debris"}],
    inspection:  [{id:"in-1",label:"Walk unit with checklist"},{id:"in-2",label:"Photograph all rooms"},{id:"in-3",label:"Test smoke & CO detectors"},{id:"in-4",label:"Confirm keys & access codes"},{id:"in-5",label:"Sign-off supervisor approval"}],
  };
  const stages = stageIds.map(sid => {
    const status = stageProgress[sid] || "idle";
    const tasks = stageTasks[sid].map((t, i) => ({
      ...t, icon: "",
      completed: status === "done" ? true : status === "in_progress" ? i < Math.ceil(stageTasks[sid].length / 2) : false,
      assignee_id: assignedTo, assignee_name: status !== "idle" ? assignedName : null,
      completed_at: (status === "done" || (status === "in_progress" && i < Math.ceil(stageTasks[sid].length / 2)))
        ? new Date(Date.now() - 86400000 * Math.max(1, createdDaysAgo - i)).toISOString() : null,
    }));
    return { id: sid, status, tasks, assigned_to: assignedTo, assigned_name: assignedName };
  });
  return {
    id, unit_id: unitId, property_id: propId, unit_number: unitNum, property_name: propName,
    target_ready_date: new Date(Date.now() + 86400000 * targetDaysFromNow).toISOString().split("T")[0],
    lease_status: leaseStatus, assigned_to: assignedTo, assigned_name: assignedName,
    is_ready: Object.values(stageProgress).every(s => s === "done"),
    stages, checklist: [],
    created_date: new Date(Date.now() - 86400000 * createdDaysAgo).toISOString(),
  };
}

const SEED_DATA = {
  properties: [
    { id:"prop-1", name:"Maple Ridge Apartments", address:"1200 Maple Ridge Dr, Austin TX 78701", units:48 },
    { id:"prop-2", name:"Sunset Pines",            address:"4400 Sunset Blvd, Austin TX 78704",   units:24 },
    { id:"prop-3", name:"The Heights Complex",     address:"900 Heights Ave, Austin TX 78703",    units:32 },
  ],
  units: [
    { id:"u-101",   property_id:"prop-1", unit_number:"101", floor:1, bedrooms:1, sqft:650,  status:"occupied", lease_end:"2025-11-30", tenant:"Rachel & Tom Okafor",  rent:1195 },
    { id:"u-102",   property_id:"prop-1", unit_number:"102", floor:1, bedrooms:1, sqft:650,  status:"turnover", lease_end:"2025-04-15", tenant:null, rent:1195 },
    { id:"u-103",   property_id:"prop-1", unit_number:"103", floor:1, bedrooms:2, sqft:920,  status:"occupied", lease_end:"2026-02-28", tenant:"Diana Vasquez", rent:1450 },
    { id:"u-104",   property_id:"prop-1", unit_number:"104", floor:1, bedrooms:2, sqft:920,  status:"vacant",   lease_end:null, tenant:null, rent:1450 },
    { id:"u-105",   property_id:"prop-1", unit_number:"105", floor:1, bedrooms:1, sqft:680,  status:"occupied", lease_end:"2025-09-30", tenant:"James & Nia Fletcher", rent:1220 },
    { id:"u-203",   property_id:"prop-1", unit_number:"203", floor:2, bedrooms:2, sqft:940,  status:"turnover", lease_end:"2025-03-28", tenant:null, rent:1475 },
    { id:"u-204",   property_id:"prop-1", unit_number:"204", floor:2, bedrooms:2, sqft:950,  status:"occupied", lease_end:"2025-12-31", tenant:"Miguel Santos", rent:1490 },
    { id:"u-301",   property_id:"prop-1", unit_number:"301", floor:3, bedrooms:2, sqft:960,  status:"turnover", lease_end:"2025-04-01", tenant:null, rent:1510 },
    { id:"u-304",   property_id:"prop-1", unit_number:"304", floor:3, bedrooms:2, sqft:945,  status:"vacant",   lease_end:null, tenant:null, rent:1500 },
    { id:"u-sp102", property_id:"prop-2", unit_number:"102", floor:1, bedrooms:2, sqft:1010, status:"turnover", lease_end:"2025-03-31", tenant:null, rent:1580 },
    { id:"u-sp202", property_id:"prop-2", unit_number:"202", floor:2, bedrooms:1, sqft:730,  status:"vacant",   lease_end:null, tenant:null, rent:1325 },
    { id:"u-sp302", property_id:"prop-2", unit_number:"302", floor:3, bedrooms:2, sqft:1040, status:"turnover", lease_end:"2025-04-10", tenant:null, rent:1620 },
    { id:"u-h1A",   property_id:"prop-3", unit_number:"1A",  floor:1, bedrooms:1, sqft:580,  status:"turnover", lease_end:"2025-03-20", tenant:null, rent:1090 },
    { id:"u-h2B",   property_id:"prop-3", unit_number:"2B",  floor:2, bedrooms:2, sqft:885,  status:"vacant",   lease_end:null, tenant:null, rent:1395 },
    { id:"u-h3B",   property_id:"prop-3", unit_number:"3B",  floor:3, bedrooms:2, sqft:895,  status:"turnover", lease_end:"2025-04-05", tenant:null, rent:1420 },
  ],
  team: [
    { id:"tm-1", name:"Marcus Torres",  role:"supervisor", phone:"512-555-0101", specialty:"general",    is_active:true,  avatar:"MT" },
    { id:"tm-2", name:"Jordan Kim",     role:"technician", phone:"512-555-0102", specialty:"plumbing",   is_active:true,  avatar:"JK" },
    { id:"tm-3", name:"Priya Patel",    role:"technician", phone:"512-555-0103", specialty:"electrical", is_active:true,  avatar:"PP" },
    { id:"tm-4", name:"Carlos Reyes",   role:"technician", phone:"512-555-0104", specialty:"hvac",       is_active:true,  avatar:"CR" },
    { id:"tm-5", name:"Sam Washington", role:"porter",     phone:"512-555-0105", specialty:"general",    is_active:true,  avatar:"SW" },
    { id:"tm-6", name:"Destiny Brooks", role:"technician", phone:"512-555-0106", specialty:"painting",   is_active:true,  avatar:"DB" },
  ],
  turnovers: [
    makeTurnover("to-1","u-102",  "prop-1","102","Maple Ridge Apartments",10,"leased",  "tm-2","Jordan Kim",    {cleaning:"done",repairs:"in_progress",paint:"idle",flooring:"idle",      final_clean:"idle",inspection:"idle"},5),
    makeTurnover("to-2","u-203",  "prop-1","203","Maple Ridge Apartments",6, "leased",  "tm-6","Destiny Brooks",{cleaning:"done",repairs:"done",       paint:"in_progress",flooring:"in_progress",final_clean:"idle",inspection:"idle"},8),
    makeTurnover("to-3","u-301",  "prop-1","301","Maple Ridge Apartments",14,"unleased","tm-5","Sam Washington",{cleaning:"in_progress",repairs:"idle", paint:"idle",flooring:"idle",      final_clean:"idle",inspection:"idle"},2),
    makeTurnover("to-4","u-304",  "prop-1","304","Maple Ridge Apartments",21,"unleased","tm-1","Marcus Torres", {cleaning:"idle",      repairs:"idle", paint:"idle",flooring:"idle",      final_clean:"idle",inspection:"idle"},1),
    makeTurnover("to-5","u-sp102","prop-2","102","Sunset Pines",          2, "leased",  "tm-1","Marcus Torres", {cleaning:"done",repairs:"done",       paint:"done",flooring:"done",      final_clean:"done",inspection:"in_progress"},12),
    makeTurnover("to-6","u-sp302","prop-2","302","Sunset Pines",          -3,"leased",  "tm-4","Carlos Reyes",  {cleaning:"done",repairs:"in_progress",paint:"idle",flooring:"done",      final_clean:"idle",inspection:"idle"},18),
    makeTurnover("to-7","u-h1A",  "prop-3","1A", "The Heights Complex",  0, "leased",  "tm-1","Marcus Torres", {cleaning:"done",repairs:"done",       paint:"done",flooring:"done",      final_clean:"done",inspection:"done"},15),
    makeTurnover("to-8","u-h3B",  "prop-3","3B", "The Heights Complex",  18,"unleased","tm-5","Sam Washington",{cleaning:"idle",      repairs:"idle", paint:"idle",flooring:"idle",      final_clean:"idle",inspection:"idle"},1),
  ],
};
// ─────────────────────────────────────────────
// RELAY — Mainlync's Agentic AI
// Level 2: Proactive coordinator that acts
// automatically when things change
// ─────────────────────────────────────────────

const RELAY_VERSION = "1.0";

// ── Agent log loader ──────────────────────────
async function loadAgentLog() {
  if (isSupabaseConfigured()) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/agent_log?order=created_at.desc&limit=50`, {
        headers: { "apikey": SUPABASE_ANON, "Authorization": `Bearer ${SUPABASE_ANON}` }
      });
      if (r.ok) return r.json();
    } catch {}
  }
  try {
    const r = await window.storage.get("unitflow_agent_log");
    return r ? JSON.parse(r.value) : [];
  } catch { return []; }
}

// Relay generates and posts a stage completion message to the unit thread
async function relayStageComplete(to, stageId, db) {
  const stageLabels = {
    cleaning: "Cleaning", repairs: "Repairs", paint: "Paint",
    flooring: "Flooring", final_clean: "Final Clean", inspection: "Inspection"
  };
  const stageOrder  = ["cleaning", "repairs", "paint", "flooring", "final_clean", "inspection"];
  const stageLabel  = stageLabels[stageId] || stageId;
  const days        = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const updatedStages = (to.stages || []).map(s => s.id === stageId ? { ...s, status: "done" } : s);
  const pct         = overallPct({ ...to, stages: updatedStages });
  const nextStage   = stageOrder.find(sid => {
    const s = to.stages?.find(st => st.id === sid);
    return s && s.status === "idle" && sid !== stageId;
  });
  const nextLabel = nextStage ? stageLabels[nextStage] : null;

  // Template message — no API cost
  let message = `${stageLabel} is complete on Unit ${to.unit_number}. Progress: ${pct}%.`;
  if (nextLabel) message += ` ${nextLabel} is up next.`;
  else if (pct >= 99) message += ` All stages complete — ready for move-in review.`;
  if (days < 0) message += ` Note: unit is ${Math.abs(days)}d past target.`;
  else if (days <= 3) message += ` ${days}d to target move-in.`;

  await postThreadMessage(to.unit_id, to.unit_number, to.property_name, "Relay", "ai", message);
}

// Relay posts a stall alert — template for standard stalls, Claude only when urgent
async function relayStallAlert(to, stalledStageId) {
  const stageLabels = {
    cleaning: "Cleaning", repairs: "Repairs", paint: "Paint",
    flooring: "Flooring", final_clean: "Final Clean", inspection: "Inspection"
  };
  const stageLabel   = stageLabels[stalledStageId] || stalledStageId;
  const days         = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const assignedName = to.stages?.find(s => s.id === stalledStageId)?.assigned_name || to.assigned_name || "the assigned tech";
  const firstName    = assignedName.split(" ")[0];
  const isUrgent     = days <= 3 || days < 0 || to.lease_status === "leased";

  if (isUrgent) {
    try {
      const response = await fetch("/.netlify/functions/ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 80,
          messages: [{
            role: "user",
            content: `Relay AI: ${stageLabel} on Unit ${to.unit_number} stalled 24h+. Assigned to ${assignedName}. ${days < 0 ? Math.abs(days) + " days overdue." : days + " days to target."} Lease: ${to.lease_status}. Write one urgent but calm 2-sentence message. Start with first name.`,
          }],
        }),
      });
      const data    = await response.json();
      const message = data.content?.[0]?.text;
      if (message) {
        await postThreadMessage(to.unit_id, to.unit_number, to.property_name, "Relay", "ai", message);
        return;
      }
    } catch {}
  }

  // Standard template — no API cost
  const message = `${stageLabel} on Unit ${to.unit_number} hasn't had activity in 24+ hours. ${firstName} — can you post a quick update?${days <= 3 && days >= 0 ? ` Target move-in is in ${days}d.` : ""}`;
  await postThreadMessage(to.unit_id, to.unit_number, to.property_name, "Relay", "ai", message);
}


// Relay drafts an owner report when a unit goes move-in ready
async function relayOwnerReport(to) {
  const completedStages = to.stages?.filter(s => s.status === "done").map(s => s.id) || [];
  const stageLabels = {
    cleaning: "Cleaning", repairs: "Repairs", paint: "Paint",
    flooring: "Flooring", final_clean: "Final Clean", inspection: "Inspection"
  };
  const completedList = completedStages.map(s => stageLabels[s] || s).join(", ");
  const createdDate = new Date(to.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const readyDate   = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  try {
    const response = await fetch("/.netlify/functions/ai-briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `You are Relay, Mainlync's agentic AI.
Unit ${to.unit_number} at ${to.property_name} has been marked Move-In Ready.
Turnover started: ${createdDate}. Ready date: ${readyDate}.
Completed work: ${completedList}.
Lease status: ${to.lease_status === "leased" ? "Unit is leased — resident move-in pending" : "Unit is unleased — available for leasing"}.
Write a professional owner report (3-4 sentences) the property manager can send directly to the property owner.
Summarize the work completed, confirm the unit is ready, and note the lease status. Professional tone.`
        }],
      }),
    });
    const data = await response.json();
    const report = data.content?.[0]?.text || `Unit ${to.unit_number} at ${to.property_name} has completed its make-ready process and is cleared for move-in as of ${readyDate}. All required stages were completed including ${completedList}. The unit is ${to.lease_status === "leased" ? "currently leased and awaiting resident move-in" : "available and ready for leasing"}.`;

    await postThreadMessage(
      to.unit_id, to.unit_number, to.property_name, "Relay", "ai",
      `Unit ${to.unit_number} is Move-In Ready. Here is your owner report draft:\n\n${report}\n\n— Tap to copy and send to your owner.`
    );
  } catch {
    await postThreadMessage(
      to.unit_id, to.unit_number, to.property_name, "Relay", "ai",
      `Unit ${to.unit_number} at ${to.property_name} is Move-In Ready as of ${readyDate}. All make-ready stages have been completed. ${to.lease_status === "leased" ? "Unit is leased — resident move-in is pending." : "Unit is available for leasing."}`
    );
  }
}

// Relay stall checker — runs periodically to detect stalled stages
function checkForStalls(turnovers, lastStallCheck) {
  const stalled = [];
  const now = Date.now();

  turnovers.forEach(to => {
    if (to.is_ready) return;
    (to.stages || []).forEach(stage => {
      if (stage.status !== "in_progress") return;
      const tasks = stage.tasks || [];
      const lastActivity = tasks
        .filter(t => t.completed_at)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];

      const lastTime = lastActivity
        ? new Date(lastActivity.completed_at).getTime()
        : new Date(to.created_date).getTime();

      const hoursSince = (now - lastTime) / 3600000;
      const stallKey   = `${to.id}_${stage.id}`;

      // Only alert if stalled 24+ hours and not already alerted this session
      if (hoursSince >= 24 && !lastStallCheck[stallKey]) {
        stalled.push({ to, stageId: stage.id, stallKey });
      }
    });
  });

  return stalled;
}



const MR_STAGES = [
  { id: "cleaning",    label: "Cleaning",    short: "Clean",   color: "#c2570a", bg: "#fff7ed", accent: "#fed7aa", dot: "#e07d2a" },
  { id: "repairs",     label: "Repairs",     short: "Repairs", color: "#0f172a", bg: "#f1f5f9", accent: "#e2e8f0", dot: "#0f172a" },
  { id: "paint",       label: "Paint",       short: "Paint",   color: "#9d174d", bg: "#fdf2f8", accent: "#fbcfe8", dot: "#ec4899" },
  { id: "flooring",    label: "Flooring",    short: "Floor",   color: "#065f46", bg: "#f0fdf4", accent: "#bbf7d0", dot: "#10b981" },
  { id: "final_clean", label: "Final Clean", short: "Final",   color: "#1e40af", bg: "#f1f5f9", accent: "#e2e8f0", dot: "#60a5fa" },
  { id: "inspection",  label: "Inspection",  short: "Inspect", color: "#6b21a8", bg: "#faf5ff", accent: "#e9d5ff", dot: "#a855f7" },
];

const STAGE_TASKS = {
  cleaning:    [{id:"cl-1",label:"Remove all trash & debris"},{id:"cl-2",label:"Deep clean kitchen appliances"},{id:"cl-3",label:"Scrub bathrooms top to bottom"},{id:"cl-4",label:"Wipe all surfaces & cabinets"},{id:"cl-5",label:"Clean windows & blinds"}],
  repairs:     [{id:"rp-1",label:"Patch holes & drywall damage"},{id:"rp-2",label:"Fix doors, locks & hardware"},{id:"rp-3",label:"Check & repair plumbing"},{id:"rp-4",label:"Test all electrical outlets"},{id:"rp-5",label:"Service HVAC & replace filters"},{id:"rp-6",label:"Test all appliances"}],
  paint:       [{id:"pt-1",label:"Prime repaired walls"},{id:"pt-2",label:"Paint walls"},{id:"pt-3",label:"Paint trim & baseboards"},{id:"pt-4",label:"Touch up ceilings"}],
  flooring:    [{id:"fl-1",label:"Clean / shampoo carpets"},{id:"fl-2",label:"Replace damaged sections"},{id:"fl-3",label:"Polish hard floors"}],
  final_clean: [{id:"fc-1",label:"Full unit vacuum & mop"},{id:"fc-2",label:"Clean all glass & mirrors"},{id:"fc-3",label:"Wipe fixtures & switches"},{id:"fc-4",label:"Remove construction debris"}],
  inspection:  [{id:"in-1",label:"Walk unit with checklist"},{id:"in-2",label:"Photograph all rooms"},{id:"in-3",label:"Test smoke & CO detectors"},{id:"in-4",label:"Confirm keys & access codes"},{id:"in-5",label:"Sign-off supervisor approval"}],
};

function freshStages() {
  return MR_STAGES.map(s => ({
    id: s.id,
    status: "idle",
    tasks: STAGE_TASKS[s.id].map(t => ({
      ...t, icon: "",
      completed: false,
      assignee_id: null,
      assignee_name: null,
      completed_at: null,
    })),
  }));
}

function buildMakeReadyRecord(unit, prop, member, targetDate, leaseStatus) {
  return {
    id: genId("to"),
    unit_id: unit.id,
    unit_number: unit.unit_number,
    property_id: unit.property_id,
    property_name: prop?.name || "",
    target_ready_date: targetDate,
    lease_status: leaseStatus,
    assigned_to: member?.id || null,
    assigned_name: member?.name || null,
    is_ready: false,
    stages: freshStages(),
    checklist: [],
    created_date: new Date().toISOString(),
  };
}

function migrateTurnover(to) {
  if (to.stages && to.stages[0]?.status !== undefined) return to;
  const stages = freshStages().map(s => {
    const oldChecked = (to.checklist || []).filter(c => c.completed).map(c => c.task?.toLowerCase() || "");
    return {
      ...s,
      status: "idle",
      tasks: s.tasks.map(t => {
        const wasChecked = oldChecked.some(old => old.includes(t.label.toLowerCase().slice(0, 10)));
        return { ...t, completed: wasChecked, completed_at: wasChecked ? to.created_date : null };
      }),
    };
  });
  return { ...to, stages, is_ready: false };
}

function overallPct(to) {
  const stages = to.stages || [];
  if (stages.length === 0) return 0;
  if (to.is_ready) return 100;
  let points = 0;
  stages.forEach(s => {
    if (s.status === "done") { points += 1; return; }
    const total = s.tasks.length;
    const done  = s.tasks.filter(t => t.completed).length;
    if (total > 0) points += (done / total) * 0.8;
  });
  return Math.min(99, Math.round((points / stages.length) * 100));
}

const STATUS_STYLE = {
  idle:        { bg: "#ffffff", border: "#e5e5ea", color: "#8e8e93", label: "Not Started" },
  in_progress: { bg: null,      border: null,       color: null,      label: "In Progress" },
  done:        { bg: "#dcfce7", border: "#86efac",  color: "#16a34a", label: "Done" },
};

//  Main Board 
function MakeReadyBoard({ turnovers, db, updateDB }) {
  const [selectedId, setSelectedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | ready
  const [filterLease, setFilterLease] = useState("all");

  const units = turnovers.map(migrateTurnover);

  const total   = units.length;
  const ready   = units.filter(u => u.is_ready).length;
  const active  = units.filter(u => !u.is_ready && u.stages.some(s => s.status === "in_progress")).length;
  const overdue = units.filter(u => {
    const d = Math.ceil((new Date(u.target_ready_date) - Date.now()) / 86400000);
    return d < 0 && !u.is_ready;
  }).length;

  const displayed = units.filter(u => {
    if (filterStatus === "active" && u.is_ready) return false;
    if (filterStatus === "ready" && !u.is_ready) return false;
    if (filterLease !== "all" && u.lease_status !== filterLease) return false;
    return true;
  });

  const selectedTO = selectedId ? units.find(u => u.id === selectedId) : null;

  //  Mutations 
  async function setStageStatus(toId, stageId, newStatus) {
    const updated = turnovers.map(t => {
      if (t.id !== toId) return t;
      const m = migrateTurnover(t);
      return {
        ...m,
        stages: m.stages.map(s => s.id === stageId ? { ...s, status: newStatus } : s),
      };
    });
    await updateDB({ ...db, turnovers: updated });

    // Relay: auto-post to unit thread when stage completes
    if (newStatus === "done") {
      const to = updated.find(t => t.id === toId);
      if (to) relayStageComplete(to, stageId, db).catch(() => {});
    }
  }

  async function toggleTask(toId, stageId, taskId) {
    const updated = turnovers.map(t => {
      if (t.id !== toId) return t;
      const m = migrateTurnover(t);
      return {
        ...m,
        stages: m.stages.map(s => s.id !== stageId ? s : {
          ...s,
          tasks: s.tasks.map(tk => tk.id !== taskId ? tk : {
            ...tk,
            completed: !tk.completed,
            completed_at: !tk.completed ? new Date().toISOString() : null,
          }),
        }),
      };
    });
    await updateDB({ ...db, turnovers: updated });
  }

  async function assignTask(toId, stageId, taskId, memberId) {
    const member = db.team.find(m => m.id === memberId);
    const updated = turnovers.map(t => {
      if (t.id !== toId) return t;
      const m = migrateTurnover(t);
      return {
        ...m,
        stages: m.stages.map(s => s.id !== stageId ? s : {
          ...s,
          tasks: s.tasks.map(tk => tk.id !== taskId ? tk : {
            ...tk,
            assignee_id: memberId || null,
            assignee_name: member?.name || null,
          }),
        }),
      };
    });
    await updateDB({ ...db, turnovers: updated });
  }

  async function markReady(toId) {
    const updated = turnovers.map(t => t.id === toId
      ? { ...migrateTurnover(t), is_ready: true }
      : t
    );
    await updateDB({ ...db, turnovers: updated });

    // Relay: auto-draft owner report when unit goes ready
    const to = updated.find(t => t.id === toId);
    if (to) relayOwnerReport(to).catch(() => {});
  }

  async function unmarkReady(toId) {
    const updated = turnovers.map(t => t.id === toId
      ? { ...migrateTurnover(t), is_ready: false }
      : t
    );
    await updateDB({ ...db, turnovers: updated });
  }

  async function deleteTurnover(toId) {
    await updateDB({ ...db, turnovers: turnovers.filter(t => t.id !== toId) });
    setSelectedId(null);
  }

  //  Render 
  return (
    <>
      {/* Summary strip — ByeWind style */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Total",   value: total,   color: "#000" },
            { label: "Active",  value: active,  color: "#000" },
            { label: "Ready",   value: ready,   color: "#16a34a" },
            { label: "Overdue", value: overdue, color: overdue > 0 ? "#dc2626" : "#8e8e93" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "10px 6px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#8e8e93", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[["all","All"],["active","Active"],["ready","Ready"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} style={{ padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500, border: "0.5px solid #e5e5ea", cursor: "pointer", fontFamily: "'Inter',sans-serif", background: filterStatus === v ? "#000" : "#fff", color: filterStatus === v ? "#fff" : "#8e8e93" }}>{l}</button>
          ))}
          <div style={{ width: "0.5px", background: "#e5e5ea", margin: "0 2px" }} />
          {[["all","All"],["leased","Leased"],["unleased","Unleased"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilterLease(v)} style={{ padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500, border: "0.5px solid #e5e5ea", cursor: "pointer", fontFamily: "'Inter',sans-serif", background: filterLease === v ? "#e5e5ea" : "#fff", color: filterLease === v ? "#000" : "#8e8e93" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Unit cards grid */}
      <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {displayed.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 24px" }}>
            <p style={{ fontSize: 14, color: "#8e8e93" }}>No units match this filter</p>
          </div>
        )}
        {displayed.map(to => <UnitCard key={to.id} to={to} onOpen={() => setSelectedId(to.id)} />)}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedTO && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 80, maxWidth: 480, margin: "0 auto" }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "#ffffff",
                borderRadius: "20px 20px 0 0",
                borderTop: "0.5px solid #e5e5ea",
                maxHeight: "92vh",
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4 }}>
                <div style={{ width: 36, height: 4, background: "#d1d1d6", borderRadius: 2 }} />
              </div>
              <UnitDrawer
                to={selectedTO}
                db={db}
                updateDB={updateDB}
                onSetStageStatus={setStageStatus}
                onToggleTask={toggleTask}
                onAssignTask={assignTask}
                onMarkReady={() => markReady(selectedTO.id)}
                onUnmarkReady={() => unmarkReady(selectedTO.id)}
                onDelete={() => deleteTurnover(selectedTO.id)}
                onClose={() => setSelectedId(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

//  Unit summary card 
function UnitCard({ to, onOpen }) {
  const pct = overallPct(to);
  const daysLeft = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const isOverdue = daysLeft < 0 && !to.is_ready;

  const stages = (to.stages || []).map(s => ({
    ...s, def: MR_STAGES.find(m => m.id === s.id),
  }));

  const doneCount = stages.filter(s => s.status === "done").length;
  const inProgCount = stages.filter(s => s.status === "in_progress").length;

  const statusColor = to.is_ready ? "#16a34a"
    : isOverdue ? "#dc2626"
    : daysLeft <= 3 ? "#e07d2a"
    : "#8e8e93";

  const statusLabel = to.is_ready ? "Ready"
    : isOverdue ? `${Math.abs(daysLeft)}d overdue`
    : daysLeft === 0 ? "Due today"
    : `${daysLeft}d left`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "14px 16px",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        borderLeft: `3px solid ${statusColor}`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{to.unit_number}</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#000", lineHeight: 1.2 }}>{to.property_name}</p>
            <p style={{ fontSize: 11, color: "#8e8e93", marginTop: 1 }}>{to.assigned_name || "Unassigned"}</p>
          </div>
        </div>
        <div style={{ display: "flex", flex: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, whiteSpace: "nowrap" }}>{statusLabel}</span>
          <span style={{ fontSize: 10, color: "#8e8e93", marginTop: 2 }}>
            {to.lease_status === "leased" ? "Leased" : "Unleased"}
          </span>
        </div>
      </div>

      {/* Stage dots — ByeWind style horizontal indicators */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {stages.map(s => {
          const isDone = s.status === "done";
          const isIP   = s.status === "in_progress";
          const bg = isDone ? "#16a34a" : isIP ? "#e07d2a" : "#e5e5ea";
          return (
            <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: bg, transition: "background 0.3s" }} title={s.def?.label} />
          );
        })}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#8e8e93" }}>
          {doneCount}/{MR_STAGES.length} stages
          {inProgCount > 0 ? ` · ${inProgCount} active` : ""}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? "#16a34a" : "#000" }}>{pct}%</span>
      </div>
    </motion.div>
  );
}


//  Detail drawer 
function UnitDrawer({ to, db, updateDB, onSetStageStatus, onToggleTask, onAssignTask, onMarkReady, onUnmarkReady, onDelete, onClose }) {
  const [openStageId, setOpenStageId] = useState(null);
  const [assigningTask, setAssigningTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showThread, setShowThread]       = useState(false);

  // Get role from localStorage for thread authoring
  const roleData = getRoleData();
  const authorName = roleData?.name || "Maintenance Team";
  const authorRole = roleData?.role || "maintenance";

  const pct = overallPct(to);
  const daysLeft = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const allDone = (to.stages || []).every(s => s.status === "done");

  // Auto-open first in_progress stage on mount
  useEffect(() => {
    const firstIP = (to.stages || []).find(s => s.status === "in_progress");
    if (firstIP) setOpenStageId(firstIP.id);
  }, [to.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/*  Drawer header  */}
      <div style={{ padding: "12px 16px 14px", borderBottom: "1px solid #e5e5ea", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: "#f2f2f7", border: "1px solid #d6d0c8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#000000" }}>{to.unit_number}</span>
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#000000" }}>Unit {to.unit_number}</h2>
              <p style={{ fontSize: 12, color: "#8e8e93" }}>{to.property_name}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={{ width: 32, height: 32, background: "#fef2f2", border: "1px solid #ff3b3b30", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Icon name="trash" size={13} style={{ color: "#dc2626" }} />
              </button>
            ) : (
              <button onClick={onDelete} style={{ padding: "6px 10px", background: "#dc2626", border: "none", borderRadius: 10, fontSize: 11, fontWeight: 700, color: "white", cursor: "pointer" }}>Delete?</button>
            )}
            <button onClick={onClose} style={{ width: 32, height: 32, background: "#f2f2f7", border: "1px solid #d6d0c8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon name="x" size={14} style={{ color: "#3c3c43" }} />
            </button>
          </div>
        </div>

        {/* Meta chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: to.lease_status === "leased" ? "#dcfce7" : "#f0b40012", color: to.lease_status === "leased" ? "#16a34a" : "#f5d05e", border: `1px solid ${to.lease_status === "leased" ? "#86efac" : "#f0b40035"}` }}>
            {to.lease_status === "leased" ? " Leased" : " Unleased"}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: daysLeft < 0 ? "#dc2626" : daysLeft <= 3 ? "#ffad5c" : "#8e8e93", padding: "3px 0" }}>
            {daysLeft < 0 ? ` ${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d to target`}
          </span>
          {to.assigned_name && (
            <span style={{ fontSize: 10, color: "#3c3c43", padding: "3px 0" }}> {to.assigned_name}</span>
          )}
        </div>

        {/* Overall progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#8e8e93", fontWeight: 600 }}>Overall Progress</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: pct === 100 ? "#16a34a" : "#e07d2a" }}>{pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "#f2f2f7", overflow: "hidden" }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} style={{ height: "100%", borderRadius: 3, background: pct === 100 ? "#16a34a" : "linear-gradient(90deg,#e07d2a,#c45e0a)" }} />
          </div>
        </div>

        {/* Share link */}
        <ShareButton to={to} db={db} updateDB={updateDB} />

        {/* Team Thread button */}
        <button
          onClick={() => setShowThread(true)}
          style={{
            width: "100%", padding: "11px", borderRadius: 12, marginTop: 8,
            background: "#f1f5f9", border: "1px solid #bfdbfe",
            color: "#0f172a", fontSize: 13, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Team Thread
        </button>

        {/* Move-In Ready toggle */}
        {to.is_ready ? (
          <button onClick={onUnmarkReady} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "#dcfce7", border: "1px solid #05966940", color: "#16a34a", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon name="check_circle" size={16} /> Move-In Ready — Tap to Reopen
          </button>
        ) : (
          <button
            onClick={onMarkReady}
            style={{
              width: "100%", padding: "11px", borderRadius: 12, border: "none",
              background: allDone ? "linear-gradient(135deg,#059669,#10b981)" : "#f2f2f7",
              color: allDone ? "white" : "#8e8e93",
              fontSize: 13, fontWeight: 700, cursor: allDone ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: allDone ? "0 4px 14px #05966940" : "none",
            }}
          >
            <Icon name="check_circle" size={16} />
            {allDone ? "Mark Move-In Ready " : `Mark Ready (${(to.stages || []).filter(s => s.status === "done").length}/${MR_STAGES.length} stages done)`}
          </button>
        )}
      </div>

      {/*  Stage accordion — scrollable  */}
      <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px 32px" }}>
        <p style={{ fontSize: 10, color: "#8e8e93", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Work Stages — tap any to start, no set order required
        </p>

        {MR_STAGES.map(def => {
          const stageObj = (to.stages || []).find(s => s.id === def.id) || { id: def.id, status: "idle", tasks: [] };
          const tasks = stageObj.tasks || [];
          const taskDone = tasks.filter(t => t.completed).length;
          const taskTotal = tasks.length;
          const isOpen = openStageId === def.id;
          const hasIncomplete = taskDone < taskTotal;

          const statusStyle = stageObj.status === "in_progress"
            ? { bg: def.bg, border: def.accent, color: def.color }
            : stageObj.status === "done"
            ? { bg: "#dcfce7", border: "#86efac", color: "#16a34a" }
            : { bg: "#f2f2f7", border: "#f2f2f7", color: "#8e8e93" };

          return (
            <div key={def.id} style={{ marginBottom: 8 }}>
              {/* Stage header button */}
              <button
                onClick={() => setOpenStageId(isOpen ? null : def.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px",
                  borderRadius: isOpen ? "12px 12px 0 0" : 12,
                  background: statusStyle.bg,
                  border: `1px solid ${statusStyle.border}`,
                  borderBottom: isOpen ? "none" : undefined,
                  cursor: "pointer",
                }}
              >
                {/* Status dot */}
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: stageObj.status === "done" ? "#16a34a" : stageObj.status === "in_progress" ? def.dot : "#e5e5ea",
                  border: stageObj.status === "idle" ? "1.5px solid #d6d0c8" : "none",
                }}>
                  {stageObj.status === "done"
                    ? <Icon name="check" size={11} style={{ color: "#f8fafc" }} />
                    : stageObj.status === "in_progress"
                    ? <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f8fafc" }} />
                    : null
                  }
                </div>

                {/* Label */}
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1, textAlign: "left", color: statusStyle.color }}>
                  {def.label}
                </span>

                {/* Task count */}
                <span style={{ fontSize: 11, fontWeight: 600, color: taskDone === taskTotal && taskTotal > 0 ? "#16a34a" : stageObj.status === "in_progress" ? def.color : "#b8b0a8" }}>
                  {taskDone}/{taskTotal}
                </span>

                <Icon name={isOpen ? "chevron_down" : "chevron_right"} size={14} style={{ color: "#8e8e93" }} />
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{
                      overflow: "hidden",
                      background: "#f2f2f7",
                      border: `1px solid ${statusStyle.border}`,
                      borderTop: "none",
                      borderRadius: "0 0 12px 12px",
                    }}
                  >
                    {/* Stage status controls */}
                    <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #ede9e3", display: "flex", gap: 6 }}>
                      {[
                        { val: "idle",        label: "Not Started", bg: "#f2f2f7",  color: "#8e8e93" },
                        { val: "in_progress", label: "In Progress", bg: def.bg,     color: def.color, border: def.accent },
                        { val: "done",        label: "Done",        bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => onSetStageStatus(to.id, def.id, opt.val)}
                          style={{
                            flex: 1, padding: "6px 4px", borderRadius: 10, border: `1px solid ${opt.border || "#c6c6c8"}`,
                            background: stageObj.status === opt.val ? opt.bg : "#f2f2f7",
                            color: stageObj.status === opt.val ? opt.color : "#b8b0a8",
                            fontSize: 10, fontWeight: 700, cursor: "pointer",
                            outline: stageObj.status === opt.val ? `1.5px solid ${opt.border || def.dot}` : "none",
                            outlineOffset: 1,
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Warning if marking done with incomplete tasks */}
                    {stageObj.status === "done" && hasIncomplete && (
                      <div style={{ padding: "7px 14px", background: "#ffad5c10", borderBottom: "1px solid #ff8c0025", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11 }}></span>
                        <span style={{ fontSize: 11, color: "#ffad5c" }}>{taskTotal - taskDone} task{taskTotal - taskDone > 1 ? "s" : ""} still open — marked done anyway</span>
                      </div>
                    )}

                    {/* Task list */}
                    {tasks.map((tk, ti) => (
                      <div key={tk.id} style={{ padding: "10px 14px", borderBottom: ti < tasks.length - 1 ? "1px solid #ede9e3" : "none" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <button
                            onClick={() => onToggleTask(to.id, def.id, tk.id)}
                            style={{
                              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                              border: tk.completed ? "none" : `1.5px solid #b8b0a8`,
                              background: tk.completed ? def.dot : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                            }}
                          >
                            {tk.completed && <Icon name="check" size={11} style={{ color: "#f8fafc" }} />}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 14 }}>{tk.icon}</span>
                              <span style={{ fontSize: 12, color: tk.completed ? "#8e8e93" : "#000000", textDecoration: tk.completed ? "line-through" : "none", lineHeight: 1.4 }}>
                                {tk.label}
                              </span>
                            </div>
                            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              {tk.assignee_name ? (
                                <span style={{ fontSize: 10, color: "#e07d2a", background: "#e07d2a12", border: "1px solid #e07d2a30", borderRadius: 100, padding: "2px 8px", fontWeight: 600 }}>
                                   {tk.assignee_name}
                                </span>
                              ) : (
                                <span style={{ fontSize: 10, color: "#b8b0a8" }}>Unassigned</span>
                              )}

                              {assigningTask?.stageId === def.id && assigningTask?.taskId === tk.id ? (
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {db.team.map(m => (
                                    <button key={m.id} onClick={() => { onAssignTask(to.id, def.id, tk.id, m.id); setAssigningTask(null); }} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "#e07d2a20", border: "1px solid #e07d2a40", color: "#f0a05a", cursor: "pointer", fontWeight: 700 }}>
                                      {m.avatar}
                                    </button>
                                  ))}
                                  <button onClick={() => { onAssignTask(to.id, def.id, tk.id, null); setAssigningTask(null); }} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "#f2f2f7", border: "1px solid #d6d0c8", color: "#8e8e93", cursor: "pointer" }}></button>
                                </div>
                              ) : (
                                <button onClick={() => setAssigningTask({ stageId: def.id, taskId: tk.id })} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "#ffffff", border: "1px solid #e8e4de", color: "#8e8e93", cursor: "pointer" }}>
                                  assign
                                </button>
                              )}

                              {tk.completed_at && (
                                <span style={{ fontSize: 9, color: "#c6c6c8", marginLeft: "auto" }}>{timeAgo(tk.completed_at)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Unit thread overlay */}
      <AnimatePresence>
        {showThread && (
          <UnitThread
            to={to}
            authorName={authorName}
            authorRole={authorRole}
            onClose={() => setShowThread(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

//  Main Turnovers page 
function Turnovers() {
  const { db, updateDB } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ unit_id: "", target_ready_date: "", lease_status: "unleased", assigned_to: "" });

  async function createTurnover() {
    const unit = db.units.find(u => u.id === form.unit_id);
    if (!unit) return;
    const prop   = db.properties.find(p => p.id === unit.property_id);
    const member = db.team.find(m => m.id === form.assigned_to);
    const record = buildMakeReadyRecord(unit, prop, member, form.target_ready_date, form.lease_status);
    await updateDB({ ...db, turnovers: [record, ...db.turnovers] });
    setShowCreate(false);
    setForm({ unit_id: "", target_ready_date: "", lease_status: "unleased", assigned_to: "" });
  }

  return (
    <div style={{ paddingBottom: 100, background: "#f2f2f7", minHeight: "100vh" }}>
      {/* Page header — ByeWind style */}
      <div style={{ padding: "16px 16px 12px", background: "rgba(249,249,249,0.94)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "0.5px solid #c6c6c8", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, color: "#8e8e93", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>Make Ready</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#000", letterSpacing: "-0.02em" }}>Turnover Board</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ width: 36, height: 36, background: "#000", border: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <Icon name="plus" size={16} style={{ color: "white" }} />
          </button>
        </div>
      </div>

      <MakeReadyBoard turnovers={db.turnovers} db={db} updateDB={updateDB} />

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}>
            <motion.div className="modal-sheet" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>New Turnover</h2>
              <p style={{ fontSize: 12, color: "#8e8e93", marginBottom: 20 }}>All 6 work stages are created automatically. Your team can start them in any order.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Unit</label>
                  <select className="input-dark" value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}>
                    <option value="">Select unit...</option>
                    {db.units.map(u => <option key={u.id} value={u.id}>#{u.unit_number} — {db.properties.find(p => p.id === u.property_id)?.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Target Move-In Ready Date</label>
                  <input className="input-dark" type="date" value={form.target_ready_date} onChange={e => setForm(f => ({ ...f, target_ready_date: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Lead Technician</label>
                  <select className="input-dark" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {db.team.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Lease Status</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[["leased", " Leased"], ["unleased", " Unleased"]].map(([v, l]) => (
                      <button key={v} onClick={() => setForm(f => ({ ...f, lease_status: v }))} style={{
                        padding: "10px", borderRadius: 12,
                        border: form.lease_status === v ? "1px solid #e07d2a" : "1px solid #e8e4de",
                        background: form.lease_status === v ? "#e07d2a20" : "#f2f2f7", cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: form.lease_status === v ? "#f0a05a" : "#3c3c43",
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#f2f2f7", border: "1px solid #e5e5ea", borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, color: "#e07d2a", fontWeight: 700, marginBottom: 8 }}>Stages (work in any order):</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {MR_STAGES.map(s => (
                      <span key={s.id} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 100, background: s.bg, color: s.color, border: `1px solid ${s.accent}`, fontWeight: 600 }}>{s.label}</span>
                    ))}
                  </div>
                </div>
                <button onClick={createTurnover} disabled={!form.unit_id || !form.target_ready_date} className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: 14 }}>
                  Start Make Ready Process
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// --- TEAM ---
function Team() {
  const { db, updateDB } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "technician", phone: "", specialty: "general" });

  const roleColors = {
    supervisor: { bg: "#c45e0a20", color: "#f0a05a", border: "#c45e0a40" },
    technician: { bg: "#4f7cf020", color: "#7fa8ff", border: "#4f7cf040" },
    porter: { bg: "#bbf7d0", color: "#16a34a", border: "#4ade80" },
    vendor: { bg: "#ff8c0020", color: "#ffad5c", border: "#ff8c0040" },
  };

  const specialties = ["general", "plumbing", "electrical", "hvac", "appliance", "painting", "flooring", "landscaping"];
  const roles = ["technician", "supervisor", "porter", "vendor"];

  async function createMember() {
    if (!form.name.trim()) return;
    const member = { id: genId("tm"), ...form, is_active: true, avatar: form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() };
    await updateDB({ ...db, team: [...db.team, member] });
    setForm({ name: "", role: "technician", phone: "", specialty: "general" });
    setShowForm(false);
  }

  const woByMember = (_id) => 0; // work orders removed — make-ready focused build

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>Team</h1>
        <button onClick={() => setShowForm(true)} style={{ width: 40, height: 40, background: "#000000", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="plus" size={18} style={{ color: "white" }} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {db.team.map(member => {
          const rc = roleColors[member.role] || roleColors.technician;
          const active = woByMember(member.id);
          return (
            <motion.div key={member.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg, ${rc.color}30, ${rc.color}15)`, border: `1px solid ${rc.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="syne" style={{ fontSize: 13, fontWeight: 800, color: rc.color }}>{member.avatar}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#000000" }}>{member.name}</h3>
                  <span className="chip" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>{member.role}</span>
                </div>
                <p style={{ fontSize: 12, color: "#8e8e93" }}>{member.specialty} · {member.phone || "No phone"}</p>
              </div>
              {active > 0 && (
                <div style={{ width: 28, height: 28, background: "#e07d2a20", border: "1px solid #e07d2a40", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="syne" style={{ fontSize: 12, fontWeight: 800, color: "#f0a05a" }}>{active}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
            <motion.div className="modal-sheet" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()}>
              <h2 className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Add Team Member</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input className="input-dark" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="input-dark" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#8e8e93", display: "block", marginBottom: 4 }}>Role</label>
                    <select className="input-dark" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#8e8e93", display: "block", marginBottom: 4 }}>Specialty</label>
                    <select className="input-dark" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}>
                      {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={createMember} disabled={!form.name.trim()} className="btn-primary" style={{ width: "100%", padding: "13px" }}>Add Member</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─────────────────────────────────────────────
// ROLE SYSTEM — maintenance vs leasing
// ─────────────────────────────────────────────

function getRoleData() {
  try {
    const stored = localStorage.getItem("mainlync_role");
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function setRoleData(role, name) {
  try {
    localStorage.setItem("mainlync_role", JSON.stringify({ role, name, setAt: new Date().toISOString() }));
  } catch {}
}

function clearRoleData() {
  try { localStorage.removeItem("mainlync_role"); } catch {}
}

// ─────────────────────────────────────────────
// ROLE SELECTION SCREEN
// ─────────────────────────────────────────────

function RoleSelectionScreen({ onSelect }) {
  const [step, setStep] = useState("role");
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState("");

  function confirmRole() {
    if (!name.trim()) return;
    setRoleData(selectedRole, name.trim());
    onSelect({ role: selectedRole, name: name.trim() });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", display: "flex", flexDirection: "column", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{THEME.css}</style>
      <AnimatePresence mode="wait">
        {step === "role" && (
          <motion.div key="role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", padding: "72px 24px 40px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
              <div style={{ width: 52, height: 52, background: "#000", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.2 }}>Welcome to Mainlync.</h1>
            <p style={{ fontSize: 15, color: "#8e8e93", marginBottom: 32, lineHeight: 1.5 }}>Which team are you on?</p>
            <div className="card-group">
              {[
                { id: "maintenance", label: "Maintenance", sub: "Supervisors, technicians, porters" },
                { id: "leasing",     label: "Leasing",     sub: "Agents, property managers" },
              ].map(r => (
                <button key={r.id} onClick={() => { setSelectedRole(r.id); setStep("name"); }}
                  className="row" style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {r.id === "maintenance"
                        ? <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        : <><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>
                      }
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="row-title">{r.label}</div>
                    <div className="row-sub">{r.sub}</div>
                  </div>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "name" && (
          <motion.div key="name" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", padding: "72px 24px 40px" }}>
            <button onClick={() => setStep("role")} style={{ background: "none", border: "none", cursor: "pointer", color: "#007aff", fontSize: 15, marginBottom: 32, display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter', sans-serif", padding: 0 }}>
              <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M8 1L2 7l6 6" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", marginBottom: 32, lineHeight: 1.2 }}>{"What's your name?"}</h1>
            <input autoFocus className="input-field"
              placeholder={selectedRole === "leasing" ? "e.g. Sarah Johnson" : "e.g. Marcus Torres"}
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && confirmRole()}
              style={{ marginBottom: 48, fontSize: 20, fontWeight: 500 }}
            />
            <div style={{ marginTop: "auto" }}>
              <button onClick={confirmRole} disabled={!name.trim()} className="btn-primary">Continue</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnitThread({ to, authorName, authorRole, onClose }) {
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("thread");
  const [text, setText]               = useState("");
  const [sending, setSending]         = useState(false);
  const [photo, setPhoto]             = useState(null);
  const [reads, setReads]             = useState([]);
  const fileRef                       = useRef(null);
  const bottomRef                     = useRef(null);
  const relayBottomRef                = useRef(null);
  const [lastRelayView, setLastRelayView] = useState(Date.now());

  const humanMessages = allMessages.filter(m => m.author_role !== "ai");
  const relayMessages = allMessages.filter(m => m.author_role === "ai");
  const unreadRelay   = relayMessages.filter(m => new Date(m.created_at) > new Date(lastRelayView - 1000)).length;
  const otherReads    = reads.filter(r => r.name !== authorName);

  useEffect(() => {
    recordThreadRead(to.unit_id, authorName, authorRole);
    loadThreadMessages(to.unit_id).then(msgs => { setAllMessages(msgs || []); setLoading(false); });
    loadThreadReads(to.unit_id).then(r => setReads(r || []));
    const interval = setInterval(async () => {
      const fresh = await loadThreadMessages(to.unit_id);
      setAllMessages(fresh || []);
      const fr = await loadThreadReads(to.unit_id);
      setReads(fr || []);
    }, 15000);
    return () => clearInterval(interval);
  }, [to.unit_id]);

  useEffect(() => {
    if (activeTab === "thread") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeTab === "relay") { relayBottomRef.current?.scrollIntoView({ behavior: "smooth" }); setLastRelayView(Date.now()); }
  }, [allMessages, activeTab]);

  function handlePhoto(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setPhoto(e.target.result);
    reader.readAsDataURL(file);
  }

  async function sendMessage() {
    if (!text.trim() && !photo) return;
    setSending(true);
    const msg = await postThreadMessage(to.unit_id, to.unit_number, to.property_name, authorName, authorRole, text.trim(), photo);
    setAllMessages(prev => [...prev, msg]);
    setText(""); setPhoto(null); setSending(false);
  }

  const roleColor = { maintenance: "#e07d2a", leasing: "#007aff" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 200, maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "rgba(249,249,249,0.97)", borderBottom: "0.5px solid #c6c6c8", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 8px" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#007aff", fontSize: 15, fontFamily: "'Inter', sans-serif", fontWeight: 500, display: "flex", alignItems: "center", gap: 3, padding: 0 }}>
            <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M8 1L2 7l6 6" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>Unit {to.unit_number}</p>
            <p style={{ fontSize: 12, color: "#8e8e93" }}>
              {reads.length > 0 ? reads.map(r => r.name.split(" ")[0]).join(", ") : to.property_name}
            </p>
          </div>
          <div style={{ width: 60 }} />
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "0.5px solid #e5e5ea" }}>
          {[
            { id: "thread", label: "Thread" },
            { id: "relay",  label: "Relay", badge: unreadRelay > 0 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? "#007aff" : "transparent"}`, cursor: "pointer", fontSize: 14, fontWeight: 500, color: activeTab === tab.id ? "#007aff" : "#8e8e93", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "'Inter', sans-serif" }}>
              {tab.label}
              {tab.badge && <span style={{ width: 15, height: 15, borderRadius: "50%", background: "#dc2626", color: "white", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadRelay}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Thread tab */}
      {activeTab === "thread" && (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", background: "#f2f2f7", display: "flex", flexDirection: "column", gap: 8 }}>
            {loading ? (
              [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />)
            ) : humanMessages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#3c3c43", marginBottom: 4 }}>No messages yet</p>
                <p style={{ fontSize: 13, color: "#8e8e93" }}>Post an update, question, or photo about this unit</p>
              </div>
            ) : humanMessages.map(msg => {
              const isMe = msg.author_name === authorName;
              const rc = roleColor[msg.author_role] || "#8e8e93";
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: 11, color: "#8e8e93", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: rc }} />
                    {msg.author_name} · {timeAgo(msg.created_at)}
                  </div>
                  <div style={{ maxWidth: "80%", background: isMe ? "#000" : "#fff", borderRadius: isMe ? "18px 4px 18px 18px" : "4px 18px 18px 18px", padding: "10px 14px" }}>
                    {msg.photo_base64 && <img src={msg.photo_base64} alt="unit" style={{ width: "100%", borderRadius: 8, marginBottom: msg.text ? 8 : 0, maxHeight: 200, objectFit: "cover" }} />}
                    {msg.text && <p style={{ fontSize: 14, color: isMe ? "#fff" : "#000", lineHeight: 1.4 }}>{msg.text}</p>}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
            {otherReads.length > 0 && humanMessages.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 11, color: "#8e8e93" }}>Seen by {otherReads.map(r => r.name.split(" ")[0]).join(", ")} · {timeAgo(otherReads.sort((a,b) => new Date(b.seen_at)-new Date(a.seen_at))[0].seen_at)}</span>
              </div>
            )}
          </div>

          {photo && (
            <div style={{ background: "#fff", borderTop: "0.5px solid #e5e5ea", padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <img src={photo} alt="preview" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
              <p style={{ fontSize: 13, color: "#8e8e93", flex: 1 }}>Photo attached</p>
              <button onClick={() => setPhoto(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Remove</button>
            </div>
          )}

          <div style={{ background: "rgba(249,249,249,0.97)", borderTop: "0.5px solid #c6c6c8", padding: "10px 16px 28px", display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
            <button onClick={() => fileRef.current?.click()} style={{ width: 34, height: 34, background: "#f2f2f7", border: "none", borderRadius: 100, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePhoto(e.target.files[0])} />
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
              placeholder="Message..."
              style={{ flex: 1, background: "#ffffff", border: "0.5px solid #c6c6c8", borderRadius: 100, padding: "9px 14px", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", color: "#000" }}
            />
            <button onClick={sendMessage} disabled={sending || (!text.trim() && !photo)}
              style={{ width: 34, height: 34, borderRadius: 100, border: "none", background: (text.trim() || photo) ? "#007aff" : "#e5e5ea", display: "flex", alignItems: "center", justifyContent: "center", cursor: (text.trim() || photo) ? "pointer" : "default", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={(text.trim() || photo) ? "white" : "#c7c7cc"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </>
      )}

      {/* Relay tab */}
      {activeTab === "relay" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", background: "#f2f2f7", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#000" }}>Relay — Agentic AI</p>
                <p style={{ fontSize: 11, color: "#8e8e93" }}>Automatic updates. Read only.</p>
              </div>
            </div>
          </div>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />)
          ) : relayMessages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#3c3c43", marginBottom: 4 }}>Relay is watching</p>
              <p style={{ fontSize: 13, color: "#8e8e93" }}>Stage updates and alerts will appear here automatically</p>
            </div>
          ) : relayMessages.map(msg => (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 11, color: "#8e8e93", marginBottom: 3 }}>Relay · {timeAgo(msg.created_at)}</div>
              <div style={{ background: "#fff", borderLeft: "3px solid #16a34a", borderRadius: "2px 12px 12px 12px", padding: "10px 14px" }}>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={relayBottomRef} />
        </div>
      )}
    </div>
  );
}


function LeasingView({ userName, onSwitchRole }) {
  const { db } = useApp();
  const [selectedThread, setSelectedThread] = useState(null);
  const [filter, setFilter] = useState("all");

  const turnovers = (db.turnovers || []).map(migrateTurnover);
  const withRisk  = analyzeRisk(turnovers);

  const filtered = withRisk.filter(t => {
    if (filter === "attention") return !t.is_ready && t.riskLevel !== "on_track";
    if (filter === "on_track")  return !t.is_ready && t.riskLevel === "on_track";
    if (filter === "ready")     return t.is_ready;
    return true;
  }).sort((a,b) => {
    const order = { critical: 0, at_risk: 1, on_track: 2 };
    return (order[a.riskLevel] ?? 2) - (order[b.riskLevel] ?? 2);
  });

  const total    = withRisk.length;
  const attention = withRisk.filter(t => !t.is_ready && t.riskLevel !== "on_track").length;
  const onTrack  = withRisk.filter(t => !t.is_ready && t.riskLevel === "on_track").length;
  const ready    = withRisk.filter(t => t.is_ready).length;

  const statusColor = { critical: "#dc2626", at_risk: "#e07d2a", on_track: "#16a34a" };

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", fontFamily: "'Inter', sans-serif", paddingBottom: 40 }}>
      <style>{THEME.css}</style>

      {/* Header */}
      <div style={{ background: "rgba(249,249,249,0.94)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "0.5px solid #c6c6c8", padding: "16px 16px 12px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#000", letterSpacing: "-0.02em" }}>Unit Status</h1>
          <button onClick={onSwitchRole} style={{ background: "none", border: "none", cursor: "pointer", color: "#007aff", fontSize: 14, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Switch role</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { id: "all",       label: `All (${total})` },
            { id: "attention", label: `Attention (${attention})` },
            { id: "on_track",  label: `On Track (${onTrack})` },
            { id: "ready",     label: `Ready (${ready})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "5px 12px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif", background: filter === f.id ? "#000" : "#e5e5ea", color: filter === f.id ? "#fff" : "#3c3c43" }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unit list */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 1 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontSize: 15, color: "#8e8e93" }}>No units match</p>
          </div>
        )}
        <div className="card-group">
          {filtered.map((to, i) => {
            const days = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
            const pct  = overallPct(to);
            const sc   = to.is_ready ? "#0284c7" : (statusColor[to.riskLevel] || "#8e8e93");
            return (
              <div key={to.id} style={{ borderLeft: `3px solid ${sc}` }}>
                <div className="row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="unit-avatar">{to.unit_number}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#000" }}>{to.property_name}</span>
                        <span style={{ fontSize: 12, color: sc, fontWeight: 600 }}>
                          {to.is_ready ? "Ready" : days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d`}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#8e8e93", marginTop: 1 }}>
                        {to.assigned_name ? `Lead: ${to.assigned_name}` : "Unassigned"} · {to.lease_status === "leased" ? "Leased" : "Unleased"}
                      </div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: sc }} />
                  </div>
                  {to.riskReason && !to.is_ready && (
                    <p style={{ fontSize: 12, color: sc, fontWeight: 500 }}>{to.riskReason}</p>
                  )}
                  <button onClick={() => setSelectedThread(to)} style={{ background: "none", border: "none", cursor: "pointer", color: "#007aff", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", textAlign: "left", padding: 0 }}>
                    Team Thread →
                  </button>
                </div>
                {i < filtered.length - 1 && <div style={{ height: "0.5px", background: "#e5e5ea", marginLeft: 58 }} />}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedThread && (
          <UnitThread to={selectedThread} authorName={userName} authorRole="leasing" onClose={() => setSelectedThread(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentPage() {
  const { db } = useApp();
  const [log, setLog]             = useState([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [running, setRunning]     = useState(false);
  const [lastRun, setLastRun]     = useState(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [settings, setSettings]   = useState({
    morningBriefingEnabled: true,
    briefingTime: "06:00",
    smsAlerts: true,
    supervisorPhone: "",
    riskCheckInterval: 15,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [runResult, setRunResult]  = useState(null);

  const activeTurnovers = (db.turnovers || []).filter(t => !t.is_ready);
  const criticalCount   = activeTurnovers.filter(t => {
    const days = Math.ceil((new Date(t.target_ready_date) - Date.now()) / 86400000);
    return days < 0 || (t.stages || []).some(s => s.status === "in_progress" && (s.tasks || []).filter(tk => tk.completed_at).length === 0);
  }).length;

  useEffect(() => {
    loadAgentLog().then(data => { setLog(data || []); setLoadingLog(false); });

  }, []);

  async function runAgent(type = "monitor") {
    setRunning(true);
    setRunResult(null);
    try {
      const url = type === "morning"
        ? "/.netlify/functions/agent-observe?type=morning"
        : "/.netlify/functions/agent-observe";
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await r.json();
      setRunResult(data);
      setLastRun(new Date());
      // Refresh log
      const freshLog = await loadAgentLog();
      setLog(freshLog || []);
    } catch (e) {
      setRunResult({ error: e.message });
    }
    setRunning(false);
  }

  async function sendTestSMS() {
    if (!settings.supervisorPhone) return;
    try {
      await fetch("/.netlify/functions/agent-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: settings.supervisorPhone,
          message: `Mainlync Agent test message. You have ${activeTurnovers.length} active turnovers. Agent monitoring is active.`,
        }),
      });
      alert("Test SMS sent!");
    } catch (e) {
      alert("SMS failed: " + e.message);
    }
  }

  const typeColors = {
    morning_briefing: { bg: "#fff7ed", border: "#fed7aa", color: "#c2570a", label: "Morning Briefing" },
    critical_alert:   { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", label: "Critical Alert" },
    risk_alert:       { bg: "#fefce8", border: "#fde68a", color: "#a16207", label: "Risk Alert" },
    action:           { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", label: "Action Taken" },
  };

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: "#e07d2a", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>AI Operations</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#000000", letterSpacing: "-0.02em" }}>Relay</h1>
            <p style={{ fontSize: 11, color: "#8e8e93", marginTop: 2 }}>Mainlync's Agentic AI — v{RELAY_VERSION}</p>
          </div>
          <button
            onClick={() => setSettingsOpen(s => !s)}
            style={{ width: 36, height: 36, background: "#f2f2f7", border: "1px solid #e8e4de", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3c3c43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </div>

      {/* Agent status card */}
      <div style={{ background: "linear-gradient(135deg, #fff7ed, #fef3e8)", border: "1px solid #fed7aa", borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px #e07d2a40" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#000000" }}>Relay</p>
            <p style={{ fontSize: 11, color: "#8e8e93" }}>
              {lastRun ? `Last run ${lastRun.toLocaleTimeString()}` : "Ready to run"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 8px #05966980" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Active</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Monitoring", value: activeTurnovers.length, color: "#e07d2a" },
            { label: "Critical",   value: criticalCount,           color: criticalCount > 0 ? "#dc2626" : "#8e8e93" },
            { label: "Log Entries", value: log.length,             color: "#3c3c43" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 8px", textAlign: "center", border: "1px solid #fed7aa" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#8e8e93", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button
            onClick={() => runAgent("monitor")}
            disabled={running}
            style={{
              padding: "11px", borderRadius: 12, border: "none", cursor: running ? "default" : "pointer",
              background: running ? "#f2f2f7" : "#000000",
              color: running ? "#8e8e93" : "white",
              fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: running ? "none" : "0 4px 12px #e07d2a40",
            }}
          >
            {running ? (
              <><div style={{ width: 14, height: 14, border: "2px solid #c8c0b8", borderTopColor: "#e07d2a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Running...</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Now</>
            )}
          </button>
          <button
            onClick={() => runAgent("morning")}
            disabled={running}
            style={{
              padding: "11px", borderRadius: 12,
              border: "1px solid #fed7aa", cursor: running ? "default" : "pointer",
              background: "rgba(255,255,255,0.7)", color: "#c2570a",
              fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
            Morning Briefing
          </button>
        </div>

        {/* Run result */}
        {runResult && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12, background: runResult.error ? "#fef2f2" : "#f0fdf4", border: `1px solid ${runResult.error ? "#fecaca" : "#86efac"}`, borderRadius: 10, padding: "10px 12px" }}>
            {runResult.error ? (
              <p style={{ fontSize: 12, color: "#dc2626" }}>Error: {runResult.error}</p>
            ) : (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>
                  Checked {runResult.turnoversChecked} turnovers — {runResult.actions?.length || 0} action{runResult.actions?.length !== 1 ? "s" : ""} taken
                </p>
                {runResult.actions?.map((a, i) => (
                  <p key={i} style={{ fontSize: 11, color: "#3c3c43", marginTop: 3 }}>{a.type}: {a.message?.slice(0, 80)}...</p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden", marginBottom: 16 }}>
            <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Agent Settings</p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, display: "block", marginBottom: 6 }}>Supervisor Phone (for SMS alerts)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input-dark"
                    placeholder="+1 512 555 0100"
                    value={settings.supervisorPhone}
                    onChange={e => setSettings(s => ({ ...s, supervisorPhone: e.target.value }))}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={sendTestSMS}
                    disabled={!settings.supervisorPhone}
                    style={{ padding: "0 14px", borderRadius: 11, border: "1px solid #e8e4de", background: settings.supervisorPhone ? "#fff7ed" : "#f2f2f7", color: settings.supervisorPhone ? "#e07d2a" : "#8e8e93", fontSize: 12, fontWeight: 700, cursor: settings.supervisorPhone ? "pointer" : "default", whiteSpace: "nowrap" }}
                  >
                    Test SMS
                  </button>
                </div>
                <p style={{ fontSize: 10, color: "#8e8e93", marginTop: 4 }}>Used for urgent alerts when a unit goes critical</p>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, display: "block", marginBottom: 6 }}>Morning Briefing Time</label>
                <input
                  className="input-dark"
                  type="time"
                  value={settings.briefingTime}
                  onChange={e => setSettings(s => ({ ...s, briefingTime: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid #e5e5ea" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#000000" }}>SMS Urgent Alerts</p>
                  <p style={{ fontSize: 11, color: "#8e8e93" }}>Text when units go critical</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, smsAlerts: !s.smsAlerts }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                    background: settings.smsAlerts ? "#000000" : "#e5e5ea",
                    position: "relative", transition: "background 0.2s",
                  }}
                >
                  <div style={{ position: "absolute", top: 2, left: settings.smsAlerts ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent activity log */}
      <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
          Activity Log {log.length > 0 ? `(${log.length})` : ""}
        </p>

        {loadingLog ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
          </div>
        ) : log.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c6c6c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 10px" }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#3c3c43", marginBottom: 4 }}>No activity yet</p>
            <p style={{ fontSize: 11, color: "#8e8e93" }}>Tap "Run Now" to start the agent</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {log.slice(0, 20).map((entry, i) => {
              const tc = typeColors[entry.type] || typeColors.action;
              return (
                <div key={entry.id || i} style={{ background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: tc.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {tc.label}
                      {entry.unit_number && ` — Unit ${entry.unit_number}`}
                    </span>
                    <span style={{ fontSize: 9, color: "#8e8e93", whiteSpace: "nowrap", marginLeft: 8 }}>
                      {entry.created_at ? timeAgo(entry.created_at) : ""}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "#000000", lineHeight: 1.5 }}>{entry.description}</p>
                  {entry.action_taken && (
                    <p style={{ fontSize: 10, color: tc.color, marginTop: 4, fontWeight: 600 }}>
                      Action: {entry.action_taken}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function genShareToken() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Shared storage key — shared:true so any browser with the token can read/write
function sharedKey(token) { return `share_${token}`; }

// Save a turnover snapshot to shared storage under its token
async function publishShare(to) {
  const token = to.share_token;
  if (!token) return;
  try {
    await window.storage.set(sharedKey(token), JSON.stringify({
      ...to,
      _shared_at: new Date().toISOString(),
    }), true);
  } catch (e) { console.warn("Share publish failed", e); }
}

// Load a shared turnover by token
async function loadShare(token) {
  try {
    const res = await window.storage.get(sharedKey(token), true);
    return res ? JSON.parse(res.value) : null;
  } catch { return null; }
}

// Save updates back to shared storage (for external task-checkers)
async function saveShareUpdate(token, data) {
  try {
    await window.storage.set(sharedKey(token), JSON.stringify(data), true);
  } catch (e) { console.warn("Share save failed", e); }
}

// Build the shareable URL for a token
function shareUrl(token) {
  const base = window.location.href.split("#")[0];
  return `${base}#share/${token}`;
}

//  Share button + sheet (used inside UnitDrawer) 
function ShareButton({ to, db, updateDB }) {
  const [state, setState] = useState("idle"); // idle | generating | ready | copied
  const [shareToken, setShareToken] = useState(to.share_token || null);

  async function handleShare() {
    setState("generating");
    let token = shareToken;

    // Generate token if first time
    if (!token) {
      token = genShareToken();
      // Save token to the turnover record
      const updatedTurnovers = db.turnovers.map(t =>
        t.id === to.id ? { ...migrateTurnover(t), share_token: token } : t
      );
      await updateDB({ ...db, turnovers: updatedTurnovers });
      setShareToken(token);
    }

    // Publish latest state to shared storage
    await publishShare({ ...migrateTurnover(to), share_token: token });
    setState("ready");
  }

  async function copyLink() {
    const url = shareUrl(shareToken);
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("ready"), 2000);
    } catch {
      // Fallback — select the text
      setState("copied");
      setTimeout(() => setState("ready"), 2000);
    }
  }

  async function refreshShare() {
    setState("generating");
    await publishShare({ ...migrateTurnover(to), share_token: shareToken });
    setState("ready");
  }

  const url = shareToken ? shareUrl(shareToken) : null;

  return (
    <div style={{ marginBottom: 10 }}>
      {state === "idle" && (
        <button
          onClick={handleShare}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 12,
            background: "linear-gradient(135deg, #e07d2a20, #c45e0a20)",
            border: "1px solid #e07d2a40",
            color: "#f0a05a", fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <Icon name="share" size={15} /> Share Make-Ready Link
        </button>
      )}

      {state === "generating" && (
        <div style={{
          width: "100%", padding: "11px 16px", borderRadius: 12,
          background: "#ffffff", border: "1px solid #e8e4de",
          color: "#8e8e93", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <Icon name="loader" size={14} /> Generating link...
        </div>
      )}

      {(state === "ready" || state === "copied") && url && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 14, border: "1px solid #e07d2a40",
            background: "linear-gradient(135deg, #e07d2a08, #c45e0a08)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #e07d2a20", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="share" size={13} style={{ color: "white" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#f0a05a" }}>Share Link Active</p>
              <p style={{ fontSize: 10, color: "#8e8e93" }}>Anyone with this link can view & update progress</p>
            </div>
            <button onClick={refreshShare} title="Sync latest data" style={{ width: 28, height: 28, background: "#e07d2a20", border: "1px solid #e07d2a30", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Icon name="refresh" size={12} style={{ color: "#e07d2a" }} />
            </button>
          </div>

          {/* URL display */}
          <div style={{ padding: "10px 14px" }}>
            <div style={{
              background: "#f8fafc", border: "1px solid #e8e4de", borderRadius: 10,
              padding: "8px 12px", marginBottom: 10,
              fontFamily: "monospace", fontSize: 11, color: "#3c3c43",
              wordBreak: "break-all", lineHeight: 1.5,
            }}>
              {url}
            </div>

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              <button
                onClick={copyLink}
                style={{
                  padding: "9px 6px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                  background: state === "copied" ? "#16a34a" : "#000000",
                  color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  transition: "background 0.2s",
                }}
              >
                <Icon name={state === "copied" ? "check" : "copy"} size={12} />
                {state === "copied" ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: `Unit ${to.unit_number} Make-Ready`, text: `Track make-ready progress for Unit ${to.unit_number} at ${to.property_name}`, url });
                  } else { copyLink(); }
                }}
                style={{
                  padding: "9px 6px", borderRadius: 10, border: "1px solid #e07d2a40", cursor: "pointer", fontSize: 11, fontWeight: 700,
                  background: "#e07d2a15", color: "#f0a05a",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                <Icon name="send" size={12} /> Send
              </button>

              <button
                onClick={() => setState("idle")}
                style={{
                  padding: "9px 6px", borderRadius: 10, border: "1px solid #e8e4de", cursor: "pointer", fontSize: 11, fontWeight: 600,
                  background: "#ffffff", color: "#8e8e93",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                <Icon name="x" size={12} /> Close
              </button>
            </div>

            {/* Who can access note */}
            <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11 }}></span>
              <p style={{ fontSize: 10, color: "#8e8e93", lineHeight: 1.5 }}>
                Vendors & techs can open this on their phone, check off tasks, and leave their name — no account needed. Changes sync back to your board.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

//  Public Shared Unit View — the page external visitors see 
function SharedUnitView({ token }) {
  const [to, setTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { stageId, taskId }
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [openStageId, setOpenStageId] = useState(null);
  const [justChecked, setJustChecked] = useState(null); // taskId for animation

  useEffect(() => {
    async function load() {
      const data = await loadShare(token);
      if (!data) { setNotFound(true); setLoading(false); return; }
      const migrated = migrateTurnover(data);
      setTo(migrated);
      // Auto-open first in_progress stage
      const firstIP = migrated.stages?.find(s => s.status === "in_progress");
      if (firstIP) setOpenStageId(firstIP.id);
      setLoading(false);
    }
    load();
  }, [token]);

  async function handleTaskToggle(stageId, taskId) {
    if (!visitorName) {
      setPendingAction({ stageId, taskId });
      setShowNamePrompt(true);
      return;
    }
    await doToggle(stageId, taskId, visitorName);
  }

  async function doToggle(stageId, taskId, name) {
    setSaving(true);
    setJustChecked(taskId);
    const updated = {
      ...to,
      stages: to.stages.map(s => s.id !== stageId ? s : {
        ...s,
        tasks: s.tasks.map(tk => tk.id !== taskId ? tk : {
          ...tk,
          completed: !tk.completed,
          completed_at: !tk.completed ? new Date().toISOString() : null,
          completed_by: !tk.completed ? name : null,
        }),
      }),
    };
    setTo(updated);
    await saveShareUpdate(token, updated);
    setSaving(false);
    setLastSaved(new Date());
    setTimeout(() => setJustChecked(null), 600);
  }

  function confirmName() {
    const name = nameInput.trim();
    if (!name) return;
    setVisitorName(name);
    setShowNamePrompt(false);
    if (pendingAction) {
      doToggle(pendingAction.stageId, pendingAction.taskId, name);
      setPendingAction(null);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "#f8fafc" }}>
      <style>{THEME.css}</style>
      <div style={{ width: 52, height: 52, background: "#000000", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="wrench" size={26} style={{ color: "white" }} />
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", animationDelay: `${i*0.2}s` }} />)}
      </div>
      <p style={{ fontSize: 13, color: "#8e8e93" }}>Loading make-ready board...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#f8fafc", textAlign: "center" }}>
      <style>{THEME.css}</style>
      <div style={{ fontSize: 48, marginBottom: 16 }}></div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#000000", marginBottom: 8 }}>Link not found</h2>
      <p style={{ fontSize: 14, color: "#8e8e93", lineHeight: 1.6 }}>This make-ready link may have expired or been removed by the property manager.</p>
    </div>
  );

  const pct = overallPct(to);
  const daysLeft = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const doneStages = (to.stages || []).filter(s => s.status === "done").length;
  const totalStages = MR_STAGES.length;

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", maxWidth: 480, margin: "0 auto" }}>
      <style>{THEME.css}</style>

      {/*  Header bar  */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,15,0.95)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #e8e4de",
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "#000000", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="wrench" size={16} style={{ color: "white" }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#e07d2a", letterSpacing: "0.06em", textTransform: "uppercase" }}>Mainlync</p>
            <p style={{ fontSize: 10, color: "#8e8e93" }}>Make-Ready Board</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {saving ? (
            <p style={{ fontSize: 10, color: "#e07d2a" }}>Saving...</p>
          ) : lastSaved ? (
            <p style={{ fontSize: 10, color: "#8e8e93" }}>Saved {timeAgo(lastSaved.toISOString())}</p>
          ) : null}
          {visitorName && (
            <p style={{ fontSize: 10, color: "#8e8e93" }}>Logged as <span style={{ color: "#f0a05a", fontWeight: 700 }}>{visitorName}</span></p>
          )}
        </div>
      </div>

      <div style={{ padding: "20px 16px 100px" }}>

        {/*  Unit hero card  */}
        <div style={{
          background: to.is_ready ? "linear-gradient(135deg, #05966910, #10b98110)" : "linear-gradient(135deg, #e07d2a10, #c45e0a08)",
          border: `1px solid ${to.is_ready ? "#86efac" : "#e07d2a30"}`,
          borderRadius: 20, padding: "20px 20px 16px", marginBottom: 20,
        }}>
          {to.is_ready && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, background: "#dcfce7", border: "1px solid #05966935", borderRadius: 10, padding: "7px 12px" }}>
              <Icon name="check_circle" size={16} style={{ color: "#16a34a" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>This unit is Move-In Ready!</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#000000", lineHeight: 1.1 }}>Unit {to.unit_number}</h1>
              <p style={{ fontSize: 13, color: "#3c3c43", marginTop: 4 }}>{to.property_name}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                background: to.lease_status === "leased" ? "#dcfce7" : "#f0b40015",
                color: to.lease_status === "leased" ? "#16a34a" : "#f5d05e",
                border: `1px solid ${to.lease_status === "leased" ? "#86efac" : "#f0b40035"}`,
              }}>
                {to.lease_status === "leased" ? " Leased" : " Unleased"}
              </span>
              <p style={{ fontSize: 11, color: daysLeft < 0 ? "#dc2626" : daysLeft <= 3 ? "#ffad5c" : "#8e8e93", marginTop: 5, fontWeight: 600 }}>
                {daysLeft < 0 ? ` ${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d to target`}
              </p>
            </div>
          </div>

          {/* Progress ring + stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {/* Big percentage */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: pct === 100 ? "#16a34a" : "#f0a05a", lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 10, color: "#8e8e93", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>Complete</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, borderRadius: 4, background: "#f2f2f7", overflow: "hidden", marginBottom: 8 }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 4, background: pct === 100 ? "#16a34a" : "linear-gradient(90deg,#e07d2a,#c45e0a)" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div style={{ background: "#f2f2f7", borderRadius: 8, padding: "6px 10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>{doneStages}</div>
                  <div style={{ fontSize: 9, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Stages Done</div>
                </div>
                <div style={{ background: "#f2f2f7", borderRadius: 8, padding: "6px 10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#7fa8ff" }}>{totalStages - doneStages}</div>
                  <div style={{ fontSize: 9, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Remaining</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stage grid overview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
            {MR_STAGES.map(def => {
              const s = (to.stages || []).find(st => st.id === def.id) || { status: "idle", tasks: [] };
              const isDone = s.status === "done";
              const isIP   = s.status === "in_progress";
              const done = s.tasks.filter(t => t.completed).length;
              const total = s.tasks.length;
              return (
                <button
                  key={def.id}
                  onClick={() => setOpenStageId(openStageId === def.id ? null : def.id)}
                  style={{
                    padding: "7px 8px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    background: isDone ? def.bg : isIP ? def.bg : "#f2f2f7",
                    border: `1px solid ${isDone ? def.accent : isIP ? def.accent : "#f2f2f7"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: isDone ? def.dot : isIP ? def.dot : "#c6c6c8", flexShrink: 0 }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: isDone ? def.color : isIP ? def.color : "#b8b0a8", textTransform: "uppercase", letterSpacing: "0.03em" }}>{def.short}</span>
                  </div>
                  <div style={{ fontSize: 9, color: isDone ? "#16a34a" : isIP ? def.color : "#c6c6c8", fontWeight: 600 }}>{done}/{total}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/*  Worker identity banner  */}
        {!visitorName ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#f2f2f7", border: "1px solid #e07d2a30", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}
          >
            <div style={{ width: 36, height: 36, background: "#e07d2a20", border: "1px solid #e07d2a40", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="users" size={16} style={{ color: "#f0a05a" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#000000", marginBottom: 2 }}>Who's working today?</p>
              <p style={{ fontSize: 11, color: "#8e8e93" }}>Enter your name to check off tasks</p>
            </div>
            <button
              onClick={() => setShowNamePrompt(true)}
              style={{ padding: "8px 14px", borderRadius: 10, background: "#000000", border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Sign In
            </button>
          </motion.div>
        ) : (
          <div style={{ background: "#dcfce7", border: "1px solid #05966930", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="check_circle" size={14} style={{ color: "#16a34a" }} />
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>Signed in as {visitorName}</span>
            <button onClick={() => setVisitorName("")} style={{ marginLeft: "auto", fontSize: 11, color: "#8e8e93", background: "none", border: "none", cursor: "pointer" }}>Change</button>
          </div>
        )}

        {/*  Stage accordions  */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MR_STAGES.map(def => {
            const stageObj = (to.stages || []).find(s => s.id === def.id) || { id: def.id, status: "idle", tasks: [] };
            const tasks = stageObj.tasks || [];
            const taskDone = tasks.filter(t => t.completed).length;
            const taskTotal = tasks.length;
            const isDone = stageObj.status === "done";
            const isIP   = stageObj.status === "in_progress";
            const isOpen = openStageId === def.id;

            const statusStyle = isDone
              ? { bg: "#dcfce7", border: "#86efac", color: "#16a34a" }
              : isIP
              ? { bg: def.bg, border: def.accent, color: def.color }
              : { bg: "#f2f2f7", border: "#f2f2f7", color: "#8e8e93" };

            return (
              <div key={def.id}>
                <button
                  onClick={() => setOpenStageId(isOpen ? null : def.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 14px",
                    borderRadius: isOpen ? "12px 12px 0 0" : 12,
                    background: statusStyle.bg,
                    border: `1px solid ${statusStyle.border}`,
                    borderBottom: isOpen ? "none" : undefined,
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isDone ? "#16a34a" : isIP ? def.dot : "#e5e5ea",
                    border: !isDone && !isIP ? "1.5px solid #d6d0c8" : "none",
                  }}>
                    {isDone
                      ? <Icon name="check" size={12} style={{ color: "#f8fafc" }} />
                      : isIP
                      ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f8fafc" }} />
                      : null
                    }
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, flex: 1, textAlign: "left", color: statusStyle.color }}>{def.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: taskDone === taskTotal && taskTotal > 0 ? "#16a34a" : statusStyle.color }}>
                    {taskDone}/{taskTotal}
                  </span>
                  <Icon name={isOpen ? "chevron_down" : "chevron_right"} size={16} style={{ color: "#8e8e93" }} />
                </button>

                <AnimatePresence>
                  {isOpen && tasks.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        overflow: "hidden",
                        background: "#f2f2f7",
                        border: `1px solid ${statusStyle.border}`,
                        borderTop: "none",
                        borderRadius: "0 0 12px 12px",
                      }}
                    >
                      {/* Stage status indicator */}
                      <div style={{ padding: "8px 14px 6px", borderBottom: "1px solid #ede9e3", display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: isDone ? "#16a34a" : isIP ? def.dot : "#c6c6c8" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? "#16a34a" : isIP ? def.color : "#8e8e93" }}>
                          {isDone ? "Stage complete" : isIP ? "In progress" : "Not started"}
                        </span>
                        {taskDone > 0 && (
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "#8e8e93" }}>
                            {taskDone} of {taskTotal} tasks done
                          </span>
                        )}
                      </div>

                      {tasks.map((tk, ti) => (
                        <motion.div
                          key={tk.id}
                          animate={justChecked === tk.id ? { backgroundColor: ["#f2f2f7", `${def.dot}15`, "#f2f2f7"] } : {}}
                          transition={{ duration: 0.5 }}
                          style={{ padding: "12px 14px", borderBottom: ti < tasks.length - 1 ? "1px solid #ede9e3" : "none" }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <button
                              onClick={() => handleTaskToggle(def.id, tk.id)}
                              style={{
                                width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1,
                                border: tk.completed ? "none" : "1.5px solid #b8b0a8",
                                background: tk.completed ? def.dot : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: justChecked === tk.id ? `0 0 0 3px ${def.dot}30` : "none",
                                transition: "box-shadow 0.3s",
                              }}
                            >
                              {tk.completed && <Icon name="check" size={13} style={{ color: "#f8fafc" }} />}
                            </button>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ fontSize: 16 }}>{tk.icon}</span>
                                <span style={{ fontSize: 13, color: tk.completed ? "#8e8e93" : "#000000", textDecoration: tk.completed ? "line-through" : "none", fontWeight: tk.completed ? 400 : 500, lineHeight: 1.4 }}>
                                  {tk.label}
                                </span>
                              </div>
                              {tk.completed && (
                                <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  {tk.completed_by && (
                                    <span style={{ fontSize: 10, color: def.color, background: `${def.dot}15`, border: `1px solid ${def.dot}30`, borderRadius: 100, padding: "2px 8px", fontWeight: 600 }}>
                                       {tk.completed_by}
                                    </span>
                                  )}
                                  {tk.assignee_name && tk.assignee_name !== tk.completed_by && (
                                    <span style={{ fontSize: 10, color: "#8e8e93" }}>assigned to {tk.assignee_name}</span>
                                  )}
                                  {tk.completed_at && (
                                    <span style={{ fontSize: 10, color: "#333348" }}>{timeAgo(tk.completed_at)}</span>
                                  )}
                                </div>
                              )}
                              {!tk.completed && tk.assignee_name && (
                                <div style={{ marginTop: 4 }}>
                                  <span style={{ fontSize: 10, color: "#e07d2a", background: "#e07d2a12", border: "1px solid #e07d2a30", borderRadius: 100, padding: "2px 8px", fontWeight: 600 }}>
                                     Assigned: {tk.assignee_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/*  Powered by footer  */}
        <div style={{ marginTop: 40, textAlign: "center", padding: "20px 0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 100 }}>
            <div style={{ width: 20, height: 20, background: "#000000", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="wrench" size={10} style={{ color: "white" }} />
            </div>
            <span style={{ fontSize: 11, color: "#8e8e93", fontWeight: 600 }}>Powered by </span>
            <span style={{ fontSize: 11, fontWeight: 800, background: "#000000", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mainlync</span>
          </div>
          <p style={{ fontSize: 10, color: "#c7c7cc", marginTop: 8 }}>Make-ready coordination for property teams</p>
        </div>
      </div>

      {/*  Name prompt modal  */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "flex-end", maxWidth: 480, margin: "0 auto" }}
            onClick={() => setShowNamePrompt(false)}
          >
            <motion.div
              initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", background: "#ffffff", borderRadius: "22px 22px 0 0", border: "1px solid #d6d0c8", borderBottom: "none", padding: "24px 20px 36px" }}
            >
              <div style={{ width: 36, height: 4, background: "#c6c6c8", borderRadius: 2, margin: "0 auto 20px" }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#000000", marginBottom: 6 }}>What's your name?</h3>
              <p style={{ fontSize: 13, color: "#8e8e93", marginBottom: 20, lineHeight: 1.5 }}>
                Your name will be recorded when you check off tasks so the property manager knows who did what.
              </p>
              <input
                autoFocus
                className="input-dark"
                placeholder="e.g. Mike the Painter"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && confirmName()}
                style={{ width: "100%", marginBottom: 12, fontSize: 15 }}
              />
              <button
                onClick={confirmName}
                disabled={!nameInput.trim()}
                style={{
                  width: "100%", padding: "13px", borderRadius: 13, border: "none",
                  background: nameInput.trim() ? "#000000" : "#f2f2f7",
                  color: nameInput.trim() ? "white" : "#8e8e93",
                  fontSize: 14, fontWeight: 700, cursor: nameInput.trim() ? "pointer" : "default",
                  boxShadow: nameInput.trim() ? "0 4px 14px #e07d2a40" : "none",
                }}
              >
                Start Working
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 
//   DESKTOP HUB — PM / LEASING AGENT VIEW
// 

// Shared sync key — written by desktop, read by mobile (and vice-versa)
const SYNC_KEY   = "mainlync_live_board";
const SYNC_INTERVAL = 20000; // 20-second poll

async function writeSyncBoard(db) {
  try {
    await window.storage.set(SYNC_KEY, JSON.stringify({
      turnovers: db.turnovers,
      team:      db.team,
      lastUpdated: new Date().toISOString(),
      updatedBy: "desktop",
    }), true);
  } catch (e) { console.warn("sync write failed", e); }
}

async function readSyncBoard() {
  try {
    const r = await window.storage.get(SYNC_KEY, true);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

// Append an activity entry to the shared log
async function logActivity(entry) {
  try {
    const key = "mainlync_activity_log";
    const existing = await window.storage.get(key, true);
    const log = existing ? JSON.parse(existing.value) : [];
    log.unshift({ ...entry, id: genId("act"), ts: new Date().toISOString() });
    await window.storage.set(key, JSON.stringify(log.slice(0, 80)), true);
  } catch {}
}

async function readActivityLog() {
  try {
    const r = await window.storage.get("mainlync_activity_log", true);
    return r ? JSON.parse(r.value) : [];
  } catch { return []; }
}

//  Desktop Hub root 
function DesktopHub({ db: initialDb, updateDB: persistDB }) {
  const [db, setDb]           = useState(initialDb);
  const [lastSync, setLastSync]     = useState(null);
  const [syncPulse, setSyncPulse]   = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null); // turnover id
  const [activityLog, setActivityLog]   = useState([]);
  const [activeTab, setActiveTab]       = useState("board"); // board | analytics
  const [filterProperty, setFilterProperty] = useState("all");
  const [showNewTurnover, setShowNewTurnover] = useState(false);
  const [notification, setNotification] = useState(null);

  //  Sync loop 
  const syncFromMobile = useCallback(async () => {
    const remote = await readSyncBoard();
    if (!remote) return;
    // Only update if mobile wrote it more recently than desktop
    if (remote.updatedBy === "mobile" && remote.lastUpdated) {
      const remoteTs = new Date(remote.lastUpdated).getTime();
      const localTs  = lastSync ? new Date(lastSync).getTime() : 0;
      if (remoteTs > localTs) {
        setDb(prev => ({ ...prev, turnovers: remote.turnovers }));
        setSyncPulse(true);
        setTimeout(() => setSyncPulse(false), 1200);
      }
    }
    const log = await readActivityLog();
    setActivityLog(log);
    setLastSync(remote.lastUpdated || new Date().toISOString());
  }, [lastSync]);

  useEffect(() => {
    syncFromMobile();
    const id = setInterval(syncFromMobile, SYNC_INTERVAL);
    return () => clearInterval(id);
  }, [syncFromMobile]);

  //  Write mutations 
  const mutate = useCallback(async (newDb, actEntry) => {
    setDb(newDb);
    await persistDB(newDb);
    await writeSyncBoard(newDb);
    if (actEntry) await logActivity(actEntry);
    if (actEntry) {
      setActivityLog(prev => [{ ...actEntry, id: genId("act"), ts: new Date().toISOString() }, ...prev].slice(0, 80));
    }
    setLastSync(new Date().toISOString());
    setSyncPulse(true);
    setTimeout(() => setSyncPulse(false), 1200);
  }, [persistDB]);

  const pushNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  //  Stage operations 
  async function setStageStatus(toId, stageId, newStatus) {
    const newDb = {
      ...db,
      turnovers: db.turnovers.map(t => {
        if (t.id !== toId) return t;
        const m = migrateTurnover(t);
        return { ...m, stages: m.stages.map(s => s.id === stageId ? { ...s, status: newStatus } : s) };
      }),
    };
    const to = db.turnovers.find(t => t.id === toId);
    const stageDef = MR_STAGES.find(s => s.id === stageId);
    await mutate(newDb, { type: "stage", text: `Unit ${to?.unit_number} — ${stageDef?.label} marked ${newStatus.replace("_", " ")}`, unit: to?.unit_number, property: to?.property_name });
    pushNotification(`${stageDef?.label} updated for Unit ${to?.unit_number}`);
  }

  async function assignStageToMember(toId, stageId, memberId) {
    const member = db.team.find(m => m.id === memberId);
    const newDb = {
      ...db,
      turnovers: db.turnovers.map(t => {
        if (t.id !== toId) return t;
        const m = migrateTurnover(t);
        return {
          ...m, stages: m.stages.map(s => s.id !== stageId ? s : {
            ...s,
            assigned_to: memberId,
            assigned_name: member?.name || null,
          }),
        };
      }),
    };
    const to = db.turnovers.find(t => t.id === toId);
    const stageDef = MR_STAGES.find(s => s.id === stageId);
    await mutate(newDb, { type: "assign", text: `${member?.name} assigned to ${stageDef?.label} — Unit ${to?.unit_number}`, unit: to?.unit_number, property: to?.property_name });
    pushNotification(`${member?.name} assigned to ${stageDef?.label}`);
  }

  async function toggleTask(toId, stageId, taskId) {
    const newDb = {
      ...db,
      turnovers: db.turnovers.map(t => {
        if (t.id !== toId) return t;
        const m = migrateTurnover(t);
        return {
          ...m, stages: m.stages.map(s => s.id !== stageId ? s : {
            ...s, tasks: s.tasks.map(tk => tk.id !== taskId ? tk : {
              ...tk, completed: !tk.completed,
              completed_at: !tk.completed ? new Date().toISOString() : null,
              completed_by: !tk.completed ? "Property Manager" : null,
            }),
          }),
        };
      }),
    };
    await mutate(newDb, null);
  }

  async function markReady(toId, isReady) {
    const to = db.turnovers.find(t => t.id === toId);
    const newDb = { ...db, turnovers: db.turnovers.map(t => t.id === toId ? { ...migrateTurnover(t), is_ready: isReady } : t) };
    await mutate(newDb, { type: "ready", text: `Unit ${to?.unit_number} marked ${isReady ? "Move-In Ready " : "reopened"}`, unit: to?.unit_number, property: to?.property_name });
    if (isReady) pushNotification(` Unit ${to?.unit_number} is Move-In Ready!`);
  }

  async function createTurnover(form) {
    const unit = db.units.find(u => u.id === form.unit_id);
    if (!unit) return;
    const prop   = db.properties.find(p => p.id === unit.property_id);
    const member = db.team.find(m => m.id === form.assigned_to);
    const record = buildMakeReadyRecord(unit, prop, member, form.target_ready_date, form.lease_status);
    const newDb  = { ...db, turnovers: [record, ...db.turnovers] };
    await mutate(newDb, { type: "created", text: `Turnover created — Unit ${unit.unit_number} at ${prop?.name}`, unit: unit.unit_number, property: prop?.name });
    setShowNewTurnover(false);
    pushNotification(`Turnover created for Unit ${unit.unit_number}`);
  }

  async function deleteTurnover(toId) {
    const to = db.turnovers.find(t => t.id === toId);
    const newDb = { ...db, turnovers: db.turnovers.filter(t => t.id !== toId) };
    await mutate(newDb, { type: "deleted", text: `Turnover removed — Unit ${to?.unit_number}`, unit: to?.unit_number, property: to?.property_name });
    setSelectedUnit(null);
  }

  //  Derived data 
  const units = db.turnovers.map(migrateTurnover);
  const filtered = filterProperty === "all" ? units : units.filter(u => u.property_id === filterProperty);
  const selectedTO = selectedUnit ? units.find(u => u.id === selectedUnit) : null;

  const stats = {
    total:    units.length,
    ready:    units.filter(u => u.is_ready).length,
    active:   units.filter(u => !u.is_ready && u.stages?.some(s => s.status === "in_progress")).length,
    overdue:  units.filter(u => { const d = Math.ceil((new Date(u.target_ready_date) - Date.now()) / 86400000); return d < 0 && !u.is_ready; }).length,
    avgDays:  units.length === 0 ? 0 : Math.round(units.reduce((s, u) => {
      const created = new Date(u.created_date || Date.now()).getTime();
      return s + (Date.now() - created) / 86400000;
    }, 0) / units.length),
  };

  //  Render — Cake-style dashboard layout
  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", display: "flex", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{THEME.css}</style>
      <style>{`
        .desk-nav-item { transition: background 0.15s; }
        .desk-nav-item:hover { background: #f2f2f7 !important; }
        .desk-nav-item.active { background: #eff6ff !important; color: #2563eb !important; }
        .desk-card { transition: box-shadow 0.15s; }
        .desk-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }
        .desk-row:hover { background: #f8f8fa !important; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* LEFT SIDEBAR */}
      <div style={{ width: 220, flexShrink: 0, background: "#ffffff", borderRight: "0.5px solid #e5e5ea", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "0.5px solid #e5e5ea" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#000", letterSpacing: "-0.01em", lineHeight: 1 }}>Mainlync</p>
              <p style={{ fontSize: 10, color: "#8e8e93", marginTop: 1 }}>PM Hub</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {[
            { id: "board",     label: "Make Ready Board", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
            { id: "analytics", label: "Analytics",        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
            { id: "team",      label: "Team",             icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { id: "relay",     label: "Relay AI",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`desk-nav-item${activeTab === item.id ? " active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", width: "100%", background: activeTab === item.id ? "#eff6ff" : "transparent", color: activeTab === item.id ? "#2563eb" : "#3c3c43", fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400, fontFamily: "'Inter', sans-serif" }}>
              <span style={{ color: activeTab === item.id ? "#2563eb" : "#8e8e93", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ height: "0.5px", background: "#e5e5ea", margin: "8px 0" }} />

          {/* Properties */}
          <p style={{ fontSize: 10, fontWeight: 600, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 10px", marginBottom: 2 }}>Properties</p>
          {[{ id: "all", name: "All Properties" }, ...db.properties].map(p => (
            <button key={p.id} onClick={() => setFilterProperty(p.id)}
              className="desk-nav-item"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", width: "100%", background: filterProperty === p.id ? "#f2f2f7" : "transparent", color: filterProperty === p.id ? "#000" : "#8e8e93", fontSize: 12, fontFamily: "'Inter', sans-serif", fontWeight: filterProperty === p.id ? 600 : 400 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: filterProperty === p.id ? "#000" : "#c7c7cc", flexShrink: 0 }} />
              {p.name || "All Properties"}
            </button>
          ))}
        </nav>

        {/* Bottom — New Turnover */}
        <div style={{ padding: "12px 14px", borderTop: "0.5px solid #e5e5ea" }}>
          <button onClick={() => setShowNewTurnover(true)}
            style={{ width: "100%", padding: "9px 14px", background: "#000", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter', sans-serif" }}>
            <Icon name="plus" size={13} /> New Turnover
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ height: 52, background: "#ffffff", borderBottom: "0.5px solid #e5e5ea", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", flex: 1 }}>
            {filterProperty === "all" ? "All Properties" : db.properties.find(p => p.id === filterProperty)?.name || "Dashboard"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: syncPulse ? "#16a34a" : "#c7c7cc", transition: "background 0.3s" }} />
            <span style={{ fontSize: 11, color: "#8e8e93" }}>{lastSync ? `Synced ${timeAgo(lastSync)}` : "Syncing…"}</span>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {activeTab === "board" && (
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

              {/* Stats row — Cake style */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Total Turnovers", value: stats.total },
                  { label: "In Progress",      value: stats.active },
                  { label: "Move-In Ready",    value: stats.ready,   color: "#16a34a" },
                  { label: "Overdue",          value: stats.overdue, color: stats.overdue > 0 ? "#dc2626" : "#8e8e93" },
                  { label: "Avg Days Open",    value: stats.avgDays },
                ].map(s => (
                  <div key={s.label} style={{ background: "#ffffff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <p style={{ fontSize: 11, color: "#8e8e93", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: s.color || "#000", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Make Ready Board — compact table view */}
              <div style={{ background: "#ffffff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                {/* Board header */}
                <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #e5e5ea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>Make Ready Board</p>
                    <p style={{ fontSize: 12, color: "#8e8e93", marginTop: 1 }}>{filtered.filter(u => !u.is_ready).length} active turnovers</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[["all","All"],["active","Active"],["ready","Ready"]].map(([v,l]) => (
                      <button key={v} onClick={() => setFilterProperty(v === "all" ? "all" : v)}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "0.5px solid #e5e5ea", background: "#f2f2f7", fontSize: 11, fontWeight: 500, color: "#3c3c43", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 80px 140px 100px", gap: 0, padding: "8px 20px", background: "#f8f8fa", borderBottom: "0.5px solid #e5e5ea" }}>
                  {["Unit","Property","Assigned","Lease","Days","Progress","Status"].map(h => (
                    <p key={h} style={{ fontSize: 10, fontWeight: 600, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</p>
                  ))}
                </div>

                {/* Rows */}
                {filtered.length === 0 && (
                  <div style={{ padding: "32px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: "#8e8e93" }}>No turnovers match this filter</p>
                  </div>
                )}
                {filtered.map((to, i) => {
                  const days = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
                  const pct  = overallPct(to);
                  const isOverdue = days < 0 && !to.is_ready;
                  const statusColor = to.is_ready ? "#16a34a" : isOverdue ? "#dc2626" : days <= 3 ? "#e07d2a" : "#8e8e93";
                  const statusLabel = to.is_ready ? "Ready" : isOverdue ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d left`;
                  const stages = to.stages || [];
                  const doneStages = stages.filter(s => s.status === "done").length;
                  const activeStages = stages.filter(s => s.status === "in_progress").length;

                  return (
                    <div key={to.id} className="desk-row" onClick={() => setSelectedUnit(selectedUnit === to.id ? null : to.id)}
                      style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 80px 140px 100px", gap: 0, padding: "12px 20px", borderBottom: i < filtered.length - 1 ? "0.5px solid #e5e5ea" : "none", cursor: "pointer", background: selectedUnit === to.id ? "#f8f8fa" : "transparent", alignItems: "center" }}>
                      {/* Unit */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>{to.unit_number}</span>
                        </div>
                      </div>
                      {/* Property */}
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{to.property_name}</p>
                      {/* Assigned */}
                      <p style={{ fontSize: 12, color: "#3c3c43", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{to.assigned_name || "—"}</p>
                      {/* Lease */}
                      <span style={{ fontSize: 11, fontWeight: 500, color: to.lease_status === "leased" ? "#16a34a" : "#e07d2a" }}>
                        {to.lease_status === "leased" ? "Leased" : "Unleased"}
                      </span>
                      {/* Days */}
                      <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{statusLabel}</span>
                      {/* Progress */}
                      <div>
                        <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                          {stages.map(s => (
                            <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: s.status === "done" ? "#16a34a" : s.status === "in_progress" ? "#e07d2a" : "#e5e5ea" }} />
                          ))}
                        </div>
                        <p style={{ fontSize: 10, color: "#8e8e93" }}>{doneStages}/{stages.length} stages · {pct}%</p>
                      </div>
                      {/* Status badge */}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 6, background: to.is_ready ? "#f0fdf4" : isOverdue ? "#fef2f2" : "#f8f8fa", color: statusColor }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
                        {to.is_ready ? "Ready" : isOverdue ? "Overdue" : activeStages > 0 ? "Active" : "Queued"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
              <DeskAnalytics units={units} db={db} />
            </div>
          )}

          {activeTab === "team" && (
            <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
              <div style={{ background: "#ffffff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #e5e5ea" }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>Team Members</p>
                </div>
                {db.team.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < db.team.length - 1 ? "0.5px solid #e5e5ea" : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#3c3c43" }}>{m.avatar}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#000" }}>{m.name}</p>
                      <p style={{ fontSize: 11, color: "#8e8e93" }}>{m.role} · {m.specialty}</p>
                    </div>
                    <span style={{ fontSize: 11, color: m.is_active ? "#16a34a" : "#8e8e93", background: m.is_active ? "#f0fdf4" : "#f2f2f7", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>
                      {m.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "relay" && (
            <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
              <div style={{ background: "#ffffff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #e5e5ea", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>Relay — Activity Log</p>
                    <p style={{ fontSize: 11, color: "#8e8e93" }}>Agentic AI actions and alerts</p>
                  </div>
                </div>
                {activityLog.length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: "#8e8e93" }}>No Relay activity yet. Run the agent from the mobile app.</p>
                  </div>
                ) : activityLog.map((entry, i) => (
                  <div key={entry.id || i} style={{ display: "flex", gap: 12, padding: "12px 20px", borderBottom: i < activityLog.length - 1 ? "0.5px solid #e5e5ea" : "none" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: "#000" }}>{entry.text || entry.description}</p>
                      <p style={{ fontSize: 11, color: "#8e8e93", marginTop: 2 }}>{timeAgo(entry.ts || entry.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR — Unit detail or activity feed */}
      <div style={{ width: selectedUnit ? 340 : 280, flexShrink: 0, background: "#ffffff", borderLeft: "0.5px solid #e5e5ea", display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.2s ease" }}>
        {selectedUnit && units.find(u => u.id === selectedUnit) ? (
          <DeskUnitDetail
            to={units.find(u => u.id === selectedUnit)}
            db={db}
            onClose={() => setSelectedUnit(null)}
            onSetStageStatus={setStageStatus}
            onAssignStage={assignStageToMember}
            onToggleTask={toggleTask}
            onMarkReady={markReady}
            onDelete={deleteTurnover}
          />
        ) : (
          <DeskActivityFeed log={activityLog} db={db} />
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 16, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 16, x: "-50%" }}
            style={{ position: "fixed", bottom: 24, left: "50%", zIndex: 200, background: "#000", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 500, color: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.3)", whiteSpace: "nowrap", fontFamily: "'Inter',sans-serif" }}>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Turnover modal */}
      <AnimatePresence>
        {showNewTurnover && (
          <DeskNewTurnoverModal db={db} onCreate={createTurnover} onClose={() => setShowNewTurnover(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

//  Kanban unit card 
function DeskUnitCard({ to, stageDef, db, isSelected, onClick, onSetStageStatus, onAssignStage }) {
  const pct = overallPct(to);
  const daysLeft = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const isOverdue = daysLeft < 0 && !to.is_ready;
  const stage = to.stages?.find(s => s.id === stageDef.id);
  const stageStatus = stage?.status || "idle";
  const tasksDone = stage?.tasks?.filter(t => t.completed).length || 0;
  const tasksTotal = stage?.tasks?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="desk-card"
      onClick={onClick}
      style={{
        background: "#ffffff",
        border: `0.5px solid ${isSelected ? "#000" : "#e5e5ea"}`,
        borderRadius: 10, padding: 12, cursor: "pointer",
        boxShadow: isSelected ? "0 0 0 1.5px #000" : "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: stageDef.bg, border: `1px solid ${stageDef.accent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: stageDef.color }}>{to.unit_number}</span>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#000000", lineHeight: 1.2 }}>Unit {to.unit_number}</p>
            <p style={{ fontSize: 10, color: "#8e8e93", lineHeight: 1.2 }}>{to.property_name?.split(" ").slice(0, 2).join(" ")}</p>
          </div>
        </div>
        {to.is_ready ? (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", background: "#dcfce7", border: "1px solid #05966930", borderRadius: 6, padding: "2px 6px" }}> Ready</span>
        ) : isOverdue ? (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626" }}> {Math.abs(daysLeft)}d late</span>
        ) : (
          <span style={{ fontSize: 9, color: "#8e8e93" }}>{daysLeft}d left</span>
        )}
      </div>

      {/* Overall progress bar */}
      <div style={{ height: 3, borderRadius: 2, background: "#f2f2f7", overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: pct === 100 ? "#16a34a" : `linear-gradient(90deg, ${stageDef.dot}, ${stageDef.dot}88)`, transition: "width 0.4s" }} />
      </div>

      {/* Stage task count + assigned member */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: stageStatus === "in_progress" ? stageDef.color : "#b8b0a8", fontWeight: 600 }}>
          {stageStatus === "in_progress" ? `${tasksDone}/${tasksTotal} tasks` : stageStatus === "done" ? " Done" : "Not started"}
        </span>
        {stage?.assigned_name ? (
          <span style={{ fontSize: 9, color: "#e07d2a", background: "#e07d2a15", border: "1px solid #e07d2a30", borderRadius: 100, padding: "2px 7px", fontWeight: 600 }}>
            {stage.assigned_name.split(" ")[0]}
          </span>
        ) : (
          <span style={{ fontSize: 9, color: "#b8b0a8" }}>Unassigned</span>
        )}
      </div>
    </motion.div>
  );
}

//  Right panel: Unit detail 
function DeskUnitDetail({ to, db, onClose, onSetStageStatus, onAssignStage, onToggleTask, onMarkReady, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openStage, setOpenStage]         = useState(null);
  const pct = overallPct(to);
  const daysLeft = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const allDone = (to.stages || []).every(s => s.status === "done");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e5ea", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 11, color: "#e07d2a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{to.property_name}</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#000000", lineHeight: 1.1 }}>Unit {to.unit_number}</h2>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={{ width: 30, height: 30, background: "#fef2f2", border: "1px solid #ff3b3b25", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Icon name="trash" size={12} style={{ color: "#dc2626" }} />
              </button>
            ) : (
              <button onClick={() => onDelete(to.id)} style={{ padding: "5px 10px", background: "#dc2626", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "white", cursor: "pointer" }}>Delete</button>
            )}
            <button onClick={onClose} style={{ width: 30, height: 30, background: "#f2f2f7", border: "1px solid #d6d0c8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon name="x" size={13} style={{ color: "#3c3c43" }} />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 7, background: to.lease_status === "leased" ? "#dcfce7" : "#f0b40012", color: to.lease_status === "leased" ? "#16a34a" : "#f5d05e", border: `1px solid ${to.lease_status === "leased" ? "#86efac" : "#f0b40030"}` }}>
            {to.lease_status === "leased" ? " Leased" : " Unleased"}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: daysLeft < 0 ? "#dc2626" : daysLeft <= 3 ? "#ffad5c" : "#8e8e93" }}>
            {daysLeft < 0 ? ` ${Math.abs(daysLeft)}d overdue` : `${daysLeft}d to target`}
          </span>
          {to.assigned_name && <span style={{ fontSize: 10, color: "#3c3c43" }}> {to.assigned_name}</span>}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#8e8e93", fontWeight: 600 }}>Overall Progress</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: pct === 100 ? "#16a34a" : "#e07d2a" }}>{pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "#f2f2f7", overflow: "hidden" }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} style={{ height: "100%", borderRadius: 3, background: pct === 100 ? "#16a34a" : "linear-gradient(90deg,#e07d2a,#c45e0a)" }} />
          </div>
        </div>

        {/* Mark ready button */}
        {to.is_ready ? (
          <button onClick={() => onMarkReady(to.id, false)} style={{ width: "100%", padding: "9px", borderRadius: 10, background: "#dcfce7", border: "1px solid #05966935", color: "#16a34a", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
             Move-In Ready — Click to Reopen
          </button>
        ) : (
          <button onClick={() => onMarkReady(to.id, true)} style={{
            width: "100%", padding: "9px", borderRadius: 10, border: "none",
            background: allDone ? "linear-gradient(135deg,#059669,#10b981)" : "#f2f2f7",
            color: allDone ? "white" : "#8e8e93", fontSize: 12, fontWeight: 700, cursor: allDone ? "pointer" : "default",
            boxShadow: allDone ? "0 3px 12px #05966940" : "none",
          }}>
            {allDone ? "Mark Move-In Ready " : `${(to.stages||[]).filter(s=>s.status==="done").length}/${MR_STAGES.length} stages done`}
          </button>
        )}
      </div>

      {/* Stage list — scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        <p style={{ fontSize: 10, color: "#8e8e93", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Stages</p>
        {MR_STAGES.map(def => {
          const stageObj = (to.stages||[]).find(s => s.id === def.id) || { id: def.id, status: "idle", tasks: [] };
          const tasksDone = stageObj.tasks?.filter(t => t.completed).length || 0;
          const tasksTotal = stageObj.tasks?.length || 0;
          const isDone = stageObj.status === "done";
          const isIP   = stageObj.status === "in_progress";
          const isOpen = openStage === def.id;

          return (
            <div key={def.id} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: isOpen ? "10px 10px 0 0" : 10, background: isDone ? "#f0fdf4" : isIP ? def.bg : "#f2f2f7", border: `1px solid ${isDone ? "#86efac" : isIP ? def.accent : "#f2f2f7"}`, borderBottom: isOpen ? "none" : undefined }}>
                {/* Status dot */}
                <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "#16a34a" : isIP ? def.dot : "#f2f2f7", border: !isDone && !isIP ? "1.5px solid #d6d0c8" : "none" }}>
                  {isDone ? <Icon name="check" size={10} style={{ color: "#f8fafc" }} /> : isIP ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f8fafc" }} /> : null}
                </div>

                {/* Label */}
                <span style={{ fontSize: 12, fontWeight: 700, color: isDone ? "#16a34a" : isIP ? def.color : "#8e8e93", flex: 1 }}>{def.label}</span>

                {/* Task count */}
                <span style={{ fontSize: 10, color: isDone ? "#16a34a" : isIP ? def.color : "#b8b0a8", fontWeight: 600 }}>{tasksDone}/{tasksTotal}</span>

                {/* Status toggles */}
                <div style={{ display: "flex", gap: 3 }}>
                  {[
                    { val: "idle",        label: "·",  title: "Not started" },
                    { val: "in_progress", label: "",  title: "In progress" },
                    { val: "done",        label: "",  title: "Done" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      title={opt.title}
                      onClick={(e) => { e.stopPropagation(); onSetStageStatus(to.id, def.id, opt.val); }}
                      style={{
                        width: 22, height: 22, borderRadius: 6, border: "none", cursor: "pointer",
                        background: stageObj.status === opt.val ? (opt.val === "done" ? "#16a34a" : opt.val === "in_progress" ? def.dot : "#c6c6c8") : "#f2f2f7",
                        color: stageObj.status === opt.val ? "#f8fafc" : "#b8b0a8",
                        fontSize: 10, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >{opt.label}</button>
                  ))}
                </div>

                {/* Expand */}
                <button onClick={() => setOpenStage(isOpen ? null : def.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <Icon name={isOpen ? "chevron_down" : "chevron_right"} size={13} style={{ color: "#8e8e93" }} />
                </button>
              </div>

              {/* Expanded: tasks + assign */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden", background: "#f2f2f7", border: `1px solid ${isIP ? def.accent : "#f2f2f7"}`, borderTop: "none", borderRadius: "0 0 10px 10px" }}
                  >
                    {/* Assign member */}
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #ede9e3" }}>
                      <p style={{ fontSize: 10, color: "#8e8e93", fontWeight: 600, marginBottom: 5 }}>ASSIGN TO</p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {db.team.map(m => (
                          <button
                            key={m.id}
                            onClick={() => onAssignStage(to.id, def.id, m.id)}
                            style={{
                              padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700, cursor: "pointer",
                              background: stageObj.assigned_to === m.id ? "#e07d2a" : "#f2f2f7",
                              color: stageObj.assigned_to === m.id ? "white" : "#8e8e93",
                              border: `1px solid ${stageObj.assigned_to === m.id ? "#e07d2a" : "#c6c6c8"}`,
                            }}
                          >
                            {m.avatar} {m.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tasks */}
                    {stageObj.tasks?.map((tk, ti) => (
                      <div key={tk.id} style={{ padding: "8px 12px", borderBottom: ti < stageObj.tasks.length - 1 ? "1px solid #ede9e3" : "none", display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <button
                          onClick={() => onToggleTask(to.id, def.id, tk.id)}
                          style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, border: tk.completed ? "none" : "1.5px solid #b8b0a8", background: tk.completed ? def.dot : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          {tk.completed && <Icon name="check" size={10} style={{ color: "#f8fafc" }} />}
                        </button>
                        <span style={{ fontSize: 11, color: tk.completed ? "#8e8e93" : "#000000", textDecoration: tk.completed ? "line-through" : "none", lineHeight: 1.4 }}>
                          {tk.icon} {tk.label}
                        </span>
                        {tk.completed_by && (
                          <span style={{ fontSize: 9, color: "#8e8e93", marginLeft: "auto", whiteSpace: "nowrap" }}>{tk.completed_by}</span>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

//  Activity feed (shown when no unit selected) 
function DeskActivityFeed({ log, db }) {
  const icons = { stage: "", assign: "", ready: "", created: "", deleted: "" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e5ea", flexShrink: 0 }}>
        <p style={{ fontSize: 11, color: "#e07d2a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Live Feed</p>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#000000" }}>Activity</h3>
        <p style={{ fontSize: 11, color: "#8e8e93", marginTop: 2 }}>Updates from field team · auto-refreshes</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {log.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#c7c7cc" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}></div>
            <p style={{ fontSize: 12, color: "#b8b0a8" }}>No activity yet</p>
            <p style={{ fontSize: 11, color: "#c6c6c8", marginTop: 4 }}>Field updates will appear here in real time</p>
          </div>
        ) : log.map((entry, i) => (
          <div key={entry.id || i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < log.length - 1 ? "1px solid #e5e5ea" : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13 }}>{icons[entry.type] || ""}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#000000", lineHeight: 1.4 }}>{entry.text}</p>
              {entry.ts && <p style={{ fontSize: 10, color: "#b8b0a8", marginTop: 3 }}>{timeAgo(entry.ts)}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Team online strip */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #e5e5ea", flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: "#b8b0a8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Team</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {db.team.filter(m => m.is_active).map(m => (
            <div key={m.id} title={m.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 100 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 5px #05966980" }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#3c3c43" }}>{m.avatar}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

//  Desktop Analytics 
function DeskAnalytics({ units, db }) {
  const stageBreakdown = MR_STAGES.map(def => {
    const inStage = units.filter(u => !u.is_ready && u.stages?.some(s => s.id === def.id && s.status === "in_progress"));
    const done    = units.filter(u => u.stages?.some(s => s.id === def.id && s.status === "done"));
    return { ...def, active: inStage.length, done: done.length };
  });

  const teamLoad = db.team.map(m => {
    const assigned = units.filter(u =>
      u.stages?.some(s => s.assigned_to === m.id && s.status === "in_progress")
    );
    return { ...m, load: assigned.length, units: assigned.map(u => u.unit_number).join(", ") };
  });

  const avgTurnDays = units.length === 0 ? 0 : Math.round(
    units.reduce((s, u) => s + (Date.now() - new Date(u.created_date || Date.now()).getTime()) / 86400000, 0) / units.length
  );

  const readyCount   = units.filter(u => u.is_ready).length;
  const overdueCount = units.filter(u => { const d = Math.ceil((new Date(u.target_ready_date) - Date.now()) / 86400000); return d < 0 && !u.is_ready; }).length;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#000000", marginBottom: 20 }}>Portfolio Analytics</h2>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Avg Days to Turn",   value: avgTurnDays,   suffix: "d",   color: "#ffad5c" },
          { label: "Units Ready",         value: readyCount,    suffix: "",    color: "#16a34a" },
          { label: "Overdue Turnovers",   value: overdueCount,  suffix: "",    color: overdueCount > 0 ? "#dc2626" : "#8e8e93" },
          { label: "Total Active",        value: units.length,  suffix: "",    color: "#f0a05a" },
        ].map(k => (
          <div key={k.label} style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}{k.suffix}</div>
            <div style={{ fontSize: 11, color: "#8e8e93", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 6 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Stage breakdown */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#000000", marginBottom: 16 }}>Stage Breakdown</h3>
          {stageBreakdown.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#3c3c43", flex: 1 }}>{s.label}</span>
              <div style={{ display: "flex", gap: 12 }}>
                <span title="In progress" style={{ fontSize: 12, fontWeight: 700, color: s.active > 0 ? s.color : "#c7c7cc" }}>{s.active} active</span>
                <span title="Done" style={{ fontSize: 12, fontWeight: 700, color: s.done > 0 ? "#16a34a" : "#c7c7cc" }}>{s.done} done</span>
              </div>
              <div style={{ width: 80, height: 4, background: "#f2f2f7", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: units.length > 0 ? `${(s.active / units.length) * 100}%` : "0%", background: s.dot, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Team workload */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#000000", marginBottom: 16 }}>Team Workload</h3>
          {teamLoad.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f2f2f7", border: "1px solid #d6d0c8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#e07d2a" }}>{m.avatar}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>{m.name}</p>
                <p style={{ fontSize: 10, color: "#8e8e93" }}>{m.units || "No active stages"}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: m.load > 2 ? "#dc2626" : m.load > 0 ? "#ffad5c" : "#b8b0a8" }}>{m.load}</span>
                <p style={{ fontSize: 9, color: "#b8b0a8" }}>stages</p>
              </div>
            </div>
          ))}
        </div>

        {/* Property breakdown */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#000000", marginBottom: 16 }}>By Property</h3>
          {db.properties.map(p => {
            const propUnits = units.filter(u => u.property_id === p.id);
            const propReady = propUnits.filter(u => u.is_ready).length;
            const propPct   = propUnits.length > 0 ? Math.round((propReady / propUnits.length) * 100) : 0;
            return (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>{p.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: propPct === 100 ? "#16a34a" : "#e07d2a" }}>{propReady}/{propUnits.length} ready</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "#f2f2f7", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${propPct}%`, borderRadius: 3, background: "linear-gradient(90deg,#e07d2a,#c45e0a)", transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Days remaining heatmap */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#000000", marginBottom: 16 }}>Target Date Status</h3>
          {units.filter(u => !u.is_ready).sort((a, b) => new Date(a.target_ready_date) - new Date(b.target_ready_date)).slice(0, 8).map(u => {
            const d = Math.ceil((new Date(u.target_ready_date) - Date.now()) / 86400000);
            const color = d < 0 ? "#dc2626" : d <= 3 ? "#ffad5c" : d <= 7 ? "#f5d05e" : "#16a34a";
            return (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 4, height: 24, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#000000", flex: 1 }}>Unit {u.unit_number} · {u.property_name?.split(" ")[0]}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color }}>{d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Today" : `${d}d left`}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

//  New Turnover modal (desktop) 
function DeskNewTurnoverModal({ db, onCreate, onClose }) {
  const [form, setForm] = useState({ unit_id: "", target_ready_date: "", lease_status: "unleased", assigned_to: "" });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#ffffff", border: "1px solid #d6d0c8", borderRadius: 20, padding: 28, width: 440, maxHeight: "85vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#000000" }}>New Turnover</h2>
            <p style={{ fontSize: 12, color: "#8e8e93", marginTop: 2 }}>All 6 make-ready stages auto-created. Team sees it instantly on mobile.</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, background: "#f2f2f7", border: "1px solid #d6d0c8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="x" size={14} style={{ color: "#3c3c43" }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Unit</label>
            <select className="input-dark" value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))} style={{ width: "100%" }}>
              <option value="">Select unit...</option>
              {db.units.map(u => <option key={u.id} value={u.id}>#{u.unit_number} — {db.properties.find(p => p.id === u.property_id)?.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Target Move-In Date</label>
            <input className="input-dark" type="date" value={form.target_ready_date} onChange={e => setForm(f => ({ ...f, target_ready_date: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Lead Technician</label>
            <select className="input-dark" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} style={{ width: "100%" }}>
              <option value="">Unassigned</option>
              {db.team.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#3c3c43", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Lease Status</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["leased"," Leased"],["unleased"," Unleased"]].map(([v, l]) => (
                <button key={v} onClick={() => setForm(f => ({ ...f, lease_status: v }))} style={{ padding: "10px", borderRadius: 10, border: form.lease_status === v ? "1px solid #e07d2a" : "1px solid #e8e4de", background: form.lease_status === v ? "#e07d2a20" : "#f2f2f7", cursor: "pointer", fontSize: 13, fontWeight: 600, color: form.lease_status === v ? "#f0a05a" : "#3c3c43" }}>{l}</button>
              ))}
            </div>
          </div>
          <button
            onClick={() => onCreate(form)}
            disabled={!form.unit_id || !form.target_ready_date}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: !form.unit_id || !form.target_ready_date ? "default" : "pointer",
              background: !form.unit_id || !form.target_ready_date ? "#f2f2f7" : "#000000",
              color: !form.unit_id || !form.target_ready_date ? "#8e8e93" : "white",
              fontSize: 14, fontWeight: 700, boxShadow: !form.unit_id || !form.target_ready_date ? "none" : "0 4px 14px #e07d2a40",
            }}
          >
             Create & Sync to Field Team
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 
//  APP ROOT — DEVICE DETECTION + ROUTING
// 


// ─────────────────────────────────────────────
// SUPABASE INTEGRATION LAYER
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with
// your project credentials from supabase.com/dashboard
// ─────────────────────────────────────────────

const SUPABASE_URL  = "https://sxelqgfzandzapqgfvsa.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWxxZ2Z6YW5kemFwcWdmdnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTY0OTMsImV4cCI6MjA5Mjk3MjQ5M30.CaQwWW6io1PplAhQ6NKdQaCwqSChmkpE3pt9NFHYpKQ";

// Light wrapper — no SDK needed, just fetch
const supabase = {
  _h() {
    return {
      "Content-Type":  "application/json",
      "apikey":        SUPABASE_ANON,
      "Authorization": `Bearer ${SUPABASE_ANON}`,
      "Prefer":        "return=representation",
    };
  },

  async select(table, filter = "") {
    const q = filter ? `?${filter}` : "";
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${q}`, { headers: this._h() });
    if (!res.ok) {
      const err = await res.text();
      console.error(`Supabase select ${table} failed:`, err);
      throw new Error(err);
    }
    const data = await res.json();
    // Handle both array response and {data: [...]} format
    const result = Array.isArray(data) ? data : (data?.data || []);
    return result;
  },

  async upsert(table, row) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this._h(), "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async update(table, id, patch) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: this._h(),
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: this._h(),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  // Real-time subscription via Supabase Realtime
  subscribe(table, callback) {
    // Polling fallback until Realtime WebSocket is configured
    // Replace with supabase-js realtime for true push
    const interval = setInterval(async () => {
      try {
        const data = await this.select(table);
        callback(data);
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  },
};

// ─────────────────────────────────────────────
// DATA LAYER — uses Supabase if configured,
// falls back to window.storage for local demo
// ─────────────────────────────────────────────

const isSupabaseConfigured = () =>
  SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON !== "YOUR_SUPABASE_ANON_KEY";

async function loadDB() {
  if (isSupabaseConfigured()) {
    try {
      const [properties, units, team, turnovers] = await Promise.all([
        supabase.select("properties"),
        supabase.select("units"),
        supabase.select("team"),
        supabase.select("turnovers"),
      ]);
      return { properties, units, team, turnovers, _version: DB_VERSION, _source: "supabase" };
    } catch (e) {
      console.warn("Supabase load failed, falling back to local:", e.message);
    }
  }
  // Local fallback
  try {
    const r = await window.storage.get(DB_KEY);
    if (r?.value) {
      const stored = JSON.parse(r.value);
      if (stored._version !== DB_VERSION) throw new Error("stale");
      return stored;
    }
  } catch {}
  const fresh = { ...SEED_DATA, _version: DB_VERSION };
  await window.storage.set(DB_KEY, JSON.stringify(fresh)).catch(() => {});
  return fresh;
}

async function saveDB(data) {
  if (isSupabaseConfigured()) {
    // Supabase mode — individual entity updates go direct via updateDB
    return;
  }
  await window.storage.set(DB_KEY, JSON.stringify(data)).catch(() => {});
}

// Smart updateDB — diffs and upserts only changed turnovers to Supabase
async function smartUpdate(db, newDB, updateLocalState, persistLocal) {
  updateLocalState(newDB);
  if (isSupabaseConfigured()) {
    // Find changed/new turnovers and upsert them
    const changed = newDB.turnovers.filter(t => {
      const old = db.turnovers.find(o => o.id === t.id);
      return !old || JSON.stringify(old) !== JSON.stringify(t);
    });
    await Promise.all(changed.map(t => supabase.upsert("turnovers", t).catch(console.warn)));
    // Deleted turnovers
    const deletedIds = db.turnovers
      .filter(t => !newDB.turnovers.find(n => n.id === t.id))
      .map(t => t.id);
    await Promise.all(deletedIds.map(id => supabase.delete("turnovers", id).catch(console.warn)));
  } else {
    await persistLocal(newDB);
  }
}

// ─────────────────────────────────────────────
// SIMPLIFIED DASHBOARD — turnovers only
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// AI COORDINATOR — the site supervisor that never sleeps
// ─────────────────────────────────────────────

// Calls Claude to generate personalized briefings
async function getAIBriefing(turnovers, role, memberName) {
  const activeTurnovers = turnovers.filter(t => !t.is_ready);

  const turnoverSummary = activeTurnovers.map(to => {
    const days = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
    const pct  = overallPct(to);
    const stalledStages = (to.stages || []).filter(s => {
      if (s.status !== "in_progress") return false;
      const lastActivity = s.tasks
        .filter(t => t.completed_at)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
      if (!lastActivity) return true;
      return (Date.now() - new Date(lastActivity.completed_at)) / 3600000 > 24;
    }).map(s => s.id);

    return {
      unit: `Unit ${to.unit_number}`,
      property: to.property_name,
      daysToTarget: days,
      progress: pct,
      stalledStages,
      leaseStatus: to.lease_status,
      assignedTo: to.assigned_name,
      isOverdue: days < 0,
    };
  });

  const systemPrompt = `You are Relay, Mainlync's agentic AI for property management.
Return ONLY valid JSON. No markdown. No explanation. No preamble.
The JSON must have exactly this structure:
{
  "greeting": "one short sentence, 8 words max, time-of-day appropriate",
  "units": [
    {
      "unit": "Unit 203",
      "status": "on_track" | "at_risk" | "critical",
      "action": "one short action sentence, 10 words max, starts with a verb"
    }
  ],
  "priority": "one sentence — the single most important thing to do right now, 15 words max"
}
Be specific. Use unit numbers. Start every action with a verb. Never use the word 'ensure'.`;

  const userPrompt = `Generate a morning briefing for ${memberName || "the supervisor"}.
Active turnovers: ${JSON.stringify(turnoverSummary)}
Return only the JSON object.`;

  const response = await fetch("/.netlify/functions/ai-briefing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

  const raw = data.content?.[0]?.text || "{}";
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // Fallback structured response if JSON parse fails
    return {
      greeting: "Good morning.",
      units: activeTurnovers.slice(0, 5).map(to => {
        const days = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
        const pct  = overallPct(to);
        return {
          unit: `Unit ${to.unit_number}`,
          status: days < 0 ? "critical" : pct < 30 ? "at_risk" : "on_track",
          action: days < 0 ? "Check status immediately" : `Continue — ${pct}% complete`,
        };
      }),
      priority: "Review all active turnovers and confirm assignments are current.",
    };
  }
}

// Generate a stage completion next-step message
async function getStageCompleteMessage(turnover, completedStageId, nextStageName) {
  const days = Math.ceil((new Date(turnover.target_ready_date) - Date.now()) / 86400000);
  const pct  = overallPct(turnover);

  const response = await fetch("/.netlify/functions/ai-briefing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `A maintenance team just completed the "${completedStageId}" stage for Unit ${turnover.unit_number} at ${turnover.property_name}. 
The unit is ${pct}% complete overall with ${days} days until the target ready date.
${nextStageName ? `The next stage is "${nextStageName}".` : "This was the last stage."}
Write a single short message (2 sentences max) to notify the supervisor and assigned tech what just happened and what needs to happen next. Sound human, not robotic.`,
      }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || "";
}

// Risk analyzer — runs locally, no API call needed
function analyzeRisk(turnovers) {
  return turnovers.filter(t => !t.is_ready).map(to => {
    const days    = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
    const pct     = overallPct(to);
    const stages  = to.stages || [];
    const doneCount   = stages.filter(s => s.status === "done").length;
    const activeCount = stages.filter(s => s.status === "in_progress").length;
    const totalStages = stages.length;

    // Calculate expected progress based on time elapsed
    const createdDays = Math.ceil((Date.now() - new Date(to.created_date)) / 86400000);
    const totalDays   = createdDays + Math.max(days, 0);
    const expectedPct = totalDays > 0 ? Math.min(95, Math.round((createdDays / totalDays) * 100)) : 0;

    const stalled = stages.some(s => {
      if (s.status !== "in_progress") return false;
      const lastActivity = s.tasks
        .filter(t => t.completed_at)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
      if (!lastActivity) return true;
      return (Date.now() - new Date(lastActivity.completed_at)) / 3600000 > 24;
    });

    let riskLevel = "on_track"; // on_track | at_risk | critical
    let riskReason = "";

    if (days < 0) {
      riskLevel  = "critical";
      riskReason = `${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""} overdue`;
    } else if (stalled) {
      riskLevel  = "critical";
      riskReason = "A stage has had no activity for 24+ hours";
    } else if (pct < expectedPct - 20) {
      riskLevel  = "at_risk";
      riskReason = `Progress is behind schedule — ${expectedPct}% expected, ${pct}% complete`;
    } else if (days <= 2 && pct < 80) {
      riskLevel  = "at_risk";
      riskReason = `${days} day${days !== 1 ? "s" : ""} left but only ${pct}% complete`;
    } else if (activeCount === 0 && doneCount < totalStages && days <= 5) {
      riskLevel  = "at_risk";
      riskReason = "No stages currently active with target date approaching";
    }

    return { ...to, riskLevel, riskReason };
  });
}


// ─────────────────────────────────────────────
// AI BRIEFING CARD
// ─────────────────────────────────────────────

function AIBriefingCard({ turnovers, role, memberName }) {
  const [briefing, setBriefing]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [generated, setGenerated] = useState(false);
  const [expanded, setExpanded]   = useState(false);
  const [error, setError]         = useState(null);

  async function generateBriefing() {
    setLoading(true);
    setExpanded(true);
    setError(null);
    try {
      const result = await getAIBriefing(turnovers, role, memberName);
      setBriefing(result);
      setGenerated(true);
    } catch (e) {
      setError(e.message || "Unable to generate briefing right now.");
      setGenerated(true);
    }
    setLoading(false);
  }

  const statusConfig = {
    on_track: { color: "#16a34a", bg: "#f0fdf4", border: "#86efac", dot: "#16a34a", label: "On Track" },
    at_risk:  { color: "#c2570a", bg: "#fff7ed", border: "#fed7aa", dot: "#e07d2a", label: "At Risk"  },
    critical: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#dc2626", label: "Critical" },
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #fff7ed, #fef3e8)",
      border: "1px solid #fed7aa",
      borderRadius: 16, marginBottom: 16,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Header tap target */}
      <button
        onClick={generated ? () => setExpanded(e => !e) : generateBriefing}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px #e07d2a40" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#000000" }}>Relay</p>
          <p style={{ fontSize: 11, color: "#8e8e93" }}>
            {loading ? "Generating your briefing..." : generated ? (expanded ? "Tap to collapse" : "Tap to view briefing") : "Tap for your morning briefing"}
          </p>
        </div>
        {loading ? (
          <div style={{ width: 18, height: 18, border: "2px solid #fed7aa", borderTopColor: "#e07d2a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        ) : (
          <Icon name={expanded ? "chevron_down" : "chevron_right"} size={16} style={{ color: "#e07d2a" }} />
        )}
      </button>

      {/* Briefing content */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 14px 14px" }}>
              <div style={{ height: 1, background: "#fed7aa", marginBottom: 12 }} />

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 10 }} />)}
                </div>
              ) : error ? (
                <p style={{ fontSize: 12, color: "#dc2626", lineHeight: 1.5 }}>{error}</p>
              ) : briefing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                  {/* Greeting */}
                  {briefing.greeting && (
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#000000", marginBottom: 4 }}>{briefing.greeting}</p>
                  )}

                  {/* Unit cards — scannable rows */}
                  {(briefing.units || []).map((u, i) => {
                    const sc = statusConfig[u.status] || statusConfig.on_track;
                    return (
                      <div key={i} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot, flexShrink: 0, marginTop: 4 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: "#000000" }}>{u.unit}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: sc.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{sc.label}</span>
                          </div>
                          <p style={{ fontSize: 12, color: "#000000", lineHeight: 1.4 }}>{u.action}</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Priority action */}
                  {briefing.priority && (
                    <div style={{ background: "rgba(224,125,42,0.08)", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 12px", marginTop: 2, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e07d2a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#c2570a", lineHeight: 1.4 }}>{briefing.priority}</p>
                    </div>
                  )}

                  {/* Refresh */}
                  <button onClick={generateBriefing} style={{ marginTop: 4, fontSize: 11, color: "#e07d2a", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="refresh" size={11} /> Refresh
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// RISK BADGE — shown on unit cards
// ─────────────────────────────────────────────

function RiskBadge({ riskLevel, riskReason }) {
  if (riskLevel === "on_track") return null;
  const isCritical = riskLevel === "critical";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      background: isCritical ? "#fef2f2" : "#fff7ed",
      border: `1px solid ${isCritical ? "#fecaca" : "#fed7aa"}`,
      borderRadius: 8, padding: "5px 10px", marginTop: 8,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: isCritical ? "#dc2626" : "#e07d2a", flexShrink: 0 }} />
      <p style={{ fontSize: 10, fontWeight: 600, color: isCritical ? "#dc2626" : "#c2570a", lineHeight: 1.4 }}>
        {riskReason}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// UPDATED DASHBOARD — with Relay
// ─────────────────────────────────────────────

function Dashboard() {
  const { db, navigate } = useApp();
  const rawTurnovers = (db.turnovers || []).map(migrateTurnover);
  const withRisk = analyzeRisk(rawTurnovers);
  const roleData = getRoleData();
  const firstName = roleData?.name?.split(" ")[0] || "there";

  const active   = withRisk.filter(t => !t.is_ready).length;
  const critical = withRisk.filter(t => t.riskLevel === "critical").length;
  const onTrack  = withRisk.filter(t => t.riskLevel === "on_track" && !t.is_ready).length;
  const ready    = withRisk.filter(t => t.is_ready).length;

  const attention = withRisk.filter(t => !t.is_ready && t.riskLevel !== "on_track")
    .sort((a,b) => (a.riskLevel === "critical" ? -1 : 1));
  const good = withRisk.filter(t => !t.is_ready && t.riskLevel === "on_track");

  const statusColor = { critical: "#dc2626", at_risk: "#e07d2a", on_track: "#16a34a" };

  function UnitRow({ to }) {
    const days = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
    const pct  = overallPct(to);
    const sc   = statusColor[to.riskLevel] || "#8e8e93";
    return (
      <button onClick={() => navigate("Turnovers")}
        className="row" style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div className="unit-avatar">{to.unit_number}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#000" }}>{to.property_name}</span>
            <span style={{ fontSize: 12, color: sc, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
              {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d`}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%`, background: sc }} />
          </div>
        </div>
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ marginLeft: 8, flexShrink: 0 }}><path d="M1 1l5 5-5 5" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    );
  }

  return (
    <div style={{ background: "#f2f2f7", minHeight: "100vh", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 8px" }}>
        <p style={{ fontSize: 13, color: "#8e8e93", marginBottom: 2 }}>Make Ready</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Good morning,<br/>{firstName}.
        </h1>
      </div>

      {/* Relay briefing */}
      {active > 0 && (
        <div style={{ padding: "0 16px 4px" }}>
          <AIBriefingCard turnovers={rawTurnovers} role="supervisor" memberName={roleData?.name || "Supervisor"} />
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "8px 16px 4px" }}>
        {[
          { label: "Active",   value: active,   color: "#000" },
          { label: "Critical", value: critical, color: critical > 0 ? "#dc2626" : "#8e8e93" },
          { label: "On Track", value: onTrack,  color: onTrack > 0 ? "#16a34a" : "#8e8e93" },
          { label: "Ready",    value: ready,    color: ready > 0 ? "#0284c7" : "#8e8e93" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#8e8e93", fontWeight: 500, marginTop: 3, letterSpacing: "0.02em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Needs attention */}
      {attention.length > 0 && (
        <>
          <div className="section-header">Needs Attention</div>
          <div className="card-group" style={{ margin: "0 16px" }}>
            {attention.map(to => <UnitRow key={to.id} to={to} />)}
          </div>
        </>
      )}

      {/* On track */}
      {good.length > 0 && (
        <>
          <div className="section-header">On Track</div>
          <div className="card-group" style={{ margin: "0 16px" }}>
            {good.map(to => <UnitRow key={to.id} to={to} />)}
          </div>
        </>
      )}

      {/* Open board button */}
      <div style={{ padding: "20px 16px 0" }}>
        <button onClick={() => navigate("Turnovers")} className="btn-primary"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Open Make Ready Board
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      {active === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#3c3c43", marginBottom: 4 }}>No active turnovers</p>
          <p style={{ fontSize: 13, color: "#8e8e93" }}>Go to the board to start your first make-ready unit</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [db, setDB]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState("Dashboard");
  const [syncStatus, setSyncStatus] = useState("idle");
  const [roleData, setRoleData]     = useState(() => getRoleData());

  // Hash routing for shared links
  const [shareToken, setShareToken] = useState(() => {
    const m = window.location.hash.match(/^#share\/([a-z0-9]+)$/);
    return m ? m[1] : null;
  });

  useEffect(() => {
    const onHash = () => {
      const m = window.location.hash.match(/^#share\/([a-z0-9]+)$/);
      setShareToken(m ? m[1] : null);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Load data
  useEffect(() => {
    loadDB().then(data => { setDB(data); setLoading(false); });
  }, []);

  // Supabase real-time polling when configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !db) return;
    const unsub = supabase.subscribe("turnovers", (fresh) => {
      setDB(prev => prev ? { ...prev, turnovers: fresh } : prev);
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 2000);
    });
    return unsub;
  }, [!!db]);

  // Relay stall checker — runs every 30 minutes
  const stallCheckRef = useRef({});
  useEffect(() => {
    if (!db) return;
    async function runStallCheck() {
      const turnovers = (db.turnovers || []).map(migrateTurnover);
      const stalled   = checkForStalls(turnovers, stallCheckRef.current);
      for (const { to, stageId, stallKey } of stalled) {
        stallCheckRef.current[stallKey] = Date.now();
        await relayStallAlert(to, stageId).catch(() => {});
      }
    }
    const timer    = setTimeout(runStallCheck, 5000);
    const interval = setInterval(runStallCheck, 30 * 60 * 1000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [db?.turnovers?.length]);



  const updateDB = useCallback(async (newDB) => {
    setSyncStatus("syncing");
    await smartUpdate(db, newDB, setDB, saveDB);
    setSyncStatus("synced");
    setTimeout(() => setSyncStatus("idle"), 2000);
  }, [db]);

  const navigate = useCallback((target) => setPage(target), []);

  // Detect desktop
  const [isDesktop, setIsDesktop] = useState(
    window.location.hash === "#desktop" || window.innerWidth >= 1024
  );
  useEffect(() => {
    const onResize = () => setIsDesktop(window.location.hash === "#desktop" || window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Share link view — no auth needed
  if (shareToken) return <SharedUnitView token={shareToken} />;

  if (loading || !db) return (
    <>
      <style>{THEME.css}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "#ffffff" }}>
        <div style={{ width: 48, height: 48, background: "#000", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <p style={{ fontSize: 13, color: "#8e8e93", fontFamily: "'Inter',sans-serif" }}>
          {"Loading Mainlync..."}
        </p>
      </div>
    </>
  );

  // Role selection — show once if no role set
  if (!roleData && !isDesktop) {
    return (
      <AppCtx.Provider value={{ db, updateDB, navigate }}>
        <RoleSelectionScreen onSelect={data => setRoleData(data)} />
      </AppCtx.Provider>
    );
  }

  // Desktop PM Hub — always maintenance experience
  if (isDesktop) {
    return (
      <AppCtx.Provider value={{ db, updateDB, navigate }}>
        <style>{THEME.css}</style>
        <DesktopHub db={db} updateDB={updateDB} syncStatus={syncStatus} />
      </AppCtx.Provider>
    );
  }

  // Leasing experience
  if (roleData?.role === "leasing") {
    return (
      <AppCtx.Provider value={{ db, updateDB, navigate }}>
        <LeasingView
          userName={roleData.name}
          onSwitchRole={() => { clearRoleData(); setRoleData(null); }}
        />
      </AppCtx.Provider>
    );
  }

  // Maintenance experience — 4 tabs
  const PAGES = {
    Dashboard: <Dashboard />,
    Turnovers: <Turnovers />,
    Agent:     <AgentPage />,
    Team:      <Team />,
  };

  const NAV = [
    { page: "Dashboard", label: "Home",       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { page: "Turnovers", label: "Board",       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, accent: true },
    { page: "Agent",     label: "Relay",       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
    { page: "Team",      label: "Team",        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  ];

  return (
    <AppCtx.Provider value={{ db, updateDB, navigate }}>
      <style>{THEME.css}</style>
      <div style={{ minHeight: "100vh", background: "#f2f2f7", maxWidth: 480, margin: "0 auto", position: "relative" }}>

        {/* Sync indicator */}
        {syncStatus === "syncing" && (
          <div style={{ position: "fixed", top: 8, right: 16, zIndex: 200, fontSize: 10, color: "#475569", fontWeight: 600, fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#475569", animation: "pulse-a 1s ease-in-out infinite" }} />
            Saving
          </div>
        )}

        {/* Page content */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {PAGES[page] || <Dashboard />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation — iOS native */}
        <nav style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480, zIndex: 60,
          background: "rgba(249,249,249,0.94)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: "0.5px solid #c6c6c8",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 8px 20px" }}>
            {NAV.map(item => {
              const isActive = page === item.page;
              const activeColor = "#007aff";
              const inactiveColor = "#8e8e93";
              return (
                <button
                  key={item.page}
                  onClick={() => setPage(item.page)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 12px", color: isActive ? activeColor : inactiveColor, transition: "color 0.15s" }}
                >
                  <span style={{ color: isActive ? activeColor : inactiveColor }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.01em", fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </AppCtx.Provider>
  );
}
