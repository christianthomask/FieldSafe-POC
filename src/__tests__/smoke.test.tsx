/**
 * Smoke Test
 *
 * Verifies the app boots, renders, and all primary screens are reachable.
 * If this test fails, the app is not demoable.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FieldSafe from "@/components/FieldSafe";

beforeEach(() => {
  localStorage.clear();
});

describe("Smoke test", () => {
  it("renders the app header and branding", () => {
    render(<FieldSafe />);

    expect(screen.getByText("FieldSafe")).toBeInTheDocument();
    expect(screen.getByText("Safety & Compliance Logger")).toBeInTheDocument();
  });

  it("renders all four navigation tabs", () => {
    render(<FieldSafe />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Report")).toBeInTheDocument();
    expect(screen.getByText("Observe")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("defaults to the Dashboard tab", () => {
    render(<FieldSafe />);

    // Dashboard content should be visible
    expect(screen.getByText("6-Month Trend")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("This Mo.")).toBeInTheDocument();
    expect(screen.getByText("Follow-ups")).toBeInTheDocument();
    expect(screen.getByText("Serious")).toBeInTheDocument();
    expect(screen.getByText("Obs. Total")).toBeInTheDocument();
  });

  it("navigates to Report tab and shows form", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    await user.click(screen.getByText("Report"));

    expect(screen.getByText("Location *")).toBeInTheDocument();
    expect(screen.getByText("Reporter Name *")).toBeInTheDocument();
    expect(screen.getByText("Incident Type *")).toBeInTheDocument();
    expect(screen.getByText("Severity *")).toBeInTheDocument();
    expect(screen.getByText("Description *")).toBeInTheDocument();
    expect(screen.getByText("Log Incident")).toBeInTheDocument();
  });

  it("navigates to Observe tab and shows form", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    await user.click(screen.getByText("Observe"));

    expect(screen.getByText(/Log what you see/)).toBeInTheDocument();
    expect(screen.getByText("Unsafe condition")).toBeInTheDocument();
    expect(screen.getByText("Positive observation")).toBeInTheDocument();
    expect(screen.getByText("Log Observation")).toBeInTheDocument();
  });

  it("navigates to Export tab and shows export buttons", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    await user.click(screen.getByText("Export"));

    expect(screen.getByText(/Export your data as CSV/)).toBeInTheDocument();
    expect(screen.getByText("Export Incidents (0)")).toBeInTheDocument();
    expect(screen.getByText("Export Observations (0)")).toBeInTheDocument();
  });

  it("can navigate between all tabs without errors", async () => {
    const user = userEvent.setup();
    render(<FieldSafe />);

    // Dashboard -> Report -> Observe -> Export -> Dashboard
    await user.click(screen.getByText("Report"));
    expect(screen.getByText("Log Incident")).toBeInTheDocument();

    await user.click(screen.getByText("Observe"));
    expect(screen.getByText("Log Observation")).toBeInTheDocument();

    await user.click(screen.getByText("Export"));
    expect(screen.getByText(/Export your data as CSV/)).toBeInTheDocument();

    await user.click(screen.getByText("Dashboard"));
    expect(screen.getByText("6-Month Trend")).toBeInTheDocument();
  });

  it("displays today's date in the header", () => {
    render(<FieldSafe />);

    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    expect(screen.getByText(today)).toBeInTheDocument();
  });
});
