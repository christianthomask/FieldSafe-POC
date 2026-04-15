"use client";

import { Incident, Observation } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import SevDot from "./SevDot";

interface Props {
  incidents: Incident[];
  observations: Observation[];
  onViewIncident: (inc: Incident) => void;
}

export default function DashboardScreen({
  incidents,
  observations,
  onViewIncident,
}: Props) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthIncidents = incidents.filter((i) => {
    const d = new Date(i.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const openFollowups = incidents.filter(
    (i) => i.follow_up_needed && !i.follow_up_completed
  );
  const seriousThisMonth = thisMonthIncidents.filter(
    (i) => i.severity === "serious"
  ).length;
  const totalObs = observations.length;

  // Last 6 months data
  const monthBuckets: {
    label: string;
    count: number;
    hasSerious: boolean;
  }[] = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(thisYear, thisMonth - m, 1);
    const mo = d.getMonth();
    const yr = d.getFullYear();
    const count = incidents.filter((i) => {
      const id = new Date(i.created_at);
      return id.getMonth() === mo && id.getFullYear() === yr;
    }).length;
    monthBuckets.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      count,
      hasSerious: incidents.some((i) => {
        const id = new Date(i.created_at);
        return (
          id.getMonth() === mo &&
          id.getFullYear() === yr &&
          i.severity === "serious"
        );
      }),
    });
  }
  const maxCount = Math.max(...monthBuckets.map((b) => b.count), 1);

  // Recent activity (combined, sorted by date)
  const recent = [
    ...incidents.map((i) => ({ ...i, _type: "incident" as const })),
    ...observations.map((o) => ({ ...o, _type: "observation" as const })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            val: thisMonthIncidents.length,
            label: "This Mo.",
            color: "text-slate-800",
          },
          {
            val: openFollowups.length,
            label: "Follow-ups",
            color:
              openFollowups.length > 0 ? "text-amber-600" : "text-slate-800",
          },
          {
            val: seriousThisMonth,
            label: "Serious",
            color: seriousThisMonth > 0 ? "text-red-600" : "text-emerald-600",
          },
          { val: totalObs, label: "Obs. Total", color: "text-sky-600" },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center"
          >
            <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          6-Month Trend
        </h3>
        <div className="flex items-end gap-2" style={{ height: "90px" }}>
          {monthBuckets.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full flex justify-center"
                style={{ height: "70px" }}
              >
                <div className="w-full max-w-8 flex flex-col justify-end">
                  <div
                    className={`w-full rounded-t ${b.hasSerious ? "bg-amber-400" : "bg-sky-400"}`}
                    style={{
                      height: `${Math.max((b.count / maxCount) * 100, b.count > 0 ? 8 : 0)}%`,
                      minHeight: b.count > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-1">{b.label}</div>
              <div className="text-xs font-medium text-slate-600">
                {b.count}
              </div>
            </div>
          ))}
        </div>
        {incidents.length === 0 && (
          <p className="text-xs text-slate-400 text-center mt-2">
            Log your first incident to see trends
          </p>
        )}
      </div>

      {/* Open follow-ups */}
      {openFollowups.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-amber-200 bg-amber-100/50">
            <h3 className="text-xs font-semibold text-amber-800">
              Open Follow-ups ({openFollowups.length})
            </h3>
          </div>
          {openFollowups.slice(0, 4).map((inc) => (
            <button
              key={inc.id}
              onClick={() => onViewIncident(inc)}
              className="w-full px-4 py-2.5 flex items-center gap-3 border-b border-amber-100 last:border-0 text-left"
            >
              <SevDot severity={inc.severity} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-800 truncate">
                  {inc.incident_type}
                </div>
                <div className="text-xs text-slate-500">{inc.location}</div>
              </div>
              <div className="text-xs text-amber-600">
                {formatDate(inc.created_at)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Recent */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">
            Recent Activity
          </h3>
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            No activity yet — log an incident or observation to get started.
          </div>
        ) : (
          recent.map((item, i) => (
            <button
              key={item.id}
              onClick={() =>
                item._type === "incident"
                  ? onViewIncident(item as Incident)
                  : undefined
              }
              className={`w-full px-4 py-2.5 flex items-center gap-3 text-left ${i < recent.length - 1 ? "border-b border-slate-50" : ""}`}
            >
              {item._type === "incident" ? (
                <SevDot severity={(item as Incident).severity} />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-800 truncate">
                  {item._type === "incident"
                    ? (item as Incident).incident_type
                    : (item as Observation).observation_type}
                </div>
                <div className="text-xs text-slate-400">
                  {item.location} —{" "}
                  {item._type === "incident"
                    ? (item as Incident).reporter_name
                    : (item as Observation).observer_name}
                </div>
              </div>
              <div className="text-xs text-slate-400 flex-shrink-0">
                {formatDate(item.created_at)}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
