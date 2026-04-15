"use client";

import { useState } from "react";
import { Incident } from "@/lib/types";
import { INCIDENT_TYPES, SEVERITY_LEVELS } from "@/lib/constants";
import { formatDateInput, formatTimeInput, generateId } from "@/lib/utils";

interface Props {
  onSubmit: (incident: Incident) => void;
}

export default function ReportScreen({ onSubmit }: Props) {
  const now = new Date();
  const [form, setForm] = useState({
    incident_date: formatDateInput(now),
    incident_time: formatTimeInput(now),
    location: "",
    reporter_name: "",
    incident_type: "",
    severity: "" as "" | "minor" | "moderate" | "serious",
    description: "",
    immediate_action: "",
    follow_up_needed: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canSubmit =
    form.location &&
    form.reporter_name &&
    form.incident_type &&
    form.severity &&
    form.description;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      ...form,
      severity: form.severity as "minor" | "moderate" | "serious",
      id: generateId(),
      created_at: new Date().toISOString(),
      follow_up_completed: false,
      follow_up_notes: "",
      resolved_at: null,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="text-lg font-semibold text-slate-800">
          Incident Logged
        </div>
        <div className="text-sm text-slate-500">Saved with timestamp</div>
        <button
          onClick={() => {
            setSubmitted(false);
            const n = new Date();
            setForm({
              incident_date: formatDateInput(n),
              incident_time: formatTimeInput(n),
              location: "",
              reporter_name: "",
              incident_type: "",
              severity: "",
              description: "",
              immediate_action: "",
              follow_up_needed: false,
            });
          }}
          className="mt-4 px-5 py-2.5 bg-slate-800 text-white text-sm rounded-lg font-medium"
        >
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
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Date
          </label>
          <input
            type="date"
            value={form.incident_date}
            onChange={(e) => set("incident_date", e.target.value)}
            className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Time
          </label>
          <input
            type="time"
            value={form.incident_time}
            onChange={(e) => set("incident_time", e.target.value)}
            className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Location *
        </label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="Route #, address, or area"
          className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Reporter Name *
        </label>
        <input
          type="text"
          value={form.reporter_name}
          onChange={(e) => set("reporter_name", e.target.value)}
          placeholder="Who reported this?"
          className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          Incident Type *
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {INCIDENT_TYPES.map((t) => (
            <button
              key={t.label}
              onClick={() => set("incident_type", t.label)}
              className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${form.incident_type === t.label ? "border-orange-400 bg-orange-50 text-orange-700 font-medium" : "border-slate-200 bg-white text-slate-600"}`}
            >
              <span className="mr-1">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          Severity *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SEVERITY_LEVELS.map((s) => (
            <button
              key={s.level}
              onClick={() => set("severity", s.level)}
              className={`rounded-xl p-3 border-2 text-center transition-all ${form.severity === s.level ? `${s.ring} ring-2 border-transparent ${s.bgLight}` : "border-slate-200 bg-white"}`}
            >
              <div className={`w-4 h-4 rounded-full ${s.bg} mx-auto mb-1.5`} />
              <div className="text-xs font-semibold text-slate-700">
                {s.label}
              </div>
              <div className="text-xs text-slate-400 leading-tight mt-0.5">
                {s.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Description *
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What happened? (2-3 sentences)"
          className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-300 resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Immediate Action Taken
        </label>
        <input
          type="text"
          value={form.immediate_action}
          onChange={(e) => set("immediate_action", e.target.value)}
          placeholder="What was done right away?"
          className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <label className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-3 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.follow_up_needed}
          onChange={(e) => set("follow_up_needed", e.target.checked)}
          className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 w-4 h-4"
        />
        <span className="text-sm text-slate-700">Follow-up needed</span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3 font-semibold rounded-xl text-sm transition-colors shadow-sm ${canSubmit ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
      >
        Log Incident
      </button>
    </div>
  );
}
