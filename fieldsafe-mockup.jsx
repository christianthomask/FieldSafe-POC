import { useState, useEffect, useCallback } from "react";

/* ── Constants ─── */
const INCIDENT_TYPES = [
  { label: "Injury (on the job)", icon: "🤕" },
  { label: "Vehicle incident", icon: "🚗" },
  { label: "Near miss / close call", icon: "⚡" },
  { label: "Property damage", icon: "🏠" },
  { label: "Equipment failure", icon: "🔧" },
  { label: "Dog / animal encounter", icon: "🐕" },
  { label: "Slip / trip / fall", icon: "⬇️" },
  { label: "Weather-related", icon: "🌧️" },
  { label: "Customer confrontation", icon: "😤" },
  { label: "Other", icon: "📝" },
];

const SEVERITY_LEVELS = [
  { level: "minor", label: "Minor", desc: "First aid, no lost time", bg: "bg-emerald-500", bgLight: "bg-emerald-50", border: "border-emerald-400", text: "text-emerald-700", ring: "ring-emerald-400" },
  { level: "moderate", label: "Moderate", desc: "Medical attention needed", bg: "bg-amber-500", bgLight: "bg-amber-50", border: "border-amber-400", text: "text-amber-700", ring: "ring-amber-400" },
  { level: "serious", label: "Serious", desc: "OSHA recordable", bg: "bg-red-500", bgLight: "bg-red-50", border: "border-red-400", text: "text-red-700", ring: "ring-red-400" },
];

const OBS_TYPES = [
  { label: "Unsafe condition", icon: "⚠️", desc: "Broken equipment, missing PPE" },
  { label: "Unsafe behavior", icon: "🚫", desc: "Worker not following protocol" },
  { label: "Positive observation", icon: "✅", desc: "Worker doing something right" },
  { label: "Hazard identified", icon: "🔶", desc: "New hazard at a location" },
];

/* ── Storage helpers ─── */
async function loadAllData() {
  try {
    const result = await window.storage.get("fieldsafe-data");
    if (result && result.value) return JSON.parse(result.value);
  } catch (e) { /* first load */ }
  return { incidents: [], observations: [] };
}

async function saveAllData(data) {
  try {
    await window.storage.set("fieldsafe-data", JSON.stringify(data));
  } catch (e) {
    console.error("Storage save failed:", e);
  }
}

/* ── Date helpers ─── */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " at " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function formatDateInput(d) {
  return d.toISOString().split("T")[0];
}
function formatTimeInput(d) {
  return d.toTimeString().slice(0, 5);
}

/* ── Severity dot ─── */
function SevDot({ severity, size = "w-2.5 h-2.5" }) {
  const c = severity === "serious" ? "bg-red-500" : severity === "moderate" ? "bg-amber-500" : "bg-emerald-500";
  return <div className={`${size} rounded-full ${c} flex-shrink-0`} />;
}

