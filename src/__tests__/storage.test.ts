import { loadAllData, saveAllData } from "@/lib/storage";
import { AppData } from "@/lib/types";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadAllData", () => {
    it("returns empty arrays when localStorage is empty", () => {
      const data = loadAllData();
      expect(data).toEqual({ incidents: [], observations: [] });
    });

    it("returns parsed data from localStorage", () => {
      const testData: AppData = {
        incidents: [
          {
            id: "test1",
            incident_date: "2026-03-15",
            incident_time: "14:30",
            location: "Route 42",
            reporter_name: "John",
            incident_type: "Slip / trip / fall",
            severity: "minor",
            description: "Slipped on wet surface",
            immediate_action: "Applied ice",
            follow_up_needed: false,
            follow_up_completed: false,
            follow_up_notes: "",
            resolved_at: null,
            created_at: "2026-03-15T14:30:00.000Z",
          },
        ],
        observations: [],
      };
      localStorage.setItem("fieldsafe-data", JSON.stringify(testData));
      const loaded = loadAllData();
      expect(loaded.incidents).toHaveLength(1);
      expect(loaded.incidents[0].id).toBe("test1");
      expect(loaded.incidents[0].location).toBe("Route 42");
    });

    it("returns empty arrays when localStorage contains invalid JSON", () => {
      localStorage.setItem("fieldsafe-data", "not valid json{{{");
      const data = loadAllData();
      expect(data).toEqual({ incidents: [], observations: [] });
    });
  });

  describe("saveAllData", () => {
    it("saves data to localStorage", () => {
      const testData: AppData = {
        incidents: [],
        observations: [
          {
            id: "obs1",
            observation_type: "Unsafe condition",
            location: "Building A",
            observer_name: "Jane",
            description: "Loose railing",
            corrective_action: "Report to maintenance",
            created_at: "2026-03-15T10:00:00.000Z",
          },
        ],
      };
      saveAllData(testData);
      const raw = localStorage.getItem("fieldsafe-data");
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.observations).toHaveLength(1);
      expect(parsed.observations[0].id).toBe("obs1");
    });

    it("overwrites previous data", () => {
      saveAllData({ incidents: [], observations: [] });
      saveAllData({
        incidents: [
          {
            id: "inc1",
            incident_date: "2026-03-15",
            incident_time: "09:00",
            location: "Warehouse",
            reporter_name: "Bob",
            incident_type: "Equipment failure",
            severity: "moderate",
            description: "Forklift brake failure",
            immediate_action: "Shut down forklift",
            follow_up_needed: true,
            follow_up_completed: false,
            follow_up_notes: "",
            resolved_at: null,
            created_at: "2026-03-15T09:00:00.000Z",
          },
        ],
        observations: [],
      });
      const loaded = loadAllData();
      expect(loaded.incidents).toHaveLength(1);
      expect(loaded.incidents[0].severity).toBe("moderate");
    });
  });

  describe("round-trip", () => {
    it("save then load returns identical data", () => {
      const original: AppData = {
        incidents: [
          {
            id: "rt1",
            incident_date: "2026-04-10",
            incident_time: "16:45",
            location: "Field Office",
            reporter_name: "Cameron",
            incident_type: "Near miss / close call",
            severity: "serious",
            description: "Heavy equipment near miss",
            immediate_action: "Cordoned area",
            follow_up_needed: true,
            follow_up_completed: false,
            follow_up_notes: "",
            resolved_at: null,
            created_at: "2026-04-10T16:45:00.000Z",
          },
        ],
        observations: [
          {
            id: "obs-rt1",
            observation_type: "Hazard identified",
            location: "Parking lot B",
            observer_name: "Cameron",
            description: "Pothole near entrance",
            corrective_action: "Schedule repair",
            created_at: "2026-04-10T09:00:00.000Z",
          },
        ],
      };
      saveAllData(original);
      const loaded = loadAllData();
      expect(loaded).toEqual(original);
    });
  });
});
