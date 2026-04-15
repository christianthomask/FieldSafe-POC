"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { Incident, Observation, AppData } from "@/lib/types";
import { TABS } from "@/lib/constants";
import { saveAllData } from "@/lib/storage";
import DashboardScreen from "./DashboardScreen";
import ReportScreen from "./ReportScreen";
import ObservationScreen from "./ObservationScreen";
import ExportScreen from "./ExportScreen";
import IncidentDetail from "./IncidentDetail";
import InstallPrompt from "./InstallPrompt";

type TabId = (typeof TABS)[number]["id"] | "detail";

const STORAGE_KEY = "fieldsafe-data";
const emptyData: AppData = { incidents: [], observations: [] };

// Cache the parsed snapshot so useSyncExternalStore gets a stable reference.
// Only re-parse when the raw localStorage string actually changes.
let cachedRaw: string | null = null;
let cachedData: AppData = emptyData;

function getSnapshot(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedData = raw ? JSON.parse(raw) : emptyData;
    }
  } catch {
    // first load or corrupted
  }
  return cachedData;
}

function getServerSnapshot(): AppData {
  return emptyData;
}

let listeners: Array<() => void> = [];
function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function notifyListeners() {
  // Invalidate cache so next getSnapshot() re-parses
  cachedRaw = null;
  listeners.forEach((l) => l());
}

export default function FieldSafe() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [viewIncident, setViewIncident] = useState<Incident | null>(null);

  const save = useCallback((newData: AppData) => {
    saveAllData(newData);
    notifyListeners();
  }, []);

  const addIncident = (inc: Incident) => {
    save({ ...data, incidents: [...data.incidents, inc] });
  };

  const addObservation = (obs: Observation) => {
    save({ ...data, observations: [...data.observations, obs] });
  };

  const updateIncident = (updated: Incident) => {
    const newIncidents = data.incidents.map((i) =>
      i.id === updated.id ? updated : i
    );
    save({ ...data, incidents: newIncidents });
  };

  const handleViewIncident = (inc: Incident) => {
    setViewIncident(inc);
    setTab("detail");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <InstallPrompt />
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-orange-400">◆</span> FieldSafe
          </h1>
          <p className="text-xs text-slate-400">
            Safety &amp; Compliance Logger
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      {tab !== "detail" && (
        <div className="bg-white border-b border-slate-200 flex flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${tab === t.id ? "text-orange-600 border-b-2 border-orange-500" : "text-slate-500"}`}
            >
              <span className="mr-1">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {tab === "dashboard" && (
          <DashboardScreen
            incidents={data.incidents}
            observations={data.observations}
            onViewIncident={handleViewIncident}
          />
        )}
        {tab === "report" && <ReportScreen onSubmit={addIncident} />}
        {tab === "observe" && <ObservationScreen onSubmit={addObservation} />}
        {tab === "export" && (
          <ExportScreen
            incidents={data.incidents}
            observations={data.observations}
          />
        )}
        {tab === "detail" && viewIncident && (
          <IncidentDetail
            incident={
              data.incidents.find((i) => i.id === viewIncident.id) ||
              viewIncident
            }
            onBack={() => {
              setViewIncident(null);
              setTab("dashboard");
            }}
            onUpdate={updateIncident}
          />
        )}
      </div>
    </div>
  );
}
