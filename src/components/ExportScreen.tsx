"use client";

import { Incident, Observation } from "@/lib/types";
import { formatDate, formatDateInput } from "@/lib/utils";

interface Props {
  incidents: Incident[];
  observations: Observation[];
}

export default function ExportScreen({ incidents, observations }: Props) {
  const generateCSV = (
    data: (Incident | Observation)[],
    type: "incidents" | "observations"
  ) => {
    if (data.length === 0) return;
    const headers =
      type === "incidents"
        ? [
            "Date",
            "Time",
            "Location",
            "Reporter",
            "Type",
            "Severity",
            "Description",
            "Action Taken",
            "Follow-up",
          ]
        : [
            "Date",
            "Location",
            "Observer",
            "Type",
            "Description",
            "Corrective Action",
          ];

    const rows = data.map((d) =>
      type === "incidents"
        ? [
            (d as Incident).incident_date,
            (d as Incident).incident_time,
            d.location,
            (d as Incident).reporter_name,
            (d as Incident).incident_type,
            (d as Incident).severity,
            d.description,
            (d as Incident).immediate_action || "",
            (d as Incident).follow_up_needed
              ? (d as Incident).follow_up_completed
                ? "Resolved"
                : "Open"
              : "N/A",
          ]
        : [
            formatDate(d.created_at),
            d.location,
            (d as Observation).observer_name,
            (d as Observation).observation_type,
            d.description,
            (d as Observation).corrective_action || "",
          ]
    );

    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
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
      <p className="text-sm text-slate-500">
        Export your data as CSV for spreadsheets, reports, or audits.
      </p>
      <button
        onClick={() => generateCSV(incidents, "incidents")}
        disabled={incidents.length === 0}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${incidents.length > 0 ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
      >
        Export Incidents ({incidents.length})
      </button>
      <button
        onClick={() => generateCSV(observations, "observations")}
        disabled={observations.length === 0}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${observations.length > 0 ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
      >
        Export Observations ({observations.length})
      </button>
    </div>
  );
}
