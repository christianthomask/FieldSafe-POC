import {
  formatDate,
  formatDateTime,
  formatDateInput,
  formatTimeInput,
  generateId,
} from "@/lib/utils";

describe("formatDate", () => {
  it("formats an ISO string to short month + day", () => {
    const result = formatDate("2026-03-15T14:30:00.000Z");
    expect(result).toMatch(/Mar\s+15/);
  });

  it("handles different months", () => {
    expect(formatDate("2026-01-01T00:00:00.000Z")).toMatch(/Jan/);
    expect(formatDate("2026-12-25T00:00:00.000Z")).toMatch(/Dec/);
  });
});

describe("formatDateTime", () => {
  it("includes date and time with 'at' separator", () => {
    const result = formatDateTime("2026-03-15T14:30:00.000Z");
    expect(result).toContain("at");
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/2026/);
  });
});

describe("formatDateInput", () => {
  it("returns YYYY-MM-DD format", () => {
    const d = new Date("2026-03-15T12:00:00.000Z");
    expect(formatDateInput(d)).toBe("2026-03-15");
  });

  it("zero-pads single digit months and days", () => {
    const d = new Date("2026-01-05T12:00:00.000Z");
    expect(formatDateInput(d)).toBe("2026-01-05");
  });
});

describe("formatTimeInput", () => {
  it("returns HH:MM format", () => {
    const d = new Date("2026-03-15T09:05:00");
    const result = formatTimeInput(d);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
