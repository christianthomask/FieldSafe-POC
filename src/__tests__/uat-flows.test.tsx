/**
 * UAT Integration Tests
 *
 * Simulates the full user flows a safety coordinator would walk through
 * during a demo. Each test exercises the complete FieldSafe component
 * with localStorage persistence, tab navigation, and data flow between screens.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FieldSafe from "@/components/FieldSafe";

// Reset module-level cache between tests
beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("UAT: Incident reporting flow", () => {
  it("logs an incident and it appears on the dashboard", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    // Dashboard should be empty initially
    expect(screen.getByText(/No activity yet/)).toBeInTheDocument();

    // Navigate to Report tab
    await user.click(screen.getByText("Report"));

    // Fill out the incident form
    await user.type(screen.getByPlaceholderText(/Route/), "Route 7, Elm Street");
    await user.type(screen.getByPlaceholderText(/Who reported/), "Cameron");
    await user.click(screen.getByText(/Slip \/ trip/));
    await user.click(screen.getByText("Minor"));
    await user.type(
      screen.getByPlaceholderText(/What happened/),
      "Worker slipped on wet leaves near meter box."
    );
    await user.type(
      screen.getByPlaceholderText(/What was done/),
      "Applied bandage, worker continued shift."
    );

    // Submit
    await user.click(screen.getByText("Log Incident"));
    expect(screen.getByText("Incident Logged")).toBeInTheDocument();

    // Go back to dashboard
    await user.click(screen.getByText("Dashboard"));

    // Incident should appear in recent activity
    expect(screen.getByText("Slip / trip / fall")).toBeInTheDocument();
    expect(screen.getByText(/Route 7/)).toBeInTheDocument();

    // Stats should update
    expect(screen.queryByText(/No activity yet/)).not.toBeInTheDocument();
  });

  it("logs an incident with follow-up, views detail, and resolves it", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    // Navigate to Report
    await user.click(screen.getByText("Report"));

    // Fill and submit with follow-up needed
    await user.type(screen.getByPlaceholderText(/Route/), "Warehouse B");
    await user.type(screen.getByPlaceholderText(/Who reported/), "Mike");
    await user.click(screen.getByText(/Equipment failure/));
    await user.click(screen.getByText("Moderate"));
    await user.type(screen.getByPlaceholderText(/What happened/), "Hydraulic leak on forklift #3.");
    await user.click(screen.getByText("Follow-up needed"));
    await user.click(screen.getByText("Log Incident"));

    // Go to dashboard
    await user.click(screen.getByText("Dashboard"));

    // Should show open follow-up
    expect(screen.getByText(/Open Follow-ups/)).toBeInTheDocument();

    // Click into the incident detail — find the follow-ups container (the outermost wrapper)
    const followupHeader = screen.getByText(/Open Follow-ups/);
    const followupContainer = followupHeader.closest(".bg-amber-50")!;
    const incidentButton = within(followupContainer).getByText("Equipment failure");
    await user.click(incidentButton);

    // Should be on detail screen
    expect(screen.getByText("← Back")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText(/Hydraulic leak/)).toBeInTheDocument();
    expect(screen.getByText("Follow-up Needed")).toBeInTheDocument();

    // Add notes and resolve
    await user.type(
      screen.getByPlaceholderText("Follow-up notes..."),
      "Forklift repaired and inspected. Cleared for use."
    );
    await user.click(screen.getByText("Mark Resolved"));

    // Should return to dashboard with no open follow-ups
    expect(screen.queryByText(/Open Follow-ups/)).not.toBeInTheDocument();
  });
});

describe("UAT: Observation logging flow", () => {
  it("logs an observation and it appears on the dashboard", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    // Navigate to Observe tab
    await user.click(screen.getByText("Observe"));

    expect(screen.getByText(/Log what you see/)).toBeInTheDocument();

    // Fill out observation
    await user.click(screen.getByText("Hazard identified"));
    await user.type(screen.getByPlaceholderText(/Your name/), "Cameron");
    await user.type(screen.getByPlaceholderText(/Where was this/), "Parking Lot D");
    await user.type(
      screen.getByPlaceholderText(/What did you see/),
      "Large pothole near employee entrance."
    );
    await user.type(
      screen.getByPlaceholderText(/What should be done/),
      "Fill pothole, add warning cone."
    );

    // Submit
    await user.click(screen.getByText("Log Observation"));
    expect(screen.getByText("Observation Logged")).toBeInTheDocument();

    // Go to dashboard
    await user.click(screen.getByText("Dashboard"));

    // Observation should appear in recent activity
    expect(screen.getByText("Hazard identified")).toBeInTheDocument();
    expect(screen.getByText(/Parking Lot D/)).toBeInTheDocument();
  });

  it("logs a positive observation", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    await user.click(screen.getByText("Observe"));
    await user.click(screen.getByText("Positive observation"));
    await user.type(screen.getByPlaceholderText(/Your name/), "Cameron");
    await user.type(screen.getByPlaceholderText(/Where was this/), "Field Route 12");
    await user.type(
      screen.getByPlaceholderText(/What did you see/),
      "Worker wearing reflective vest and using proper PPE in rain."
    );

    await user.click(screen.getByText("Log Observation"));
    expect(screen.getByText("Observation Logged")).toBeInTheDocument();
  });
});

describe("UAT: Export flow", () => {
  it("shows disabled buttons when no data exists", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    await user.click(screen.getByText("Export"));

    expect(screen.getByText("Export Incidents (0)")).toBeDisabled();
    expect(screen.getByText("Export Observations (0)")).toBeDisabled();
  });

  it("shows correct counts after logging data", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    // Log an incident
    await user.click(screen.getByText("Report"));
    await user.type(screen.getByPlaceholderText(/Route/), "HQ");
    await user.type(screen.getByPlaceholderText(/Who reported/), "Cameron");
    await user.click(screen.getByText(/Other/));
    await user.click(screen.getByText("Minor"));
    await user.type(screen.getByPlaceholderText(/What happened/), "Minor issue.");
    await user.click(screen.getByText("Log Incident"));

    // Log an observation
    await user.click(screen.getByText("Observe"));
    await user.click(screen.getByText("Unsafe condition"));
    await user.type(screen.getByPlaceholderText(/Your name/), "Cameron");
    await user.type(screen.getByPlaceholderText(/Where was this/), "Lot A");
    await user.type(screen.getByPlaceholderText(/What did you see/), "Spill in hallway.");
    await user.click(screen.getByText("Log Observation"));

    // Check export counts
    await user.click(screen.getByText("Export"));
    expect(screen.getByText("Export Incidents (1)")).not.toBeDisabled();
    expect(screen.getByText("Export Observations (1)")).not.toBeDisabled();
  });
});

describe("UAT: Data persistence", () => {
  it("persists data to localStorage across re-renders", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<FieldSafe />);

    // Log an incident
    await user.click(screen.getByText("Report"));
    await user.type(screen.getByPlaceholderText(/Route/), "Persist Test");
    await user.type(screen.getByPlaceholderText(/Who reported/), "Cameron");
    await user.click(screen.getByText(/Near miss/));
    await user.click(screen.getByText("Minor"));
    await user.type(screen.getByPlaceholderText(/What happened/), "Test persistence.");
    await user.click(screen.getByText("Log Incident"));

    // Verify data is in localStorage
    const raw = localStorage.getItem("fieldsafe-data");
    expect(raw).not.toBeNull();
    const data = JSON.parse(raw!);
    expect(data.incidents).toHaveLength(1);
    expect(data.incidents[0].location).toBe("Persist Test");

    // Unmount and re-render — data should still be there
    unmount();
    render(<FieldSafe />);

    // Dashboard should show the incident
    expect(screen.getByText("Near miss / close call")).toBeInTheDocument();
    expect(screen.getByText(/Persist Test/)).toBeInTheDocument();
  });
});