/* ── Dashboard ─── */
function DashboardScreen({ incidents, observations, onViewIncident }) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthIncidents = incidents.filter(i => {
    const d = new Date(i.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const openFollowups = incidents.filter(i => i.follow_up_needed && !i.follow_up_completed);
  const seriousThisMonth = thisMonthIncidents.filter(i => i.severity === "serious").length;
  const totalObs = observations.length;

  // Last 6 months data
  const monthBuckets = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(thisYear, thisMonth - m, 1);
    const mo = d.getMonth();
    const yr = d.getFullYear();
    const count = incidents.filter(i => {
      const id = new Date(i.created_at);
      return id.getMonth() === mo && id.getFullYear() === yr;
    }).length;
    monthBuckets.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      count,
      hasSerious: incidents.some(i => {
        const id = new Date(i.created_at);
        return id.getMonth() === mo && id.getFullYear() === yr && i.severity === "serious";
      }),
    });
  }
  const maxCount = Math.max(...monthBuckets.map(b => b.count), 1);

  // Recent activity (combined, sorted by date)
  const recent = [
    ...incidents.map(i => ({ ...i, _type: "incident" })),
    ...observations.map(o => ({ ...o, _type: "observation" })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { val: thisMonthIncidents.length, label: "This Mo.", color: "text-slate-800" },
          { val: openFollowups.length, label: "Follow-ups", color: openFollowups.length > 0 ? "text-amber-600" : "text-slate-800" },
          { val: seriousThisMonth, label: "Serious", color: seriousThisMonth > 0 ? "text-red-600" : "text-emerald-600" },
          { val: totalObs, label: "Obs. Total", color: "text-sky-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">6-Month Trend</h3>
        <div className="flex items-end gap-2" style={{ height: "90px" }}>
          {monthBuckets.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full flex justify-center" style={{ height: "70px" }}>
                <div className="w-full max-w-8 flex flex-col justify-end">
                  <div
                    className={`w-full rounded-t ${b.hasSerious ? "bg-amber-400" : "bg-sky-400"}`}
                    style={{ height: `${Math.max((b.count / maxCount) * 100, b.count > 0 ? 8 : 0)}%`, minHeight: b.count > 0 ? "4px" : "0" }}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-1">{b.label}</div>
              <div className="text-xs font-medium text-slate-600">{b.count}</div>
            </div>
          ))}
        </div>
        {incidents.length === 0 && (
          <p className="text-xs text-slate-400 text-center mt-2">Log your first incident to see trends</p>
        )}
      </div>

      {/* Open follow-ups */}
      {openFollowups.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-amber-200 bg-amber-100/50">
            <h3 className="text-xs font-semibold text-amber-800">Open Follow-ups ({openFollowups.length})</h3>
          </div>
          {openFollowups.slice(0, 4).map((inc) => (
            <button key={inc.id} onClick={() => onViewIncident(inc)} className="w-full px-4 py-2.5 flex items-center gap-3 border-b border-amber-100 last:border-0 text-left">
              <SevDot severity={inc.severity} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-800 truncate">{inc.incident_type}</div>
                <div className="text-xs text-slate-500">{inc.location}</div>
              </div>
              <div className="text-xs text-amber-600">{formatDate(inc.created_at)}</div>
            </button>
          ))}
        </div>
      )}

      {/* Recent */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Recent Activity</h3>
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">No activity yet — log an incident or observation to get started.</div>
        ) : recent.map((item, i) => (
          <button
            key={item.id}
            onClick={() => item._type === "incident" ? onViewIncident(item) : null}
            className={`w-full px-4 py-2.5 flex items-center gap-3 text-left ${i < recent.length - 1 ? "border-b border-slate-50" : ""}`}
          >
            {item._type === "incident"
              ? <SevDot severity={item.severity} />
              : <div className="w-2.5 h-2.5 rounded-full bg-sky-400 flex-shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-800 truncate">
                {item._type === "incident" ? item.incident_type : item.observation_type}
              </div>
              <div className="text-xs text-slate-400">{item.location} — {item._type === "incident" ? item.reporter_name : item.observer_name}</div>
            </div>
            <div className="text-xs text-slate-400 flex-shrink-0">{formatDate(item.created_at)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Incident Report Form ─── */
function ReportScreen({ onSubmit }) {
  const now = new Date();
  const [form, setForm] = useState({
    incident_date: formatDateInput(now),
    incident_time: formatTimeInput(now),
    location: "",
    reporter_name: "",
    incident_type: "",
    severity: "",
    description: "",
    immediate_action: "",
    follow_up_needed: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit = form.location && form.reporter_name && form.incident_type && form.severity && form.description;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      ...form,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      created_at: new Date().toISOString(),
      follow_up_completed: false,
      follow_up_notes: "",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-lg font-semibold text-slate-800">Incident Logged</div>
        <div className="text-sm text-slate-500">Saved with timestamp</div>
        <button onClick={() => {
          setSubmitted(false);
          const n = new Date();
          setForm({ incident_date: formatDateInput(n), incident_time: formatTimeInput(n), location: "", reporter_name: "", incident_type: "", severity: "", description: "", immediate_action: "", follow_up_needed: false });
        }} className="mt-4 px-5 py-2.5 bg-slate-800 text-white text-sm rounded-lg font-medium">
          Log Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Date/time row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
          <input type="date" value={form.incident_date} onChange={e => set("incident_date", e.target.value)} className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</label>
          <input type="time" value={form.incident_time} onChange={e => set("incident_time", e.target.value)} className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location *</label>
        <input type="text" value={form.location} onChange={e => set("location", e.target.value)} placeholder="Route #, address, or area" className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-300" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reporter Name *</label>
        <input type="text" value={form.reporter_name} onChange={e => set("reporter_name", e.target.value)} placeholder="Who reported this?" className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-300" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Incident Type *</label>
        <div className="grid grid-cols-2 gap-1.5">
          {INCIDENT_TYPES.map(t => (
            <button key={t.label} onClick={() => set("incident_type", t.label)}
              className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${form.incident_type === t.label ? "border-orange-400 bg-orange-50 text-orange-700 font-medium" : "border-slate-200 bg-white text-slate-600"}`}>
              <span className="mr-1">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Severity *</label>
        <div className="grid grid-cols-3 gap-2">
          {SEVERITY_LEVELS.map(s => (
            <button key={s.level} onClick={() => set("severity", s.level)}
              className={`rounded-xl p-3 border-2 text-center transition-all ${form.severity === s.level ? `${s.ring} ring-2 border-transparent ${s.bgLight}` : "border-slate-200 bg-white"}`}>
              <div className={`w-4 h-4 rounded-full ${s.bg} mx-auto mb-1.5`} />
              <div className="text-xs font-semibold text-slate-700">{s.label}</div>
              <div className="text-xs text-slate-400 leading-tight mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label>
        <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="What happened? (2-3 sentences)" className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Immediate Action Taken</label>
        <input type="text" value={form.immediate_action} onChange={e => set("immediate_action", e.target.value)} placeholder="What was done right away?" className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-300" />
      </div>

      <label className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-3 py-3 cursor-pointer">
        <input type="checkbox" checked={form.follow_up_needed} onChange={e => set("follow_up_needed", e.target.checked)} className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 w-4 h-4" />
        <span className="text-sm text-slate-700">Follow-up needed</span>
      </label>

      <button onClick={handleSubmit} disabled={!canSubmit}
        className={`w-full py-3 font-semibold rounded-xl text-sm transition-colors shadow-sm ${canSubmit ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
        Log Incident
      </button>
    </div>
  );
}

/* ── Observation Form ─── */
function ObservationScreen({ onSubmit }) {
  const [form, setForm] = useState({ observation_type: "", location: "", observer_name: "", description: "", corrective_action: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.observation_type && form.location && form.observer_name && form.description;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      ...form,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      created_at: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-lg font-semibold text-slate-800">Observation Logged</div>
        <button onClick={() => { setSubmitted(false); setForm({ observation_type: "", location: "", observer_name: "", description: "", corrective_action: "" }); }}
          className="mt-4 px-5 py-2.5 bg-slate-800 text-white text-sm rounded-lg font-medium">Log Another</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-700 leading-relaxed">
        Log what you see — good or bad. Near-miss and observation data prevents incidents before they happen.
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">What did you observe? *</label>
        <div className="space-y-2">
          {OBS_TYPES.map(t => (
            <button key={t.label} onClick={() => set("observation_type", t.label)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${form.observation_type === t.label ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"}`}>
              <div className="text-sm font-medium text-slate-700"><span className="mr-2">{t.icon}</span>{t.label}</div>
              <div className="text-xs text-slate-400 mt-0.5 ml-7">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Observer Name *</label>
        <input type="text" value={form.observer_name} onChange={e => set("observer_name", e.target.value)} placeholder="Your name" className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location *</label>
        <input type="text" value={form.location} onChange={e => set("location", e.target.value)} placeholder="Where was this observed?" className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label>
        <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="What did you see?" className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300 resize-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Corrective Action Recommended</label>
        <input type="text" value={form.corrective_action} onChange={e => set("corrective_action", e.target.value)} placeholder="What should be done?" className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300" />
      </div>

      <button onClick={handleSubmit} disabled={!canSubmit}
        className={`w-full py-3 font-semibold rounded-xl text-sm transition-colors shadow-sm ${canSubmit ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
        Log Observation
      </button>
    </div>
  );
}

/* ── Incident Detail ─── */
function IncidentDetail({ incident, onBack, onUpdate }) {
  const sev = SEVERITY_LEVELS.find(s => s.level === incident.severity);
  const [notes, setNotes] = useState(incident.follow_up_notes || "");

  const markResolved = () => {
    onUpdate({ ...incident, follow_up_completed: true, follow_up_notes: notes, resolved_at: new Date().toISOString() });
    onBack();
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-slate-500 flex items-center gap-1">
        ← Back
      </button>
      <div className={`rounded-xl p-4 border ${sev.border} ${sev.bgLight}`}>
        <div className="flex items-center gap-2 mb-1">
          <SevDot severity={incident.severity} />
          <span className={`text-sm font-semibold ${sev.text}`}>{sev.label}</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">{incident.incident_type}</h3>
        <p className="text-xs text-slate-500 mt-1">{formatDateTime(incident.created_at)}</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-3">
        <Row label="Location" value={incident.location} />
        <Row label="Reporter" value={incident.reporter_name} />
        <Row label="Description" value={incident.description} />
        {incident.immediate_action && <Row label="Immediate Action" value={incident.immediate_action} />}
      </div>

      {incident.follow_up_needed && (
        <div className={`rounded-xl p-4 border ${incident.follow_up_completed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${incident.follow_up_completed ? "text-emerald-700" : "text-amber-700"}`}>
              Follow-up {incident.follow_up_completed ? "✓ Completed" : "Needed"}
            </span>
          </div>
          {!incident.follow_up_completed && (
            <>
              <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Follow-up notes..." className="w-full bg-white rounded-lg border border-amber-200 px-3 py-2 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-300 resize-none mb-2" />
              <button onClick={markResolved} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors">
                Mark Resolved
              </button>
            </>
          )}
          {incident.follow_up_completed && incident.follow_up_notes && (
            <p className="text-sm text-emerald-700">{incident.follow_up_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  );
}

/* ── Export ─── */
function ExportScreen({ incidents, observations }) {
  const generateCSV = (data, type) => {
    if (data.length === 0) return;
    const headers = type === "incidents"
      ? ["Date", "Time", "Location", "Reporter", "Type", "Severity", "Description", "Action Taken", "Follow-up"]
      : ["Date", "Location", "Observer", "Type", "Description", "Corrective Action"];

    const rows = data.map(d => type === "incidents"
      ? [d.incident_date, d.incident_time, d.location, d.reporter_name, d.incident_type, d.severity, d.description, d.immediate_action || "", d.follow_up_needed ? (d.follow_up_completed ? "Resolved" : "Open") : "N/A"]
      : [formatDate(d.created_at), d.location, d.observer_name, d.observation_type, d.description, d.corrective_action || ""]
    );

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fieldsafe-${type}-${formatDateInput(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Export your data as CSV for spreadsheets, reports, or audits.</p>
      <button onClick={() => generateCSV(incidents, "incidents")} disabled={incidents.length === 0}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${incidents.length > 0 ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
        Export Incidents ({incidents.length})
      </button>
      <button onClick={() => generateCSV(observations, "observations")} disabled={observations.length === 0}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${observations.length > 0 ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
        Export Observations ({observations.length})
      </button>
    </div>
  );
}

/* ── Main ─── */
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "report", label: "Report", icon: "🚨" },
  { id: "observe", label: "Observe", icon: "👁️" },
  { id: "export", label: "Export", icon: "📋" },
];

export default function FieldSafe() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState({ incidents: [], observations: [] });
  const [loading, setLoading] = useState(true);
  const [viewIncident, setViewIncident] = useState(null);

  useEffect(() => {
    loadAllData().then(d => { setData(d); setLoading(false); });
  }, []);

  const save = useCallback(async (newData) => {
    setData(newData);
    await saveAllData(newData);
  }, []);

  const addIncident = (inc) => {
    save({ ...data, incidents: [...data.incidents, inc] });
  };

  const addObservation = (obs) => {
    save({ ...data, observations: [...data.observations, obs] });
  };

  const updateIncident = (updated) => {
    const newIncidents = data.incidents.map(i => i.id === updated.id ? updated : i);
    save({ ...data, incidents: newIncidents });
  };

  const handleViewIncident = (inc) => {
    setViewIncident(inc);
    setTab("detail");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-orange-400">◆</span> FieldSafe
          </h1>
          <p className="text-xs text-slate-400">Safety & Compliance Logger</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>

      {/* Tab bar */}
      {tab !== "detail" && (
        <div className="bg-white border-b border-slate-200 flex flex-shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${tab === t.id ? "text-orange-600 border-b-2 border-orange-500" : "text-slate-500"}`}>
              <span className="mr-1">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {tab === "dashboard" && <DashboardScreen incidents={data.incidents} observations={data.observations} onViewIncident={handleViewIncident} />}
        {tab === "report" && <ReportScreen onSubmit={addIncident} />}
        {tab === "observe" && <ObservationScreen onSubmit={addObservation} />}
        {tab === "export" && <ExportScreen incidents={data.incidents} observations={data.observations} />}
        {tab === "detail" && viewIncident && (
          <IncidentDetail
            incident={data.incidents.find(i => i.id === viewIncident.id) || viewIncident}
            onBack={() => { setViewIncident(null); setTab("dashboard"); }}
            onUpdate={updateIncident}
          />
        )}
      </div>
    </div>
  );
}
