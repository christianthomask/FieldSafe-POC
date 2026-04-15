"use client";

import { useState } from "react";
import { Observation } from "@/lib/types";
import { OBS_TYPES } from "@/lib/constants";
import { generateId } from "@/lib/utils";

interface Props {
  onSubmit: (observation: Observation) => void;
}

export default function ObservationScreen({ onSubmit }: Props) {
  const [form, setForm] = useState({
    observation_type: "",
    location: "",
    observer_name: "",
    description: "",
    corrective_action: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canSubmit =
    form.observation_type &&
    form.location &&
    form.observer_name &&
    form.description;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      ...form,
      id: generateId(),
      created_at: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-sky-600"
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
          Observation Logged
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({
              observation_type: "",
              location: "",
              observer_name: "",
              description: "",
              corrective_action: "",
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
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-700 leading-relaxed">
        Log what you see — good or bad. Near-miss and observation data prevents
        incidents before they happen.
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          What did you observe? *
        </label>
        <div className="space-y-2">
          {OBS_TYPES.map((t) => (
            <button
              key={t.label}
              onClick={() => set("observation_type", t.label)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${form.observation_type === t.label ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"}`}
            >
              <div className="text-sm font-medium text-slate-700">
                <span className="mr-2">{t.icon}</span>
                {t.label}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 ml-7">
                {t.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Observer Name *
        </label>
        <input
          type="text"
          value={form.observer_name}
          onChange={(e) => set("observer_name", e.target.value)}
          placeholder="Your name"
          className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Location *
        </label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="Where was this observed?"
          className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Description *
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What did you see?"
          className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Corrective Action Recommended
        </label>
        <input
          type="text"
          value={form.corrective_action}
          onChange={(e) => set("corrective_action", e.target.value)}
          placeholder="What should be done?"
          className="mt-1 w-full bg-white rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3 font-semibold rounded-xl text-sm transition-colors shadow-sm ${canSubmit ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
      >
        Log Observation
      </button>
    </div>
  );
}
