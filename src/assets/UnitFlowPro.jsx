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

const DB_KEY     = "unitflow_pro_db";
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
  css: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f7f5f2; color: #1a1614; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #c8c0b8; border-radius: 2px; }
    input, textarea, select { font-family: 'Plus Jakarta Sans', sans-serif; }

    .card { background: #ffffff; border: 1px solid #e8e4de; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .card-elevated { background: #faf9f7; border: 1px solid #e0dbd4; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
    .chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 100px; font-size: 10px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; }

    .badge-emergency { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .badge-high      { background: #fff7ed; color: #c2570a; border: 1px solid #fed7aa; }
    .badge-medium    { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }
    .badge-low       { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-open      { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-in_progress { background: #fff7ed; color: #c2570a; border: 1px solid #fed7aa; }
    .badge-on_hold   { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }
    .badge-completed { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

    .input-dark {
      width: 100%;
      background: #ffffff;
      border: 1px solid #d6d0c8;
      color: #1a1614;
      border-radius: 12px;
      padding: 11px 14px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .input-dark:focus { border-color: #e07d2a; box-shadow: 0 0 0 3px #e07d2a20; }
    .input-dark::placeholder { color: #a09890; }

    .btn-primary {
      background: linear-gradient(135deg, #e07d2a, #c45e0a);
      color: white; border: none; border-radius: 12px;
      padding: 12px 20px; font-size: 14px; font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 14px #e07d2a40;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px #e07d2a50; }
    .btn-primary:disabled { background: #f0ece6; color: #a09890; box-shadow: none; cursor: not-allowed; transform: none; }

    .btn-ghost {
      background: transparent; color: #6b6560;
      border: 1px solid #d6d0c8; border-radius: 12px;
      padding: 12px 20px; font-size: 14px; font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s;
    }
    .btn-ghost:hover { background: #f0ece6; color: #1a1614; border-color: #b0a89e; }

    .btn-danger {
      background: #fef2f2; color: #dc2626;
      border: 1px solid #fecaca; border-radius: 12px;
      padding: 12px 20px; font-size: 14px; font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
    }
    .btn-danger:hover { background: #fee2e2; }

    .progress-bar { height: 4px; background: #e8e4de; border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #e07d2a, #c45e0a); border-radius: 2px; transition: width 0.4s ease; }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      backdropFilter: blur(4px); z-index: 80;
      display: flex; align-items: flex-end; justify-content: center;
      max-width: 480px; margin: 0 auto;
    }
    .modal-sheet {
      background: #ffffff; border-radius: 24px 24px 0 0;
      border-top: 1px solid #e8e4de;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.10);
      padding: 24px 20px 40px; width: 100%;
      max-height: 90vh; overflow-y: auto;
    }

    .skeleton {
      background: linear-gradient(90deg, #ede9e3 25%, #e0dbd4 50%, #ede9e3 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes pulse-a { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
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
// MAKE READY — STAGE DEFINITIONS & HELPERS
// ─────────────────────────────────────────────

const MR_STAGES = [
  { id: "cleaning",    label: "Cleaning",    short: "Clean",   color: "#c2570a", bg: "#fff7ed", accent: "#fed7aa", dot: "#e07d2a" },
  { id: "repairs",     label: "Repairs",     short: "Repairs", color: "#1d4ed8", bg: "#eff6ff", accent: "#bfdbfe", dot: "#3b82f6" },
  { id: "paint",       label: "Paint",       short: "Paint",   color: "#9d174d", bg: "#fdf2f8", accent: "#fbcfe8", dot: "#ec4899" },
  { id: "flooring",    label: "Flooring",    short: "Floor",   color: "#065f46", bg: "#f0fdf4", accent: "#bbf7d0", dot: "#10b981" },
  { id: "final_clean", label: "Final Clean", short: "Final",   color: "#1e40af", bg: "#eff6ff", accent: "#bfdbfe", dot: "#60a5fa" },
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
  idle:        { bg: "#ffffff", border: "#e8e4de", color: "#a09890", label: "Not Started" },
  in_progress: { bg: null,      border: null,       color: null,      label: "In Progress" },
  done:        { bg: "#dcfce7", border: "#86efac",  color: "#059669", label: "Done" },
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
      {/*  Header stats  */}
      <div style={{ padding: "0 16px 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Total",   value: total,   color: "#f0a05a" },
            { label: "Active",  value: active,  color: "#7fa8ff" },
            { label: "Ready",   value: ready,   color: "#059669" },
            { label: "Overdue", value: overdue, color: overdue > 0 ? "#dc2626" : "#a09890" },
          ].map(s => (
            <div key={s.label} style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#a09890", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["all","All"], ["active","Active"], ["ready","Ready"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} style={{
              padding: "5px 13px", borderRadius: 100, fontSize: 11, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: filterStatus === v ? "linear-gradient(135deg,#e07d2a,#c45e0a)" : "#ffffff",
              color: filterStatus === v ? "white" : "#a09890",
              boxShadow: filterStatus === v ? "0 2px 10px #e07d2a40" : "none",
            }}>{l}</button>
          ))}
          <div style={{ width: 1, background: "#e8e4de", margin: "0 2px" }} />
          {[["all","All"], ["leased","Leased"], ["unleased","Unleased"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilterLease(v)} style={{
              padding: "5px 13px", borderRadius: 100, fontSize: 11, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: filterLease === v ? "#d6d0c8" : "#ffffff",
              color: filterLease === v ? "#3d3530" : "#a09890",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/*  Unit cards  */}
      <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {displayed.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 24px", color: "#a09890" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}></div>
            <p style={{ fontSize: 14 }}>No units match this filter</p>
          </div>
        )}
        {displayed.map(to => <UnitCard key={to.id} to={to} onOpen={() => setSelectedId(to.id)} />)}
      </div>

      {/*  Detail drawer  */}
      <AnimatePresence>
        {selectedTO && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", zIndex: 80, maxWidth: 480, margin: "0 auto" }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "#fafaf8",
                borderRadius: "22px 22px 0 0",
                border: "1px solid #d6d0c8", borderBottom: "none",
                maxHeight: "92vh",
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
                <div style={{ width: 36, height: 4, background: "#d6d0c8", borderRadius: 2 }} />
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

  const stageStatuses = (to.stages || []).map(s => {
    const def = MR_STAGES.find(m => m.id === s.id);
    return { ...s, def };
  });

  const doneCount = stageStatuses.filter(s => s.status === "done").length;
  const inProgCount = stageStatuses.filter(s => s.status === "in_progress").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      style={{
        background: to.is_ready ? "#f0fdf4" : "#ffffff",
        border: `1px solid ${to.is_ready ? "#86efac" : "#e8e4de"}`,
        borderRadius: 18, padding: 16, cursor: "pointer",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: to.is_ready ? "#dcfce7" : "#f0ece6",
            border: `1px solid ${to.is_ready ? "#4ade80" : "#d6d0c8"}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: to.is_ready ? "#059669" : "#3d3530" }}>
              {to.unit_number}
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1614" }}>{to.property_name}</h3>
            <p style={{ fontSize: 11, color: "#a09890", marginTop: 1 }}>
              {to.assigned_name ? ` ${to.assigned_name}` : "Unassigned"}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {to.is_ready ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#dcfce7", border: "1px solid #05966935", borderRadius: 8, padding: "3px 8px" }}> Ready</span>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 600, color: isOverdue ? "#dc2626" : daysLeft <= 3 ? "#ffad5c" : "#a09890" }}>
              {isOverdue ? ` ${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
            </span>
          )}
        </div>
      </div>

      {/* Stage grid — 6 pills showing each stage's status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginBottom: 12 }}>
        {stageStatuses.map(s => {
          const isDone = s.status === "done";
          const isIP   = s.status === "in_progress";
          const taskDone = s.tasks.filter(t => t.completed).length;
          const taskTotal = s.tasks.length;
          return (
            <div key={s.id} style={{
              padding: "6px 8px", borderRadius: 10,
              background: isDone ? s.def.bg : isIP ? s.def.bg : "#f9f7f4",
              border: `1px solid ${isDone ? s.def.accent : isIP ? s.def.accent : "#f0ece6"}`,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: isDone ? s.def.dot : isIP ? s.def.dot : "#d6d0c8",
                opacity: isDone ? 1 : isIP ? 0.8 : 0.4,
              }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: isDone ? s.def.color : isIP ? s.def.color : "#b8b0a8", textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.def.short}
                </div>
                {taskTotal > 0 && (
                  <div style={{ fontSize: 8, color: isDone ? "#059669" : isIP ? s.def.color : "#d6d0c8", fontWeight: 600 }}>
                    {taskDone}/{taskTotal}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "#a09890", fontWeight: 600 }}>
            {doneCount}/{MR_STAGES.length} stages done{inProgCount > 0 ? ` · ${inProgCount} in progress` : ""}
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, color: pct === 100 ? "#059669" : "#e07d2a" }}>{pct}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "#f0ece6", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 2, background: pct === 100 ? "#059669" : "linear-gradient(90deg, #e07d2a, #c45e0a)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

//  Detail drawer 
function UnitDrawer({ to, db, updateDB, onSetStageStatus, onToggleTask, onAssignTask, onMarkReady, onUnmarkReady, onDelete, onClose }) {
  const [openStageId, setOpenStageId] = useState(null);
  const [assigningTask, setAssigningTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      <div style={{ padding: "12px 16px 14px", borderBottom: "1px solid #f0ece6", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: "#f0ece6", border: "1px solid #d6d0c8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1614" }}>{to.unit_number}</span>
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1a1614" }}>Unit {to.unit_number}</h2>
              <p style={{ fontSize: 12, color: "#a09890" }}>{to.property_name}</p>
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
            <button onClick={onClose} style={{ width: 32, height: 32, background: "#f0ece6", border: "1px solid #d6d0c8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon name="x" size={14} style={{ color: "#6b6560" }} />
            </button>
          </div>
        </div>

        {/* Meta chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: to.lease_status === "leased" ? "#dcfce7" : "#f0b40012", color: to.lease_status === "leased" ? "#059669" : "#f5d05e", border: `1px solid ${to.lease_status === "leased" ? "#86efac" : "#f0b40035"}` }}>
            {to.lease_status === "leased" ? " Leased" : " Unleased"}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: daysLeft < 0 ? "#dc2626" : daysLeft <= 3 ? "#ffad5c" : "#a09890", padding: "3px 0" }}>
            {daysLeft < 0 ? ` ${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d to target`}
          </span>
          {to.assigned_name && (
            <span style={{ fontSize: 10, color: "#6b6560", padding: "3px 0" }}> {to.assigned_name}</span>
          )}
        </div>

        {/* Overall progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#a09890", fontWeight: 600 }}>Overall Progress</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: pct === 100 ? "#059669" : "#e07d2a" }}>{pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "#f0ece6", overflow: "hidden" }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} style={{ height: "100%", borderRadius: 3, background: pct === 100 ? "#059669" : "linear-gradient(90deg,#e07d2a,#c45e0a)" }} />
          </div>
        </div>

        {/* Share link */}
        <ShareButton to={to} db={db} updateDB={updateDB} />

        {/* Move-In Ready toggle */}
        {to.is_ready ? (
          <button onClick={onUnmarkReady} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "#dcfce7", border: "1px solid #05966940", color: "#059669", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon name="check_circle" size={16} /> Move-In Ready — Tap to Reopen
          </button>
        ) : (
          <button
            onClick={onMarkReady}
            style={{
              width: "100%", padding: "11px", borderRadius: 12, border: "none",
              background: allDone ? "linear-gradient(135deg,#059669,#10b981)" : "#f0ece6",
              color: allDone ? "white" : "#a09890",
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
        <p style={{ fontSize: 10, color: "#a09890", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
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
            ? { bg: "#dcfce7", border: "#86efac", color: "#059669" }
            : { bg: "#f9f7f4", border: "#f0ece6", color: "#a09890" };

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
                  background: stageObj.status === "done" ? "#059669" : stageObj.status === "in_progress" ? def.dot : "#e8e4de",
                  border: stageObj.status === "idle" ? "1.5px solid #d6d0c8" : "none",
                }}>
                  {stageObj.status === "done"
                    ? <Icon name="check" size={11} style={{ color: "#f7f5f2" }} />
                    : stageObj.status === "in_progress"
                    ? <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f7f5f2" }} />
                    : null
                  }
                </div>

                {/* Label */}
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1, textAlign: "left", color: statusStyle.color }}>
                  {def.label}
                </span>

                {/* Task count */}
                <span style={{ fontSize: 11, fontWeight: 600, color: taskDone === taskTotal && taskTotal > 0 ? "#059669" : stageObj.status === "in_progress" ? def.color : "#b8b0a8" }}>
                  {taskDone}/{taskTotal}
                </span>

                <Icon name={isOpen ? "chevron_down" : "chevron_right"} size={14} style={{ color: "#a09890" }} />
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
                      background: "#f4f1ed",
                      border: `1px solid ${statusStyle.border}`,
                      borderTop: "none",
                      borderRadius: "0 0 12px 12px",
                    }}
                  >
                    {/* Stage status controls */}
                    <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #ede9e3", display: "flex", gap: 6 }}>
                      {[
                        { val: "idle",        label: "Not Started", bg: "#f0ece6",  color: "#a09890" },
                        { val: "in_progress", label: "In Progress", bg: def.bg,     color: def.color, border: def.accent },
                        { val: "done",        label: "Done",        bg: "#dcfce7", color: "#059669", border: "#86efac" },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => onSetStageStatus(to.id, def.id, opt.val)}
                          style={{
                            flex: 1, padding: "6px 4px", borderRadius: 10, border: `1px solid ${opt.border || "#d6d0c8"}`,
                            background: stageObj.status === opt.val ? opt.bg : "#f9f7f4",
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
                            {tk.completed && <Icon name="check" size={11} style={{ color: "#f7f5f2" }} />}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 14 }}>{tk.icon}</span>
                              <span style={{ fontSize: 12, color: tk.completed ? "#a09890" : "#3d3530", textDecoration: tk.completed ? "line-through" : "none", lineHeight: 1.4 }}>
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
                                  <button onClick={() => { onAssignTask(to.id, def.id, tk.id, null); setAssigningTask(null); }} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "#f0ece6", border: "1px solid #d6d0c8", color: "#a09890", cursor: "pointer" }}></button>
                                </div>
                              ) : (
                                <button onClick={() => setAssigningTask({ stageId: def.id, taskId: tk.id })} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "#ffffff", border: "1px solid #e8e4de", color: "#a09890", cursor: "pointer" }}>
                                  assign
                                </button>
                              )}

                              {tk.completed_at && (
                                <span style={{ fontSize: 9, color: "#d6d0c8", marginLeft: "auto" }}>{timeAgo(tk.completed_at)}</span>
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
    <div style={{ paddingBottom: 100 }}>
      {/* Page header */}
      <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, color: "#e07d2a", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Make Ready</p>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Turnover Board</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ width: 40, height: 40, background: "linear-gradient(135deg, #e07d2a, #c45e0a)", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 14px #e07d2a40" }}
        >
          <Icon name="plus" size={18} style={{ color: "white" }} />
        </button>
      </div>

      <MakeReadyBoard turnovers={db.turnovers} db={db} updateDB={updateDB} />

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}>
            <motion.div className="modal-sheet" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>New Turnover</h2>
              <p style={{ fontSize: 12, color: "#a09890", marginBottom: 20 }}>All 6 work stages are created automatically. Your team can start them in any order.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Unit</label>
                  <select className="input-dark" value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}>
                    <option value="">Select unit...</option>
                    {db.units.map(u => <option key={u.id} value={u.id}>#{u.unit_number} — {db.properties.find(p => p.id === u.property_id)?.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Target Move-In Ready Date</label>
                  <input className="input-dark" type="date" value={form.target_ready_date} onChange={e => setForm(f => ({ ...f, target_ready_date: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Lead Technician</label>
                  <select className="input-dark" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {db.team.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Lease Status</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[["leased", " Leased"], ["unleased", " Unleased"]].map(([v, l]) => (
                      <button key={v} onClick={() => setForm(f => ({ ...f, lease_status: v }))} style={{
                        padding: "10px", borderRadius: 12,
                        border: form.lease_status === v ? "1px solid #e07d2a" : "1px solid #e8e4de",
                        background: form.lease_status === v ? "#e07d2a20" : "#f9f7f4", cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: form.lease_status === v ? "#f0a05a" : "#6b6560",
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#f9f7f4", border: "1px solid #f0ece6", borderRadius: 12, padding: "12px 14px" }}>
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
    porter: { bg: "#bbf7d0", color: "#059669", border: "#4ade80" },
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
        <button onClick={() => setShowForm(true)} style={{ width: 40, height: 40, background: "linear-gradient(135deg, #e07d2a, #c45e0a)", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
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
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1a1614" }}>{member.name}</h3>
                  <span className="chip" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>{member.role}</span>
                </div>
                <p style={{ fontSize: 12, color: "#a09890" }}>{member.specialty} · {member.phone || "No phone"}</p>
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
                    <label style={{ fontSize: 11, color: "#a09890", display: "block", marginBottom: 4 }}>Role</label>
                    <select className="input-dark" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#a09890", display: "block", marginBottom: 4 }}>Specialty</label>
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
// ONESIGNAL — web push notification setup
// ─────────────────────────────────────────────

const ONESIGNAL_APP_ID = "71c5efb6-f528-4f84-8846-34f67a314ea4";

async function initOneSignal() {
  try {
    if (!window.OneSignal) return;
    await window.OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false },
    });
  } catch (e) {
    console.warn("OneSignal init failed:", e.message);
  }
}

async function requestPushPermission() {
  try {
    if (!window.OneSignal) return false;
    await window.OneSignal.Slidedown.promptPush();
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// AGENT PAGE — the AI coordinator control center
// ─────────────────────────────────────────────

const AGENT_LOG_KEY = "unitflow_agent_log";

async function loadAgentLog() {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/agent_log?order=created_at.desc&limit=50`, {
        headers: {
          "apikey": SUPABASE_ANON,
          "Authorization": `Bearer ${SUPABASE_ANON}`,
        }
      });
      if (r.ok) return r.json();
    } catch {}
  }
  // Fallback to local storage
  try {
    const r = await window.storage.get(AGENT_LOG_KEY);
    return r ? JSON.parse(r.value) : [];
  } catch { return []; }
}

function AgentPage() {
  const { db } = useApp();
  const [log, setLog]             = useState([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [running, setRunning]     = useState(false);
  const [lastRun, setLastRun]     = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
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
    // Check if push is already enabled
    if (window.OneSignal) {
      window.OneSignal.isPushNotificationsEnabled?.().then(enabled => setPushEnabled(enabled)).catch(() => {});
    }
    // Initialize OneSignal
    initOneSignal();
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

  async function enablePush() {
    setPushLoading(true);
    const success = await requestPushPermission();
    setPushEnabled(success);
    setPushLoading(false);
  }

  async function sendTestSMS() {
    if (!settings.supervisorPhone) return;
    try {
      await fetch("/.netlify/functions/agent-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: settings.supervisorPhone,
          message: `UnitFlow AI Agent test message. You have ${activeTurnovers.length} active turnovers. Agent monitoring is active.`,
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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1614", letterSpacing: "-0.02em" }}>Agent</h1>
          <button
            onClick={() => setSettingsOpen(s => !s)}
            style={{ width: 36, height: 36, background: "#f0ece6", border: "1px solid #e8e4de", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </div>

      {/* Agent status card */}
      <div style={{ background: "linear-gradient(135deg, #fff7ed, #fef3e8)", border: "1px solid #fed7aa", borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px #e07d2a40" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1614" }}>Make Ready Agent</p>
            <p style={{ fontSize: 11, color: "#a09890" }}>
              {lastRun ? `Last run ${lastRun.toLocaleTimeString()}` : "Ready to run"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", boxShadow: "0 0 8px #05966980" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>Active</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Monitoring", value: activeTurnovers.length, color: "#e07d2a" },
            { label: "Critical",   value: criticalCount,           color: criticalCount > 0 ? "#dc2626" : "#a09890" },
            { label: "Log Entries", value: log.length,             color: "#6b6560" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 8px", textAlign: "center", border: "1px solid #fed7aa" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#a09890", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
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
              background: running ? "#f0ece6" : "linear-gradient(135deg,#e07d2a,#c45e0a)",
              color: running ? "#a09890" : "white",
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
                  <p key={i} style={{ fontSize: 11, color: "#6b6560", marginTop: 3 }}>{a.type}: {a.message?.slice(0, 80)}...</p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Push notification setup */}
      {!pushEnabled && (
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e07d2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1614" }}>Enable Push Notifications</p>
              <p style={{ fontSize: 11, color: "#a09890" }}>Get alerts when units are at risk</p>
            </div>
          </div>
          <button
            onClick={enablePush}
            disabled={pushLoading}
            style={{ width: "100%", padding: "11px", borderRadius: 11, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#e07d2a,#c45e0a)", color: "white", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px #e07d2a40" }}
          >
            {pushLoading ? "Enabling..." : "Enable Notifications"}
          </button>
        </div>
      )}

      {pushEnabled && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", boxShadow: "0 0 8px #05966980" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>Push notifications enabled</span>
        </div>
      )}

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden", marginBottom: 16 }}>
            <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#a09890", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Agent Settings</p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, display: "block", marginBottom: 6 }}>Supervisor Phone (for SMS alerts)</label>
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
                    style={{ padding: "0 14px", borderRadius: 11, border: "1px solid #e8e4de", background: settings.supervisorPhone ? "#fff7ed" : "#f9f7f4", color: settings.supervisorPhone ? "#e07d2a" : "#a09890", fontSize: 12, fontWeight: 700, cursor: settings.supervisorPhone ? "pointer" : "default", whiteSpace: "nowrap" }}
                  >
                    Test SMS
                  </button>
                </div>
                <p style={{ fontSize: 10, color: "#a09890", marginTop: 4 }}>Used for urgent alerts when a unit goes critical</p>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, display: "block", marginBottom: 6 }}>Morning Briefing Time</label>
                <input
                  className="input-dark"
                  type="time"
                  value={settings.briefingTime}
                  onChange={e => setSettings(s => ({ ...s, briefingTime: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid #f0ece6" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1614" }}>SMS Urgent Alerts</p>
                  <p style={{ fontSize: 11, color: "#a09890" }}>Text when units go critical</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, smsAlerts: !s.smsAlerts }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                    background: settings.smsAlerts ? "linear-gradient(135deg,#e07d2a,#c45e0a)" : "#e8e4de",
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
        <p style={{ fontSize: 11, fontWeight: 700, color: "#a09890", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
          Activity Log {log.length > 0 ? `(${log.length})` : ""}
        </p>

        {loadingLog ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
          </div>
        ) : log.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d6d0c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 10px" }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6b6560", marginBottom: 4 }}>No activity yet</p>
            <p style={{ fontSize: 11, color: "#a09890" }}>Tap "Run Now" to start the agent</p>
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
                    <span style={{ fontSize: 9, color: "#a09890", whiteSpace: "nowrap", marginLeft: 8 }}>
                      {entry.created_at ? timeAgo(entry.created_at) : ""}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "#3d3530", lineHeight: 1.5 }}>{entry.description}</p>
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
          color: "#a09890", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
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
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="share" size={13} style={{ color: "white" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#f0a05a" }}>Share Link Active</p>
              <p style={{ fontSize: 10, color: "#a09890" }}>Anyone with this link can view & update progress</p>
            </div>
            <button onClick={refreshShare} title="Sync latest data" style={{ width: 28, height: 28, background: "#e07d2a20", border: "1px solid #e07d2a30", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Icon name="refresh" size={12} style={{ color: "#e07d2a" }} />
            </button>
          </div>

          {/* URL display */}
          <div style={{ padding: "10px 14px" }}>
            <div style={{
              background: "#f7f5f2", border: "1px solid #e8e4de", borderRadius: 10,
              padding: "8px 12px", marginBottom: 10,
              fontFamily: "monospace", fontSize: 11, color: "#6b6560",
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
                  background: state === "copied" ? "#059669" : "linear-gradient(135deg,#e07d2a,#c45e0a)",
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
                  background: "#ffffff", color: "#a09890",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                <Icon name="x" size={12} /> Close
              </button>
            </div>

            {/* Who can access note */}
            <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11 }}></span>
              <p style={{ fontSize: 10, color: "#a09890", lineHeight: 1.5 }}>
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "#f7f5f2" }}>
      <style>{THEME.css}</style>
      <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="wrench" size={26} style={{ color: "white" }} />
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", animationDelay: `${i*0.2}s` }} />)}
      </div>
      <p style={{ fontSize: 13, color: "#a09890" }}>Loading make-ready board...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#f7f5f2", textAlign: "center" }}>
      <style>{THEME.css}</style>
      <div style={{ fontSize: 48, marginBottom: 16 }}></div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1614", marginBottom: 8 }}>Link not found</h2>
      <p style={{ fontSize: 14, color: "#a09890", lineHeight: 1.6 }}>This make-ready link may have expired or been removed by the property manager.</p>
    </div>
  );

  const pct = overallPct(to);
  const daysLeft = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const doneStages = (to.stages || []).filter(s => s.status === "done").length;
  const totalStages = MR_STAGES.length;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5f2", maxWidth: 480, margin: "0 auto" }}>
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
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="wrench" size={16} style={{ color: "white" }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#e07d2a", letterSpacing: "0.06em", textTransform: "uppercase" }}>UnitFlow</p>
            <p style={{ fontSize: 10, color: "#a09890" }}>Make-Ready Board</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {saving ? (
            <p style={{ fontSize: 10, color: "#e07d2a" }}>Saving...</p>
          ) : lastSaved ? (
            <p style={{ fontSize: 10, color: "#a09890" }}>Saved {timeAgo(lastSaved.toISOString())}</p>
          ) : null}
          {visitorName && (
            <p style={{ fontSize: 10, color: "#a09890" }}>Logged as <span style={{ color: "#f0a05a", fontWeight: 700 }}>{visitorName}</span></p>
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
              <Icon name="check_circle" size={16} style={{ color: "#059669" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>This unit is Move-In Ready!</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1614", lineHeight: 1.1 }}>Unit {to.unit_number}</h1>
              <p style={{ fontSize: 13, color: "#6b6560", marginTop: 4 }}>{to.property_name}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                background: to.lease_status === "leased" ? "#dcfce7" : "#f0b40015",
                color: to.lease_status === "leased" ? "#059669" : "#f5d05e",
                border: `1px solid ${to.lease_status === "leased" ? "#86efac" : "#f0b40035"}`,
              }}>
                {to.lease_status === "leased" ? " Leased" : " Unleased"}
              </span>
              <p style={{ fontSize: 11, color: daysLeft < 0 ? "#dc2626" : daysLeft <= 3 ? "#ffad5c" : "#a09890", marginTop: 5, fontWeight: 600 }}>
                {daysLeft < 0 ? ` ${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d to target`}
              </p>
            </div>
          </div>

          {/* Progress ring + stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {/* Big percentage */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: pct === 100 ? "#059669" : "#f0a05a", lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 10, color: "#a09890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>Complete</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, borderRadius: 4, background: "#f0ece6", overflow: "hidden", marginBottom: 8 }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 4, background: pct === 100 ? "#059669" : "linear-gradient(90deg,#e07d2a,#c45e0a)" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div style={{ background: "#f9f7f4", borderRadius: 8, padding: "6px 10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>{doneStages}</div>
                  <div style={{ fontSize: 9, color: "#a09890", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Stages Done</div>
                </div>
                <div style={{ background: "#f9f7f4", borderRadius: 8, padding: "6px 10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#7fa8ff" }}>{totalStages - doneStages}</div>
                  <div style={{ fontSize: 9, color: "#a09890", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Remaining</div>
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
                    background: isDone ? def.bg : isIP ? def.bg : "#f9f7f4",
                    border: `1px solid ${isDone ? def.accent : isIP ? def.accent : "#f0ece6"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: isDone ? def.dot : isIP ? def.dot : "#d6d0c8", flexShrink: 0 }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: isDone ? def.color : isIP ? def.color : "#b8b0a8", textTransform: "uppercase", letterSpacing: "0.03em" }}>{def.short}</span>
                  </div>
                  <div style={{ fontSize: 9, color: isDone ? "#059669" : isIP ? def.color : "#d6d0c8", fontWeight: 600 }}>{done}/{total}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/*  Worker identity banner  */}
        {!visitorName ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#f0ece6", border: "1px solid #e07d2a30", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}
          >
            <div style={{ width: 36, height: 36, background: "#e07d2a20", border: "1px solid #e07d2a40", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="users" size={16} style={{ color: "#f0a05a" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1614", marginBottom: 2 }}>Who's working today?</p>
              <p style={{ fontSize: 11, color: "#a09890" }}>Enter your name to check off tasks</p>
            </div>
            <button
              onClick={() => setShowNamePrompt(true)}
              style={{ padding: "8px 14px", borderRadius: 10, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Sign In
            </button>
          </motion.div>
        ) : (
          <div style={{ background: "#dcfce7", border: "1px solid #05966930", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="check_circle" size={14} style={{ color: "#059669" }} />
            <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>Signed in as {visitorName}</span>
            <button onClick={() => setVisitorName("")} style={{ marginLeft: "auto", fontSize: 11, color: "#a09890", background: "none", border: "none", cursor: "pointer" }}>Change</button>
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
              ? { bg: "#dcfce7", border: "#86efac", color: "#059669" }
              : isIP
              ? { bg: def.bg, border: def.accent, color: def.color }
              : { bg: "#f9f7f4", border: "#f0ece6", color: "#a09890" };

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
                    background: isDone ? "#059669" : isIP ? def.dot : "#e8e4de",
                    border: !isDone && !isIP ? "1.5px solid #d6d0c8" : "none",
                  }}>
                    {isDone
                      ? <Icon name="check" size={12} style={{ color: "#f7f5f2" }} />
                      : isIP
                      ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f7f5f2" }} />
                      : null
                    }
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, flex: 1, textAlign: "left", color: statusStyle.color }}>{def.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: taskDone === taskTotal && taskTotal > 0 ? "#059669" : statusStyle.color }}>
                    {taskDone}/{taskTotal}
                  </span>
                  <Icon name={isOpen ? "chevron_down" : "chevron_right"} size={16} style={{ color: "#a09890" }} />
                </button>

                <AnimatePresence>
                  {isOpen && tasks.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        overflow: "hidden",
                        background: "#f4f1ed",
                        border: `1px solid ${statusStyle.border}`,
                        borderTop: "none",
                        borderRadius: "0 0 12px 12px",
                      }}
                    >
                      {/* Stage status indicator */}
                      <div style={{ padding: "8px 14px 6px", borderBottom: "1px solid #ede9e3", display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: isDone ? "#059669" : isIP ? def.dot : "#d6d0c8" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? "#059669" : isIP ? def.color : "#a09890" }}>
                          {isDone ? "Stage complete" : isIP ? "In progress" : "Not started"}
                        </span>
                        {taskDone > 0 && (
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "#a09890" }}>
                            {taskDone} of {taskTotal} tasks done
                          </span>
                        )}
                      </div>

                      {tasks.map((tk, ti) => (
                        <motion.div
                          key={tk.id}
                          animate={justChecked === tk.id ? { backgroundColor: ["#f4f1ed", `${def.dot}15`, "#f4f1ed"] } : {}}
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
                              {tk.completed && <Icon name="check" size={13} style={{ color: "#f7f5f2" }} />}
                            </button>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ fontSize: 16 }}>{tk.icon}</span>
                                <span style={{ fontSize: 13, color: tk.completed ? "#a09890" : "#3d3530", textDecoration: tk.completed ? "line-through" : "none", fontWeight: tk.completed ? 400 : 500, lineHeight: 1.4 }}>
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
                                    <span style={{ fontSize: 10, color: "#a09890" }}>assigned to {tk.assignee_name}</span>
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
            <div style={{ width: 20, height: 20, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="wrench" size={10} style={{ color: "white" }} />
            </div>
            <span style={{ fontSize: 11, color: "#a09890", fontWeight: 600 }}>Powered by </span>
            <span style={{ fontSize: 11, fontWeight: 800, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>UnitFlow Pro</span>
          </div>
          <p style={{ fontSize: 10, color: "#c8c0b8", marginTop: 8 }}>Make-ready coordination for property teams</p>
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
              <div style={{ width: 36, height: 4, background: "#d6d0c8", borderRadius: 2, margin: "0 auto 20px" }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a1614", marginBottom: 6 }}>What's your name?</h3>
              <p style={{ fontSize: 13, color: "#a09890", marginBottom: 20, lineHeight: 1.5 }}>
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
                  background: nameInput.trim() ? "linear-gradient(135deg,#e07d2a,#c45e0a)" : "#f0ece6",
                  color: nameInput.trim() ? "white" : "#a09890",
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
const SYNC_KEY   = "unitflow_live_board";
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
    const key = "unitflow_activity_log";
    const existing = await window.storage.get(key, true);
    const log = existing ? JSON.parse(existing.value) : [];
    log.unshift({ ...entry, id: genId("act"), ts: new Date().toISOString() });
    await window.storage.set(key, JSON.stringify(log.slice(0, 80)), true);
  } catch {}
}

async function readActivityLog() {
  try {
    const r = await window.storage.get("unitflow_activity_log", true);
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

  //  Render 
  return (
    <div style={{ minHeight: "100vh", background: "#f2f0ec", display: "flex", flexDirection: "column" }}>
      <style>{THEME.css}</style>
      <style>{`
        .desk-card:hover { border-color: #e07d2a50 !important; background: #f4f1ed !important; }
        .desk-btn:hover  { opacity: 0.85; }
        .stage-col::-webkit-scrollbar { width: 4px; }
        .stage-col::-webkit-scrollbar-track { background: transparent; }
        .stage-col::-webkit-scrollbar-thumb { background: #d6d0c8; border-radius: 2px; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
      `}</style>

      {/*  Top bar  */}
      <div style={{ height: 58, background: "#f4f1ed", borderBottom: "1px solid #f0ece6", display: "flex", alignItems: "center", padding: "0 24px", gap: 20, flexShrink: 0, position: "sticky", top: 0, zIndex: 100 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="wrench" size={16} style={{ color: "white" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#1a1614", lineHeight: 1 }}>UnitFlow</p>
            <p style={{ fontSize: 9, color: "#e07d2a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>PM Hub</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 2, background: "#ffffff", borderRadius: 10, padding: 3 }}>
          {[["board","grid","Make Ready Board"], ["analytics","chart","Analytics"]].map(([t, icon, label]) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: activeTab === t ? "linear-gradient(135deg,#e07d2a,#c45e0a)" : "transparent",
              color: activeTab === t ? "white" : "#a09890",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon name={icon} size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Property filter */}
        <select
          value={filterProperty}
          onChange={e => setFilterProperty(e.target.value)}
          style={{ padding: "6px 12px", background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 8, color: "#3d3530", fontSize: 12, cursor: "pointer", outline: "none" }}
        >
          <option value="all">All Properties</option>
          {db.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Sync indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: syncPulse ? "#059669" : "#d6d0c8",
            boxShadow: syncPulse ? "0 0 8px #059669" : "none",
            animation: syncPulse ? "pulse-dot 0.6s ease" : "none",
            transition: "background 0.3s",
          }} />
          <span style={{ fontSize: 11, color: "#a09890" }}>
            {lastSync ? `Synced ${timeAgo(lastSync)}` : "Syncing…"}
          </span>
        </div>

        {/* New turnover button */}
        <button
          onClick={() => setShowNewTurnover(true)}
          className="desk-btn"
          style={{
            padding: "8px 16px", background: "linear-gradient(135deg,#e07d2a,#c45e0a)", border: "none", borderRadius: 10,
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7, boxShadow: "0 2px 12px #e07d2a40",
          }}
        >
          <Icon name="plus" size={14} /> New Turnover
        </button>
      </div>

      {/*  Stats strip  */}
      <div style={{ background: "#f4f1ed", borderBottom: "1px solid #f0ece6", padding: "10px 24px", display: "flex", gap: 24, flexShrink: 0 }}>
        {[
          { label: "Total Active",  value: stats.total,   color: "#f0a05a" },
          { label: "In Progress",   value: stats.active,  color: "#7fa8ff" },
          { label: "Move-In Ready", value: stats.ready,   color: "#059669" },
          { label: "Overdue",       value: stats.overdue, color: stats.overdue > 0 ? "#dc2626" : "#a09890" },
          { label: "Avg Days Open", value: stats.avgDays, color: "#ffad5c" },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", align: "center", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: 10, color: "#a09890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "center", lineHeight: 1.3 }}>{s.label}</span>
            <div style={{ width: 1, background: "#f0ece6", margin: "0 4px", alignSelf: "stretch" }} />
          </div>
        ))}
      </div>

      {/*  Main content  */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {activeTab === "board" && (
          <>
            {/*  Kanban board  */}
            <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", display: "flex", padding: "20px 0 20px 20px", gap: 14 }}>
              {MR_STAGES.map(def => {
                const stageUnits = filtered.filter(u => !u.is_ready && u.stages?.some(s => s.id === def.id && s.status === "in_progress"));
                const idleUnits  = filtered.filter(u => !u.is_ready && u.stages?.some(s => s.id === def.id && s.status === "idle") && !u.stages?.some(s => s.id === def.id && s.status === "in_progress"));

                // Show units that have this stage in progress OR not started
                const columnUnits = filtered.filter(u => {
                  if (u.is_ready) return false;
                  const stage = u.stages?.find(s => s.id === def.id);
                  return stage && stage.status !== "done";
                });

                return (
                  <div key={def.id} style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Column header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: def.dot, boxShadow: `0 0 8px ${def.dot}60` }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: def.color, textTransform: "uppercase", letterSpacing: "0.06em", flex: 1 }}>{def.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: def.color, background: def.bg, border: `1px solid ${def.accent}`, borderRadius: 6, padding: "1px 7px" }}>
                        {columnUnits.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="stage-col" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                      {columnUnits.map(to => (
                        <DeskUnitCard
                          key={to.id}
                          to={to}
                          stageDef={def}
                          db={db}
                          isSelected={selectedUnit === to.id}
                          onClick={() => setSelectedUnit(selectedUnit === to.id ? null : to.id)}
                          onSetStageStatus={setStageStatus}
                          onAssignStage={assignStageToMember}
                        />
                      ))}
                      {columnUnits.length === 0 && (
                        <div style={{ border: "1px dashed #f0ece6", borderRadius: 12, padding: "20px 12px", textAlign: "center" }}>
                          <p style={{ fontSize: 11, color: "#c8c0b8" }}>No units</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Ready column */}
              <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#059669", boxShadow: "0 0 8px #05966960" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em", flex: 1 }}>Move-In Ready</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#dcfce7", border: "1px solid #05966935", borderRadius: 6, padding: "1px 7px" }}>
                    {filtered.filter(u => u.is_ready).length}
                  </span>
                </div>
                <div className="stage-col" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.filter(u => u.is_ready).map(to => (
                    <DeskUnitCard
                      key={to.id}
                      to={to}
                      stageDef={{ id: "ready", label: "Ready", color: "#059669", bg: "#dcfce7", accent: "#86efac", dot: "#059669" }}
                      db={db}
                      isSelected={selectedUnit === to.id}
                      onClick={() => setSelectedUnit(selectedUnit === to.id ? null : to.id)}
                      onSetStageStatus={setStageStatus}
                      onAssignStage={assignStageToMember}
                    />
                  ))}
                </div>
              </div>
              <div style={{ width: 20, flexShrink: 0 }} />
            </div>

            {/*  Right panel: Unit detail + Activity  */}
            <div style={{ width: selectedTO ? 380 : 300, flexShrink: 0, borderLeft: "1px solid #f0ece6", display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.25s ease" }}>
              {selectedTO ? (
                <DeskUnitDetail
                  to={selectedTO}
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
          </>
        )}

        {activeTab === "analytics" && (
          <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
            <DeskAnalytics units={units} db={db} />
          </div>
        )}
      </div>

      {/*  Toast notification  */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            style={{ position: "fixed", bottom: 24, left: "50%", zIndex: 200, background: "#e8e4de", border: "1px solid #e07d2a40", borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: "#1a1614", boxShadow: "0 4px 24px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/*  New Turnover modal  */}
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="desk-card"
      onClick={onClick}
      style={{
        background: isSelected ? "#f4f1ed" : "#ffffff",
        border: `1px solid ${isSelected ? "#e07d2a60" : "#e8e4de"}`,
        borderRadius: 12, padding: 12, cursor: "pointer",
        boxShadow: isSelected ? "0 0 0 1px #e07d2a40, 0 4px 20px rgba(124,106,247,0.12)" : "none",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: stageDef.bg, border: `1px solid ${stageDef.accent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: stageDef.color }}>{to.unit_number}</span>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1a1614", lineHeight: 1.2 }}>Unit {to.unit_number}</p>
            <p style={{ fontSize: 10, color: "#a09890", lineHeight: 1.2 }}>{to.property_name?.split(" ").slice(0, 2).join(" ")}</p>
          </div>
        </div>
        {to.is_ready ? (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#059669", background: "#dcfce7", border: "1px solid #05966930", borderRadius: 6, padding: "2px 6px" }}> Ready</span>
        ) : isOverdue ? (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626" }}> {Math.abs(daysLeft)}d late</span>
        ) : (
          <span style={{ fontSize: 9, color: "#a09890" }}>{daysLeft}d left</span>
        )}
      </div>

      {/* Overall progress bar */}
      <div style={{ height: 3, borderRadius: 2, background: "#f0ece6", overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: pct === 100 ? "#059669" : `linear-gradient(90deg, ${stageDef.dot}, ${stageDef.dot}88)`, transition: "width 0.4s" }} />
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
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0ece6", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 11, color: "#e07d2a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{to.property_name}</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1614", lineHeight: 1.1 }}>Unit {to.unit_number}</h2>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={{ width: 30, height: 30, background: "#fef2f2", border: "1px solid #ff3b3b25", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Icon name="trash" size={12} style={{ color: "#dc2626" }} />
              </button>
            ) : (
              <button onClick={() => onDelete(to.id)} style={{ padding: "5px 10px", background: "#dc2626", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "white", cursor: "pointer" }}>Delete</button>
            )}
            <button onClick={onClose} style={{ width: 30, height: 30, background: "#f0ece6", border: "1px solid #d6d0c8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon name="x" size={13} style={{ color: "#6b6560" }} />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 7, background: to.lease_status === "leased" ? "#dcfce7" : "#f0b40012", color: to.lease_status === "leased" ? "#059669" : "#f5d05e", border: `1px solid ${to.lease_status === "leased" ? "#86efac" : "#f0b40030"}` }}>
            {to.lease_status === "leased" ? " Leased" : " Unleased"}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: daysLeft < 0 ? "#dc2626" : daysLeft <= 3 ? "#ffad5c" : "#a09890" }}>
            {daysLeft < 0 ? ` ${Math.abs(daysLeft)}d overdue` : `${daysLeft}d to target`}
          </span>
          {to.assigned_name && <span style={{ fontSize: 10, color: "#6b6560" }}> {to.assigned_name}</span>}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#a09890", fontWeight: 600 }}>Overall Progress</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: pct === 100 ? "#059669" : "#e07d2a" }}>{pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "#f0ece6", overflow: "hidden" }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} style={{ height: "100%", borderRadius: 3, background: pct === 100 ? "#059669" : "linear-gradient(90deg,#e07d2a,#c45e0a)" }} />
          </div>
        </div>

        {/* Mark ready button */}
        {to.is_ready ? (
          <button onClick={() => onMarkReady(to.id, false)} style={{ width: "100%", padding: "9px", borderRadius: 10, background: "#dcfce7", border: "1px solid #05966935", color: "#059669", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
             Move-In Ready — Click to Reopen
          </button>
        ) : (
          <button onClick={() => onMarkReady(to.id, true)} style={{
            width: "100%", padding: "9px", borderRadius: 10, border: "none",
            background: allDone ? "linear-gradient(135deg,#059669,#10b981)" : "#f0ece6",
            color: allDone ? "white" : "#a09890", fontSize: 12, fontWeight: 700, cursor: allDone ? "pointer" : "default",
            boxShadow: allDone ? "0 3px 12px #05966940" : "none",
          }}>
            {allDone ? "Mark Move-In Ready " : `${(to.stages||[]).filter(s=>s.status==="done").length}/${MR_STAGES.length} stages done`}
          </button>
        )}
      </div>

      {/* Stage list — scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        <p style={{ fontSize: 10, color: "#a09890", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Stages</p>
        {MR_STAGES.map(def => {
          const stageObj = (to.stages||[]).find(s => s.id === def.id) || { id: def.id, status: "idle", tasks: [] };
          const tasksDone = stageObj.tasks?.filter(t => t.completed).length || 0;
          const tasksTotal = stageObj.tasks?.length || 0;
          const isDone = stageObj.status === "done";
          const isIP   = stageObj.status === "in_progress";
          const isOpen = openStage === def.id;

          return (
            <div key={def.id} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: isOpen ? "10px 10px 0 0" : 10, background: isDone ? "#f0fdf4" : isIP ? def.bg : "#f9f7f4", border: `1px solid ${isDone ? "#86efac" : isIP ? def.accent : "#f0ece6"}`, borderBottom: isOpen ? "none" : undefined }}>
                {/* Status dot */}
                <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "#059669" : isIP ? def.dot : "#f0ece6", border: !isDone && !isIP ? "1.5px solid #d6d0c8" : "none" }}>
                  {isDone ? <Icon name="check" size={10} style={{ color: "#f7f5f2" }} /> : isIP ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f7f5f2" }} /> : null}
                </div>

                {/* Label */}
                <span style={{ fontSize: 12, fontWeight: 700, color: isDone ? "#059669" : isIP ? def.color : "#a09890", flex: 1 }}>{def.label}</span>

                {/* Task count */}
                <span style={{ fontSize: 10, color: isDone ? "#059669" : isIP ? def.color : "#b8b0a8", fontWeight: 600 }}>{tasksDone}/{tasksTotal}</span>

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
                        background: stageObj.status === opt.val ? (opt.val === "done" ? "#059669" : opt.val === "in_progress" ? def.dot : "#d6d0c8") : "#f0ece6",
                        color: stageObj.status === opt.val ? "#f7f5f2" : "#b8b0a8",
                        fontSize: 10, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >{opt.label}</button>
                  ))}
                </div>

                {/* Expand */}
                <button onClick={() => setOpenStage(isOpen ? null : def.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <Icon name={isOpen ? "chevron_down" : "chevron_right"} size={13} style={{ color: "#a09890" }} />
                </button>
              </div>

              {/* Expanded: tasks + assign */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden", background: "#f4f1ed", border: `1px solid ${isIP ? def.accent : "#f0ece6"}`, borderTop: "none", borderRadius: "0 0 10px 10px" }}
                  >
                    {/* Assign member */}
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #ede9e3" }}>
                      <p style={{ fontSize: 10, color: "#a09890", fontWeight: 600, marginBottom: 5 }}>ASSIGN TO</p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {db.team.map(m => (
                          <button
                            key={m.id}
                            onClick={() => onAssignStage(to.id, def.id, m.id)}
                            style={{
                              padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700, cursor: "pointer",
                              background: stageObj.assigned_to === m.id ? "#e07d2a" : "#f0ece6",
                              color: stageObj.assigned_to === m.id ? "white" : "#a09890",
                              border: `1px solid ${stageObj.assigned_to === m.id ? "#e07d2a" : "#d6d0c8"}`,
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
                          {tk.completed && <Icon name="check" size={10} style={{ color: "#f7f5f2" }} />}
                        </button>
                        <span style={{ fontSize: 11, color: tk.completed ? "#a09890" : "#3d3530", textDecoration: tk.completed ? "line-through" : "none", lineHeight: 1.4 }}>
                          {tk.icon} {tk.label}
                        </span>
                        {tk.completed_by && (
                          <span style={{ fontSize: 9, color: "#a09890", marginLeft: "auto", whiteSpace: "nowrap" }}>{tk.completed_by}</span>
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
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0ece6", flexShrink: 0 }}>
        <p style={{ fontSize: 11, color: "#e07d2a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Live Feed</p>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1a1614" }}>Activity</h3>
        <p style={{ fontSize: 11, color: "#a09890", marginTop: 2 }}>Updates from field team · auto-refreshes</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {log.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#c8c0b8" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}></div>
            <p style={{ fontSize: 12, color: "#b8b0a8" }}>No activity yet</p>
            <p style={{ fontSize: 11, color: "#d6d0c8", marginTop: 4 }}>Field updates will appear here in real time</p>
          </div>
        ) : log.map((entry, i) => (
          <div key={entry.id || i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < log.length - 1 ? "1px solid #f0ece6" : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0ece6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13 }}>{icons[entry.type] || ""}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#3d3530", lineHeight: 1.4 }}>{entry.text}</p>
              {entry.ts && <p style={{ fontSize: 10, color: "#b8b0a8", marginTop: 3 }}>{timeAgo(entry.ts)}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Team online strip */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #f0ece6", flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: "#b8b0a8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Team</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {db.team.filter(m => m.is_active).map(m => (
            <div key={m.id} title={m.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 100 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", boxShadow: "0 0 5px #05966980" }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6b6560" }}>{m.avatar}</span>
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
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1614", marginBottom: 20 }}>Portfolio Analytics</h2>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Avg Days to Turn",   value: avgTurnDays,   suffix: "d",   color: "#ffad5c" },
          { label: "Units Ready",         value: readyCount,    suffix: "",    color: "#059669" },
          { label: "Overdue Turnovers",   value: overdueCount,  suffix: "",    color: overdueCount > 0 ? "#dc2626" : "#a09890" },
          { label: "Total Active",        value: units.length,  suffix: "",    color: "#f0a05a" },
        ].map(k => (
          <div key={k.label} style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}{k.suffix}</div>
            <div style={{ fontSize: 11, color: "#a09890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 6 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Stage breakdown */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1614", marginBottom: 16 }}>Stage Breakdown</h3>
          {stageBreakdown.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#6b6560", flex: 1 }}>{s.label}</span>
              <div style={{ display: "flex", gap: 12 }}>
                <span title="In progress" style={{ fontSize: 12, fontWeight: 700, color: s.active > 0 ? s.color : "#c8c0b8" }}>{s.active} active</span>
                <span title="Done" style={{ fontSize: 12, fontWeight: 700, color: s.done > 0 ? "#059669" : "#c8c0b8" }}>{s.done} done</span>
              </div>
              <div style={{ width: 80, height: 4, background: "#f0ece6", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: units.length > 0 ? `${(s.active / units.length) * 100}%` : "0%", background: s.dot, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Team workload */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1614", marginBottom: 16 }}>Team Workload</h3>
          {teamLoad.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f0ece6", border: "1px solid #d6d0c8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#e07d2a" }}>{m.avatar}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#3d3530" }}>{m.name}</p>
                <p style={{ fontSize: 10, color: "#a09890" }}>{m.units || "No active stages"}</p>
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
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1614", marginBottom: 16 }}>By Property</h3>
          {db.properties.map(p => {
            const propUnits = units.filter(u => u.property_id === p.id);
            const propReady = propUnits.filter(u => u.is_ready).length;
            const propPct   = propUnits.length > 0 ? Math.round((propReady / propUnits.length) * 100) : 0;
            return (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#3d3530" }}>{p.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: propPct === 100 ? "#059669" : "#e07d2a" }}>{propReady}/{propUnits.length} ready</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "#f0ece6", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${propPct}%`, borderRadius: 3, background: "linear-gradient(90deg,#e07d2a,#c45e0a)", transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Days remaining heatmap */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1614", marginBottom: 16 }}>Target Date Status</h3>
          {units.filter(u => !u.is_ready).sort((a, b) => new Date(a.target_ready_date) - new Date(b.target_ready_date)).slice(0, 8).map(u => {
            const d = Math.ceil((new Date(u.target_ready_date) - Date.now()) / 86400000);
            const color = d < 0 ? "#dc2626" : d <= 3 ? "#ffad5c" : d <= 7 ? "#f5d05e" : "#059669";
            return (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 4, height: 24, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#3d3530", flex: 1 }}>Unit {u.unit_number} · {u.property_name?.split(" ")[0]}</span>
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
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1614" }}>New Turnover</h2>
            <p style={{ fontSize: 12, color: "#a09890", marginTop: 2 }}>All 6 make-ready stages auto-created. Team sees it instantly on mobile.</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, background: "#f0ece6", border: "1px solid #d6d0c8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="x" size={14} style={{ color: "#6b6560" }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Unit</label>
            <select className="input-dark" value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))} style={{ width: "100%" }}>
              <option value="">Select unit...</option>
              {db.units.map(u => <option key={u.id} value={u.id}>#{u.unit_number} — {db.properties.find(p => p.id === u.property_id)?.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Target Move-In Date</label>
            <input className="input-dark" type="date" value={form.target_ready_date} onChange={e => setForm(f => ({ ...f, target_ready_date: e.target.value }))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Lead Technician</label>
            <select className="input-dark" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} style={{ width: "100%" }}>
              <option value="">Unassigned</option>
              {db.team.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Lease Status</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["leased"," Leased"],["unleased"," Unleased"]].map(([v, l]) => (
                <button key={v} onClick={() => setForm(f => ({ ...f, lease_status: v }))} style={{ padding: "10px", borderRadius: 10, border: form.lease_status === v ? "1px solid #e07d2a" : "1px solid #e8e4de", background: form.lease_status === v ? "#e07d2a20" : "#f9f7f4", cursor: "pointer", fontSize: 13, fontWeight: 600, color: form.lease_status === v ? "#f0a05a" : "#6b6560" }}>{l}</button>
              ))}
            </div>
          </div>
          <button
            onClick={() => onCreate(form)}
            disabled={!form.unit_id || !form.target_ready_date}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: !form.unit_id || !form.target_ready_date ? "default" : "pointer",
              background: !form.unit_id || !form.target_ready_date ? "#f0ece6" : "linear-gradient(135deg,#e07d2a,#c45e0a)",
              color: !form.unit_id || !form.target_ready_date ? "#a09890" : "white",
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
    if (!res.ok) throw new Error(await res.text());
    return res.json();
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
    const days     = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
    const pct      = overallPct(to);
    const doneStages   = (to.stages || []).filter(s => s.status === "done").length;
    const activeStages = (to.stages || []).filter(s => s.status === "in_progress").map(s => s.id);
    const idleStages   = (to.stages || []).filter(s => s.status === "idle").map(s => s.id);
    const stalledStages = (to.stages || []).filter(s => {
      if (s.status !== "in_progress") return false;
      const lastActivity = s.tasks
        .filter(t => t.completed_at)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
      if (!lastActivity) return true;
      const hoursSince = (Date.now() - new Date(lastActivity.completed_at)) / 3600000;
      return hoursSince > 24;
    }).map(s => s.id);

    return {
      unit: `Unit ${to.unit_number} at ${to.property_name}`,
      daysToTarget: days,
      overallProgress: `${pct}%`,
      doneStages,
      activeStages,
      idleStages,
      stalledStages,
      leaseStatus: to.lease_status,
      assignedTo: to.assigned_name,
    };
  });

  const systemPrompt = `You are an AI coordinator for a property management make-ready system. 
You generate short, direct, human-sounding briefings for property management team members.
Never use bullet points with dashes. Use numbered lists when listing multiple items.
Keep responses under 120 words. Sound like a helpful coworker, not a robot.
Be specific — use unit numbers and names. Flag urgent issues clearly.
Always end with one clear action item for this person today.`;

  const userPrompt = role === "supervisor"
    ? `Good morning. Generate a morning briefing for ${memberName || "the supervisor"} who oversees all turnovers.
Here is the current state of all active turnovers: ${JSON.stringify(turnoverSummary, null, 2)}
Tell them: what is on track, what needs their attention today, and what one thing is most urgent right now.`
    : `Generate a personalized update for ${memberName || "a team member"} (role: ${role}).
Here is the current state of all active turnovers they are assigned to: ${JSON.stringify(turnoverSummary.filter(t => t.assignedTo === memberName), null, 2)}
Tell them specifically: what stage they should be working on right now and why, and if anything is at risk.`;

  const response = await fetch("/.netlify/functions/ai-briefing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.content?.[0]?.text || "";
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
// NOTIFICATION SYSTEM — in-app notifications
// ─────────────────────────────────────────────

function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  function addNotification(message, type = "info", unitNumber = null) {
    const id = genId("notif");
    setNotifications(prev => [{ id, message, type, unitNumber, ts: new Date().toISOString() }, ...prev.slice(0, 9)]);
    // Auto dismiss after 8 seconds
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 8000);
  }

  function dismissNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  return { notifications, addNotification, dismissNotification };
}

function NotificationToast({ notifications, onDismiss }) {
  if (notifications.length === 0) return null;
  return (
    <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 448, zIndex: 500, display: "flex", flexDirection: "column", gap: 8 }}>
      <AnimatePresence>
        {notifications.slice(0, 3).map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{
              background: n.type === "critical" ? "#fef2f2" : n.type === "at_risk" ? "#fff7ed" : n.type === "success" ? "#f0fdf4" : "#ffffff",
              border: `1px solid ${n.type === "critical" ? "#fecaca" : n.type === "at_risk" ? "#fed7aa" : n.type === "success" ? "#86efac" : "#e8e4de"}`,
              borderRadius: 14, padding: "12px 14px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4,
              background: n.type === "critical" ? "#dc2626" : n.type === "at_risk" ? "#e07d2a" : n.type === "success" ? "#059669" : "#6b6560",
            }} />
            <div style={{ flex: 1 }}>
              {n.unitNumber && (
                <p style={{ fontSize: 10, fontWeight: 700, color: n.type === "critical" ? "#dc2626" : n.type === "at_risk" ? "#e07d2a" : "#059669", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                  Unit {n.unitNumber}
                </p>
              )}
              <p style={{ fontSize: 12, color: "#1a1614", lineHeight: 1.5, fontWeight: 500 }}>{n.message}</p>
            </div>
            <button onClick={() => onDismiss(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a09890", flexShrink: 0, padding: 2 }}>
              <Icon name="x" size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// AI BRIEFING CARD
// ─────────────────────────────────────────────

function AIBriefingCard({ turnovers, role, memberName }) {
  const [briefing, setBriefing]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [generated, setGenerated] = useState(false);
  const [expanded, setExpanded]   = useState(false);

  async function generateBriefing() {
    setLoading(true);
    setExpanded(true);
    try {
      const text = await getAIBriefing(turnovers, role, memberName);
      setBriefing(text);
      setGenerated(true);
    } catch (e) {
      setBriefing("Error: " + (e.message || "Unable to generate briefing. Check your Anthropic API key in Netlify environment variables."));
      setGenerated(true);
    }
    setLoading(false);
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #fff7ed, #fef3e8)",
      border: "1px solid #fed7aa",
      borderRadius: 16, marginBottom: 16,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Header */}
      <button
        onClick={generated ? () => setExpanded(e => !e) : generateBriefing}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px #e07d2a40" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><path d="M20 2v4m0 0h-4m4 0l-5 5"/></svg>
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1614" }}>AI Coordinator</p>
          <p style={{ fontSize: 11, color: "#a09890" }}>
            {generated ? "Tap to expand your briefing" : "Tap for your personalized briefing"}
          </p>
        </div>
        {loading ? (
          <div style={{ width: 20, height: 20, border: "2px solid #fed7aa", borderTopColor: "#e07d2a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        ) : (
          <Icon name={expanded ? "chevron_down" : "chevron_right"} size={16} style={{ color: "#e07d2a" }} />
        )}
      </button>

      {/* Briefing content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 16px 16px" }}>
              <div style={{ height: 1, background: "#fed7aa", marginBottom: 14 }} />
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[100, 85, 70].map((w, i) => (
                    <div key={i} className="skeleton" style={{ height: 14, borderRadius: 4, width: `${w}%` }} />
                  ))}
                </div>
              ) : briefing ? (
                <p style={{ fontSize: 13, color: "#3d3530", lineHeight: 1.7, fontWeight: 400 }}>{briefing}</p>
              ) : null}
              {generated && !loading && (
                <button
                  onClick={generateBriefing}
                  style={{ marginTop: 12, fontSize: 11, color: "#e07d2a", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Icon name="refresh" size={12} /> Refresh briefing
                </button>
              )}
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
// UPDATED DASHBOARD — with AI coordinator
// ─────────────────────────────────────────────

function Dashboard() {
  const { db, navigate } = useApp();
  const rawTurnovers = (db.turnovers || []).map(migrateTurnover);
  const turnoversWithRisk = analyzeRisk(rawTurnovers);

  const total   = turnoversWithRisk.length;
  const ready   = rawTurnovers.filter(t => t.is_ready).length;
  const active  = rawTurnovers.filter(t => !t.is_ready && t.stages.some(s => s.status === "in_progress")).length;
  const overdue = turnoversWithRisk.filter(t => t.riskLevel === "critical").length;
  const atRisk  = turnoversWithRisk.filter(t => t.riskLevel === "at_risk").length;
  const queued  = rawTurnovers.filter(t => !t.is_ready && t.stages.every(s => s.status === "idle")).length;

  const stageActivity = MR_STAGES.map(s => ({
    ...s,
    count: rawTurnovers.filter(t => !t.is_ready && t.stages.find(st => st.id === s.id)?.status === "in_progress").length,
  })).filter(s => s.count > 0);

  const urgent = [...turnoversWithRisk]
    .filter(t => !t.is_ready)
    .sort((a, b) => new Date(a.target_ready_date) - new Date(b.target_ready_date))
    .slice(0, 4);

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: "#e07d2a", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Make Ready</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1614", letterSpacing: "-0.02em" }}>Overview</h1>
      </div>

      {/* AI Coordinator briefing card */}
      {total > 0 && (
        <AIBriefingCard
          turnovers={rawTurnovers}
          role="supervisor"
          memberName="Marcus Torres"
        />
      )}

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Active",  value: active,  color: "#e07d2a", bg: "#fff7ed", border: "#fed7aa" },
          { label: "Queued",  value: queued,  color: "#6b6560", bg: "#f9f7f4", border: "#e8e4de" },
          { label: "Ready",   value: ready,   color: "#059669", bg: "#f0fdf4", border: "#86efac" },
          { label: "At Risk", value: overdue + atRisk, color: (overdue + atRisk) > 0 ? "#dc2626" : "#a09890", bg: (overdue + atRisk) > 0 ? "#fef2f2" : "#f9f7f4", border: (overdue + atRisk) > 0 ? "#fecaca" : "#e8e4de" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#a09890", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Units needing attention */}
      {turnoversWithRisk.filter(t => t.riskLevel !== "on_track" && !t.is_ready).length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Needs Attention
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {turnoversWithRisk.filter(t => t.riskLevel !== "on_track" && !t.is_ready).map(to => (
              <button
                key={to.id}
                onClick={() => navigate("Turnovers")}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: to.riskLevel === "critical" ? "#fef2f2" : "#fff7ed", border: `1px solid ${to.riskLevel === "critical" ? "#fecaca" : "#fed7aa"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: to.riskLevel === "critical" ? "#dc2626" : "#e07d2a" }}>{to.unit_number}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1a1614", marginBottom: 1 }}>{to.property_name}</p>
                  <p style={{ fontSize: 10, color: to.riskLevel === "critical" ? "#dc2626" : "#c2570a", fontWeight: 600 }}>{to.riskReason}</p>
                </div>
                <Icon name="chevron_right" size={14} style={{ color: "#a09890", flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active stages */}
      {stageActivity.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#a09890", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Work in Progress</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stageActivity.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#3d3530", flex: 1 }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: s.color, background: s.bg, border: `1px solid ${s.accent}`, borderRadius: 8, padding: "2px 9px" }}>
                  {s.count} unit{s.count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming targets with risk indicators */}
      {urgent.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e8e4de", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#a09890", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>All Active Units</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {urgent.map(to => {
              const days = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
              const pct  = overallPct(to);
              const isOd = days < 0;
              return (
                <button
                  key={to.id}
                  onClick={() => navigate("Turnovers")}
                  style={{ display: "flex", flexDirection: "column", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: isOd ? "#fef2f2" : "#fff7ed", border: `1px solid ${isOd ? "#fecaca" : "#fed7aa"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: isOd ? "#dc2626" : "#e07d2a" }}>{to.unit_number}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1614", marginBottom: 3 }}>{to.property_name}</div>
                      <div style={{ height: 3, borderRadius: 2, background: "#f0ece6", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: isOd ? "#dc2626" : to.riskLevel === "at_risk" ? "#e07d2a" : "#059669", borderRadius: 2, transition: "width 0.4s" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isOd ? "#dc2626" : days <= 3 ? "#e07d2a" : "#a09890", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {isOd ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d`}
                    </span>
                  </div>
                  {to.riskLevel !== "on_track" && (
                    <RiskBadge riskLevel={to.riskLevel} riskReason={to.riskReason} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Jump to board */}
      <button
        onClick={() => navigate("Turnovers")}
        style={{
          width: "100%", padding: "14px", borderRadius: 14,
          background: "linear-gradient(135deg, #e07d2a, #c45e0a)",
          border: "none", cursor: "pointer", color: "white",
          fontSize: 14, fontWeight: 700,
          boxShadow: "0 4px 14px #e07d2a40",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        Open Make Ready Board
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>

      {total === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#a09890" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", opacity: 0.4 }}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#6b6560", marginBottom: 6 }}>No active turnovers</p>
          <p style={{ fontSize: 12, color: "#a09890" }}>Go to the board to create your first make-ready unit</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// APP ROOT — focused 3-tab navigation
// ─────────────────────────────────────────────

export default function App() {
  const [db, setDB]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState("Dashboard");
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error

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

  const { notifications, addNotification, dismissNotification } = useNotifications();

  // Risk monitor — checks turnovers every 60 seconds and fires notifications
  useEffect(() => {
    if (!db) return;
    function checkRisks() {
      const turnovers = (db.turnovers || []).map(migrateTurnover);
      const withRisk  = analyzeRisk(turnovers);
      withRisk.forEach(to => {
        if (to.riskLevel === "critical") {
          addNotification(to.riskReason, "critical", to.unit_number);
        } else if (to.riskLevel === "at_risk") {
          addNotification(to.riskReason, "at_risk", to.unit_number);
        }
      });
    }
    // Run once on load then every 60s
    const timer = setTimeout(checkRisks, 3000);
    const interval = setInterval(checkRisks, 60000);
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
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "#f7f5f2" }}>
        <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#e07d2a,#c45e0a)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px #e07d2a40" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <p style={{ fontSize: 13, color: "#a09890", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {isSupabaseConfigured() ? "Connecting to database..." : "Loading..."}
        </p>
      </div>
    </>
  );

  // Desktop PM Hub
  if (isDesktop) {
    return (
      <AppCtx.Provider value={{ db, updateDB, navigate }}>
        <style>{THEME.css}</style>
        <DesktopHub db={db} updateDB={updateDB} syncStatus={syncStatus} />
      </AppCtx.Provider>
    );
  }

  // Mobile field tech app — 4 tabs
  const PAGES = {
    Dashboard: <Dashboard />,
    Turnovers: <Turnovers />,
    Agent:     <AgentPage />,
    Team:      <Team />,
  };

  const NAV = [
    { page: "Dashboard", label: "Overview",  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { page: "Turnovers", label: "Make Ready", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, accent: true },
    { page: "Agent",     label: "Agent",      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
    { page: "Team",      label: "Team",       icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  ];

  return (
    <AppCtx.Provider value={{ db, updateDB, navigate }}>
      <style>{THEME.css}</style>
      <div style={{ minHeight: "100vh", background: "#f7f5f2", maxWidth: 480, margin: "0 auto", position: "relative" }}>
        <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

        {/* Top accent line */}
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 480, height: 2, background: "linear-gradient(90deg,transparent,#e07d2a,#c45e0a,transparent)", zIndex: 100 }} />

        {/* Sync indicator */}
        {syncStatus === "syncing" && (
          <div style={{ position: "fixed", top: 8, right: 16, zIndex: 200, fontSize: 10, color: "#e07d2a", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e07d2a", animation: "pulse-a 1s ease-in-out infinite" }} />
            Saving...
          </div>
        )}
        {syncStatus === "synced" && (
          <div style={{ position: "fixed", top: 8, right: 16, zIndex: 200, fontSize: 10, color: "#059669", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Saved
          </div>
        )}

        {/* Page content */}
        <div style={{ paddingTop: 2 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {PAGES[page] || <Dashboard />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation — 3 tabs */}
        <nav style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480, zIndex: 60,
          background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)",
          borderTop: "1px solid #e8e4de",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 8px 14px" }}>
            {NAV.map(item => {
              const isActive = page === item.page;
              if (item.accent) {
                return (
                  <button
                    key={item.page}
                    onClick={() => setPage(item.page)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      background: "none", border: "none", cursor: "pointer", padding: "4px 16px",
                      position: "relative",
                    }}
                  >
                    <div style={{
                      width: 46, height: 46, borderRadius: 15, marginTop: -20,
                      background: "linear-gradient(135deg,#e07d2a,#c45e0a)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 4px 16px #e07d2a50",
                      color: "white",
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? "#e07d2a" : "#a09890" }}>{item.label}</span>
                    {isActive && <motion.div layoutId="nav-dot" style={{ position: "absolute", top: 2, width: 4, height: 4, borderRadius: "50%", background: "#e07d2a" }} />}
                  </button>
                );
              }
              return (
                <button
                  key={item.page}
                  onClick={() => setPage(item.page)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    background: "none", border: "none", cursor: "pointer", padding: "4px 16px",
                    color: isActive ? "#e07d2a" : "#a09890", position: "relative",
                    transition: "color 0.2s",
                  }}
                >
                  {item.icon}
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
                  {isActive && <motion.div layoutId="nav-dot" style={{ position: "absolute", top: 2, width: 4, height: 4, borderRadius: "50%", background: "#e07d2a" }} />}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </AppCtx.Provider>
  );
}
