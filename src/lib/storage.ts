import { AppData } from "./types";

const STORAGE_KEY = "fieldsafe-data";

export function loadAllData(): AppData {
  if (typeof window === "undefined") {
    return { incidents: [], observations: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // first load or corrupted data
  }
  return { incidents: [], observations: [] };
}

export function saveAllData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage save failed:", e);
  }
}
