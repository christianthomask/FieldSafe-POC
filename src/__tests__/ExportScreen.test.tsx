import { render, screen } from "@testing-library/react";
import ExportScreen from "@/components/ExportScreen";
import { Incident, Observation } from "@/lib/types";

describe("ExportScreen", () => {
  const emptyIncidents: Incident[] = [];
  const emptyObservations: Observation[] = [];

  it("renders export description text", () => {
    render(
      <ExportScreen incidents={emptyIncidents} observations={emptyObservations} />
    );
    expect(screen.getByText(/Export your data as CSV/)).toBeInTheDocument();
  });

  it("disables both buttons when there is no data", () => {
    render(
      <ExportScreen incidents={emptyIncidents} observations={emptyObservations} />
    );
    expect(screen.getByText("Export Incidents (0)")).toBeDisabled();
    expect(screen.getByText("Export Observations (0)")).toBeDisabled();
  });

  it("enables incident export button when incidents exist", () => {
    const incidents: Incident[] = [
      {
        id: "1",
        incident_date: "2026-03-15",
        incident_time: "10:00",
        location: "Route 7",
        reporter_name: "Cameron",
        incident_type: "Near miss / close call",
        severity: "minor",
        description: "Close call with dog",
        immediate_action: "",
        follow_up_needed: false,
        follow_up_completed: false,
        follow_up_notes: "",
        resolved_at: null,
        created_at: "2026-03-15T10:00:00.000Z",
      },
    ];
    render(
      <ExportScreen incidents={incidents} observations={emptyObservations} />
    );
    expect(screen.getByText("Export Incidents (1)")).not.toBeDisabled();
    expect(screen.getByText("Export Observations (0)")).toBeDisabled();
  });

  it("enables observation export button when observations exist", () => {
    const observations: Observation[] = [
      {
        id: "1",
        observation_type: "Unsafe condition",
        location: "Office A",
        observer_name: "Cameron",
        description: "Frayed cable",
        corrective_action: "Replace cable",
        created_at: "2026-03-15T10:00:00.000Z",
      },
    ];
    render(
      <ExportScreen incidents={emptyIncidents} observations={observations} />
    );
    expect(screen.getByText("Export Incidents (0)")).toBeDisabled();
    expect(screen.getByText("Export Observations (1)")).not.toBeDisabled();
  });

  it("shows correct counts for multiple items", () => {
    const incidents: Incident[] = Array.from({ length: 5 }, (_, i) => ({
      id: `inc-${i}`,
      incident_date: "2026-03-15",
      incident_time: "10:00",
      location: `Route ${i}`,
      reporter_name: "Cameron",
      incident_type: "Other",
      severity: "minor" as const,
      description: "Test",
      immediate_action: "",
      follow_up_needed: false,
      follow_up_completed: false,
      follow_up_notes: "",
      resolved_at: null,
      created_at: "2026-03-15T10:00:00.000Z",
    }));
    const observations: Observation[] = Array.from({ length: 3 }, (_, i) => ({
      id: `obs-${i}`,
      observation_type: "Hazard identified",
      location: `Area ${i}`,
      observer_name: "Cameron",
      description: "Test",
      corrective_action: "",
      created_at: "2026-03-15T10:00:00.000Z",
    }));
    render(
      <ExportScreen incidents={incidents} observations={observations} />
    );
    expect(screen.getByText("Export Incidents (5)")).not.toBeDisabled();
    expect(screen.getByText("Export Observations (3)")).not.toBeDisabled();
  });
});
