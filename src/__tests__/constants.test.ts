import {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  OBS_TYPES,
  TABS,
} from "@/lib/constants";

describe("constants", () => {
  describe("INCIDENT_TYPES", () => {
    it("contains 10 incident types", () => {
      expect(INCIDENT_TYPES).toHaveLength(10);
    });

    it("each type has a label and icon", () => {
      INCIDENT_TYPES.forEach((t) => {
        expect(t.label).toBeTruthy();
        expect(t.icon).toBeTruthy();
      });
    });

    it("includes the key field-service types from spec", () => {
      const labels = INCIDENT_TYPES.map((t) => t.label);
      expect(labels).toContain("Injury (on the job)");
      expect(labels).toContain("Vehicle incident");
      expect(labels).toContain("Near miss / close call");
      expect(labels).toContain("Dog / animal encounter");
      expect(labels).toContain("Slip / trip / fall");
    });
  });

  describe("SEVERITY_LEVELS", () => {
    it("contains exactly 3 levels: minor, moderate, serious", () => {
      expect(SEVERITY_LEVELS).toHaveLength(3);
      expect(SEVERITY_LEVELS.map((s) => s.level)).toEqual([
        "minor",
        "moderate",
        "serious",
      ]);
    });

    it("each level has all required display properties", () => {
      SEVERITY_LEVELS.forEach((s) => {
        expect(s.label).toBeTruthy();
        expect(s.desc).toBeTruthy();
        expect(s.bg).toBeTruthy();
        expect(s.bgLight).toBeTruthy();
        expect(s.border).toBeTruthy();
        expect(s.text).toBeTruthy();
        expect(s.ring).toBeTruthy();
      });
    });
  });

  describe("OBS_TYPES", () => {
    it("contains 4 observation types", () => {
      expect(OBS_TYPES).toHaveLength(4);
    });

    it("includes positive observations (spec requirement)", () => {
      const labels = OBS_TYPES.map((t) => t.label);
      expect(labels).toContain("Positive observation");
    });
  });

  describe("TABS", () => {
    it("contains the 4 main navigation tabs", () => {
      expect(TABS).toHaveLength(4);
      expect(TABS.map((t) => t.id)).toEqual([
        "dashboard",
        "report",
        "observe",
        "export",
      ]);
    });
  });
});
