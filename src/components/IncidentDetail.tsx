"use client";

import { useState } from "react";
import { Incident } from "@/lib/types";
import { SEVERITY_LEVELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import SevDot from "./SevDot";

interface Props {
  incident: Incident;
  onBack: () => void;
  onUpdate: (incident: Incident) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  );
}

export default function IncidentDetail({ incident, onBack, onUpdate }: Props) {
  const sev = SEVERITY_LEVELS.find((s) => s.level === incident.severity)!;
  const [notes, setNotes] = useState(incident.follow_up_notes || "");

  const markResolved = () => {
    onUpdate({
      ...incident,
      follow_up_completed: true,
      follow_up_notes: notes,
      resolved_at: new Date().toISOString(),
    });
    onBack();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-slate-500 flex items-center gap-1"
      >
        ← Back
      </button>
      <div className={`rounded-xl p-4 border ${sev.border} ${sev.bgLight}`}>
        <div className="flex items-center gap-2 mb-1">
          <SevDot severity={incident.severity} />
          <span className={`text-sm font-semibold ${sev.text}`}>
            {sev.label}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          {incident.incident_type}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {formatDateTime(incident.created_at)}
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-3">
        <Row label="Location" value={incident.location} />
        <Row label="Reporter" value={incident.reporter_name} />
        <Row label="Description" value={incident.description} />
        {incident.immediate_action && (
          <Row label="Immediate Action" value={incident.immediate_action} />
        )}
      </div>

      {incident.follow_up_needed && (
        <div
          className={`rounded-xl p-4 border ${incident.follow_up_completed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${incident.follow_up_completed ? "text-emerald-700" : "text-amber-700"}`}
            >
              Follow-up{" "}
              {incident.follow_up_completed ? "✓ Completed" : "Needed"}
            </span>
          </div>
          {!incident.follow_up_completed && (
            <>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Follow-up notes..."
                className="w-full bg-white rounded-lg border border-amber-200 px-3 py-2 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-300 resize-none mb-2"
              />
              <button
                onClick={markResolved}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Mark Resolved
              </button>
            </>
          )}
          {incident.follow_up_completed && incident.follow_up_notes && (
            <p className="text-sm text-emerald-700">
              {incident.follow_up_notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
