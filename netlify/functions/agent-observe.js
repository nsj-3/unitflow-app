// agent-observe.js
// The core agent observation engine
// Reads all active turnovers, detects issues, decides what actions to take
// Called on a schedule and also triggered manually from the app

const SUPABASE_URL  = "https://sxelqgfzandzapqgfvsa.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWxxZ2Z6YW5kemFwcWdmdnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTY0OTMsImV4cCI6MjA5Mjk3MjQ5M30.CaQwWW6io1PplAhQ6NKdQaCwqSChmkpE3pt9NFHYpKQ";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const TWILIO_SID    = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM   = process.env.TWILIO_PHONE_NUMBER;
const ONESIGNAL_APP = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_KEY = process.env.ONESIGNAL_API_KEY;

// Supabase helpers
async function dbSelect(table) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    headers: {
      "apikey": SUPABASE_ANON,
      "Authorization": `Bearer ${SUPABASE_ANON}`,
    }
  });
  return r.json();
}

async function dbInsert(table, row) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON,
      "Authorization": `Bearer ${SUPABASE_ANON}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(row),
  });
}

// Analyze a single turnover for risk
function analyzeRisk(to) {
  const days     = Math.ceil((new Date(to.target_ready_date) - Date.now()) / 86400000);
  const stages   = to.stages || [];
  const doneCount   = stages.filter(s => s.status === "done").length;
  const activeCount = stages.filter(s => s.status === "in_progress").length;
  const totalStages = stages.length;

  // Check for stalled stages
  const stalledStages = stages.filter(s => {
    if (s.status !== "in_progress") return false;
    const tasks = s.tasks || [];
    const lastActivity = tasks
      .filter(t => t.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
    if (!lastActivity) return true;
    const hoursSince = (Date.now() - new Date(lastActivity.completed_at)) / 3600000;
    return hoursSince > 24;
  });

  // Calculate expected progress
  const createdDays = Math.ceil((Date.now() - new Date(to.created_date)) / 86400000);
  const totalDays   = createdDays + Math.max(days, 0);
  const pct         = totalStages > 0 ? Math.round((doneCount / totalStages) * 100) : 0;
  const expectedPct = totalDays > 0 ? Math.min(95, Math.round((createdDays / totalDays) * 100)) : 0;

  let riskLevel  = "on_track";
  let riskReason = "";
  let urgent     = false;

  if (days < 0) {
    riskLevel  = "critical";
    riskReason = `Unit ${to.unit_number} is ${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""} overdue at ${to.property_name}`;
    urgent     = true;
  } else if (stalledStages.length > 0) {
    riskLevel  = "critical";
    riskReason = `Unit ${to.unit_number} at ${to.property_name} — ${stalledStages[0].id} stage has had no activity for 24+ hours`;
    urgent     = true;
  } else if (pct < expectedPct - 20) {
    riskLevel  = "at_risk";
    riskReason = `Unit ${to.unit_number} at ${to.property_name} is behind schedule — ${expectedPct}% expected, ${pct}% complete`;
    urgent     = false;
  } else if (days <= 2 && pct < 80) {
    riskLevel  = "at_risk";
    riskReason = `Unit ${to.unit_number} at ${to.property_name} — ${days} day${days !== 1 ? "s" : ""} left but only ${pct}% complete`;
    urgent     = true;
  } else if (activeCount === 0 && doneCount < totalStages && days <= 5) {
    riskLevel  = "at_risk";
    riskReason = `Unit ${to.unit_number} at ${to.property_name} — no stages active with target date in ${days} days`;
    urgent     = false;
  }

  return { riskLevel, riskReason, urgent, doneCount, activeCount, totalStages, pct, days };
}

// Generate AI message using Claude
async function generateMessage(prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await r.json();
  return data.content?.[0]?.text || "";
}

// Send SMS via Twilio
async function sendSMS(to, message) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) return;
  const body = new URLSearchParams({
    From: TWILIO_FROM,
    To: to,
    Body: message,
  });
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
}

// Send push notification via OneSignal
async function sendPush(title, message, data = {}) {
  if (!ONESIGNAL_APP || !ONESIGNAL_KEY) return;
  await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${ONESIGNAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP,
      included_segments: ["All"],
      headings: { en: title },
      contents: { en: message },
      data,
    }),
  });
}

// Log agent action to Supabase
async function logAction(type, description, unitId, unitNumber, propertyName, actionTaken, requiresConfirmation) {
  await dbInsert("agent_log", {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    description,
    unit_id: unitId || null,
    unit_number: unitNumber || null,
    property_name: propertyName || null,
    action_taken: actionTaken,
    requires_confirmation: requiresConfirmation || false,
    confirmed: false,
    created_at: new Date().toISOString(),
  });
}

exports.handler = async (event) => {
  const isMorningBriefing = event.queryStringParameters?.type === "morning";
  const actions = [];

  try {
    // Load all active turnovers
    const turnovers = await dbSelect("turnovers");
    const activeTurnovers = (turnovers || []).filter(t => !t.is_ready);

    if (activeTurnovers.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: "No active turnovers", actions: [] }) };
    }

    // ── Morning briefing ──────────────────────────────────────────
    if (isMorningBriefing) {
      const summary = activeTurnovers.map(to => {
        const risk = analyzeRisk(to);
        return {
          unit: `Unit ${to.unit_number} at ${to.property_name}`,
          daysToTarget: risk.days,
          progress: `${risk.pct}%`,
          riskLevel: risk.riskLevel,
          riskReason: risk.riskReason,
          assignedTo: to.assigned_name,
          leaseStatus: to.lease_status,
        };
      });

      const briefing = await generateMessage(
        `You are an AI coordinator for a property management company. Generate a morning briefing for the supervisor.
