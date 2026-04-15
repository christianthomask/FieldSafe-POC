import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IncidentDetail from "@/components/IncidentDetail";
import { Incident } from "@/lib/types";

const baseIncident: Incident = {
  id: "detail-1",
  incident_date: "2026-03-15",
  incident_time: "14:30",
  location: "Route 42, Maple Ave",
  reporter_name: "Cameron",
  incident_type: "Slip / trip / fall",
  severity: "moderate",
  description: "Worker slipped on icy sidewalk while reading meters.",
  immediate_action: "Applied first aid, sent worker home",
  follow_up_needed: false,
  follow_up_completed: false,
  follow_up_notes: "",
  resolved_at: null,
  created_at: "2026-03-15T14:30:00.000Z",
};

describe("IncidentDetail", () => {
  const onBack = jest.fn();
  const onUpdate = jest.fn();

  beforeEach(() => {
    onBack.mockClear();
    onUpdate.mockClear();
  });

  it("renders incident details correctly", () => {
    render(
      <IncidentDetail incident={baseIncident} onBack={onBack} onUpdate={onUpdate} />
    );

    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Slip / trip / fall")).toBeInTheDocument();
    expect(screen.getByText("Route 42, Maple Ave")).toBeInTheDocument();
    expect(screen.getByText("Cameron")).toBeInTheDocument();
    expect(screen.getByText(/Worker slipped on icy sidewalk/)).toBeInTheDocument();
    expect(screen.getByText("Applied first aid, sent worker home")).toBeInTheDocument();
  });

  it("renders back button and calls onBack when clicked", async () => {
    const user = userEvent.setup();
    render(
      <IncidentDetail incident={baseIncident} onBack={onBack} onUpdate={onUpdate} />
    );

    const backButton = screen.getByText("← Back");
    await user.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("does not show follow-up section when follow_up_needed is false", () => {
    render(
      <IncidentDetail incident={baseIncident} onBack={onBack} onUpdate={onUpdate} />
    );

    expect(screen.queryByText(/Follow-up/)).not.toBeInTheDocument();
  });

  it("shows follow-up section with resolve button when follow-up is needed", () => {
    const incidentWithFollowup: Incident = {
      ...baseIncident,
      follow_up_needed: true,
    };
    render(
      <IncidentDetail incident={incidentWithFollowup} onBack={onBack} onUpdate={onUpdate} />
    );

    expect(screen.getByText("Follow-up Needed")).toBeInTheDocument();
    expect(screen.getByText("Mark Resolved")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Follow-up notes...")).toBeInTheDocument();
  });

  it("calls onUpdate and onBack when resolving a follow-up", async () => {
    const user = userEvent.setup();
    const incidentWithFollowup: Incident = {
      ...baseIncident,
      follow_up_needed: true,
    };
    render(
      <IncidentDetail incident={incidentWithFollowup} onBack={onBack} onUpdate={onUpdate} />
    );

    await user.type(
      screen.getByPlaceholderText("Follow-up notes..."),
      "Worker returned to duty, no further issues."
    );
    await user.click(screen.getByText("Mark Resolved"));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0];
    expect(updated.follow_up_completed).toBe(true);
    expect(updated.follow_up_notes).toBe(
      "Worker returned to duty, no further issues."
    );
    expect(updated.resolved_at).toBeTruthy();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows completed state for already-resolved follow-ups", () => {
    const resolvedIncident: Incident = {
      ...baseIncident,
      follow_up_needed: true,
      follow_up_completed: true,
      follow_up_notes: "All clear, worker is fine.",
      resolved_at: "2026-03-16T10:00:00.000Z",
    };
    render(
      <IncidentDetail incident={resolvedIncident} onBack={onBack} onUpdate={onUpdate} />
    );

    expect(screen.getByText(/Completed/)).toBeInTheDocument();
    expect(screen.getByText("All clear, worker is fine.")).toBeInTheDocument();
    expect(screen.queryByText("Mark Resolved")).not.toBeInTheDocument();
  });

  it("renders correct severity colors for each level", () => {
    for (const severity of ["minor", "moderate", "serious"] as const) {
      const { unmount } = render(
        <IncidentDetail
          incident={{ ...baseIncident, severity }}
          onBack={onBack}
          onUpdate={onUpdate}
        />
      );
      const expectedLabel =
        severity === "minor" ? "Minor" : severity === "moderate" ? "Moderate" : "Serious";
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      unmount();
    }
  });
});
