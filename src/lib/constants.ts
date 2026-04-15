export const INCIDENT_TYPES = [
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
] as const;

export const SEVERITY_LEVELS = [
  {
    level: "minor" as const,
    label: "Minor",
    desc: "First aid, no lost time",
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    border: "border-emerald-400",
    text: "text-emerald-700",
    ring: "ring-emerald-400",
  },
  {
    level: "moderate" as const,
    label: "Moderate",
    desc: "Medical attention needed",
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-700",
    ring: "ring-amber-400",
  },
  {
    level: "serious" as const,
    label: "Serious",
    desc: "OSHA recordable",
    bg: "bg-red-500",
    bgLight: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    ring: "ring-red-400",
  },
] as const;

export const OBS_TYPES = [
  { label: "Unsafe condition", icon: "⚠️", desc: "Broken equipment, missing PPE" },
  { label: "Unsafe behavior", icon: "🚫", desc: "Worker not following protocol" },
  { label: "Positive observation", icon: "✅", desc: "Worker doing something right" },
  { label: "Hazard identified", icon: "🔶", desc: "New hazard at a location" },
] as const;

export const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "report", label: "Report", icon: "🚨" },
  { id: "observe", label: "Observe", icon: "👁️" },
  { id: "export", label: "Export", icon: "📋" },
] as const;