Current date: ${new Date().toLocaleDateString()}
Active turnovers: ${JSON.stringify(summary, null, 2)}
Write a short, direct briefing (under 160 characters for SMS, punchy and clear).
Format: "Good morning. You have X active turnovers. [Most urgent issue]. [One action to take today]."
Sound like a helpful team member, not a robot.`
      );

      // Send morning briefing as push notification
      await sendPush(
        "Good morning — Daily Briefing",
        briefing,
        { type: "morning_briefing" }
      );

      await logAction(
        "morning_briefing",
        briefing,
        null, null, null,
        "Sent push notification to supervisor",
        false
      );

      actions.push({ type: "morning_briefing", message: briefing });
    }

    // ── Real-time risk monitoring ─────────────────────────────────
    for (const to of activeTurnovers) {
      const risk = analyzeRisk(to);

      if (risk.riskLevel === "on_track") continue;

      // Generate a specific message for this unit
      const message = await generateMessage(
        `Write a short alert message (under 140 characters) for a property management supervisor.
Issue: ${risk.riskReason}
Days to target: ${risk.days}
Progress: ${risk.pct}%
Assigned to: ${to.assigned_name || "unassigned"}
Sound urgent but calm. Be specific. End with one action to take right now.`
      );

      if (risk.urgent) {
        // Critical — send SMS
        // In production you would look up supervisor phone from team table
        // For now log it and send push
        await sendPush(
          `URGENT — Unit ${to.unit_number}`,
          message,
          { type: "critical_alert", unit_id: to.unit_id, turnover_id: to.id }
        );

        await logAction(
          "critical_alert",
          message,
          to.unit_id,
          to.unit_number,
          to.property_name,
          "Sent urgent push notification",
          false
        );
      } else {
        // At risk — send push notification
        await sendPush(
          `Unit ${to.unit_number} needs attention`,
          message,
          { type: "risk_alert", unit_id: to.unit_id, turnover_id: to.id }
        );

        await logAction(
          "risk_alert",
          message,
          to.unit_id,
          to.unit_number,
          to.property_name,
          "Sent risk push notification",
          false
        );
      }

      actions.push({
        type: risk.urgent ? "critical_alert" : "risk_alert",
        unit: to.unit_number,
        property: to.property_name,
        message,
        riskLevel: risk.riskLevel,
      });
    }

    // Always log a scan summary so the activity log shows agent is working
    const onTrackCount = activeTurnovers.filter(t => analyzeRisk(t).riskLevel === "on_track").length;
    const atRiskCount  = actions.filter(a => a.type === "risk_alert").length;
    const criticalCount = actions.filter(a => a.type === "critical_alert").length;

    await logAction(
      "action",
      `Agent scanned ${activeTurnovers.length} active turnovers. ${onTrackCount} on track. ${atRiskCount} at risk. ${criticalCount} critical.`,
      null, null, null,
      `Checked ${activeTurnovers.length} turnovers at ${new Date().toLocaleTimeString()}`,
      false
    );

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, actions, turnoversChecked: activeTurnovers.length }),
    };

  } catch (err) {
    console.error("Agent observe error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
