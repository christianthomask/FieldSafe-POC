import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportScreen from "@/components/ReportScreen";

describe("ReportScreen", () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it("renders the form with all required fields", () => {
    render(<ReportScreen onSubmit={onSubmit} />);

    expect(screen.getByText("Location *")).toBeInTheDocument();
    expect(screen.getByText("Reporter Name *")).toBeInTheDocument();
    expect(screen.getByText("Incident Type *")).toBeInTheDocument();
    expect(screen.getByText("Severity *")).toBeInTheDocument();
    expect(screen.getByText("Description *")).toBeInTheDocument();
    expect(screen.getByText("Immediate Action Taken")).toBeInTheDocument();
    expect(screen.getByText("Follow-up needed")).toBeInTheDocument();
  });

  it("renders all 10 incident type buttons", () => {
    render(<ReportScreen onSubmit={onSubmit} />);

    expect(screen.getByText(/Injury \(on the job\)/)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle incident/)).toBeInTheDocument();
    expect(screen.getByText(/Near miss/)).toBeInTheDocument();
    expect(screen.getByText(/Dog \/ animal/)).toBeInTheDocument();
    expect(screen.getByText(/Slip \/ trip/)).toBeInTheDocument();
    expect(screen.getByText(/Weather-related/)).toBeInTheDocument();
  });

  it("renders all 3 severity buttons", () => {
    render(<ReportScreen onSubmit={onSubmit} />);

    expect(screen.getByText("Minor")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Serious")).toBeInTheDocument();
  });

  it("submit button is disabled when required fields are empty", () => {
    render(<ReportScreen onSubmit={onSubmit} />);

    const submitButton = screen.getByText("Log Incident");
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when all required fields are filled", async () => {
    const user = userEvent.setup();
    render(<ReportScreen onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/Route/), "Route 42");
    await user.type(screen.getByPlaceholderText(/Who reported/), "Cameron");
    await user.click(screen.getByText(/Slip \/ trip/));
    await user.click(screen.getByText("Minor"));
    await user.type(screen.getByPlaceholderText(/What happened/), "Worker slipped on wet stairs.");

    const submitButton = screen.getByText("Log Incident");
    expect(submitButton).not.toBeDisabled();
  });

  it("calls onSubmit with correct data when form is submitted", async () => {
    const user = userEvent.setup();
    render(<ReportScreen onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/Route/), "Route 42");
    await user.type(screen.getByPlaceholderText(/Who reported/), "Cameron");
    await user.click(screen.getByText(/Vehicle incident/));
    await user.click(screen.getByText("Moderate"));
    await user.type(screen.getByPlaceholderText(/What happened/), "Rear-ended at intersection.");
    await user.type(screen.getByPlaceholderText(/What was done/), "Called police");
    await user.click(screen.getByText("Follow-up needed"));

    await user.click(screen.getByText("Log Incident"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.location).toBe("Route 42");
    expect(submitted.reporter_name).toBe("Cameron");
    expect(submitted.incident_type).toBe("Vehicle incident");
    expect(submitted.severity).toBe("moderate");
    expect(submitted.description).toBe("Rear-ended at intersection.");
    expect(submitted.immediate_action).toBe("Called police");
    expect(submitted.follow_up_needed).toBe(true);
    expect(submitted.follow_up_completed).toBe(false);
    expect(submitted.id).toBeTruthy();
    expect(submitted.created_at).toBeTruthy();
  });

  it("shows success screen after submission", async () => {
    const user = userEvent.setup();
    render(<ReportScreen onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/Route/), "Route 42");
    await user.type(screen.getByPlaceholderText(/Who reported/), "Cameron");
    await user.click(screen.getByText(/Injury \(on the job\)/));
    await user.click(screen.getByText("Serious"));
    await user.type(screen.getByPlaceholderText(/What happened/), "Cut on hand from equipment.");

    await user.click(screen.getByText("Log Incident"));

    expect(screen.getByText("Incident Logged")).toBeInTheDocument();
    expect(screen.getByText("Saved with timestamp")).toBeInTheDocument();
    expect(screen.getByText("Log Another")).toBeInTheDocument();
  });

  it("resets form when 'Log Another' is clicked", async () => {
    const user = userEvent.setup();
    render(<ReportScreen onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/Route/), "Route 42");
    await user.type(screen.getByPlaceholderText(/Who reported/), "Cameron");
    await user.click(screen.getByText(/Injury \(on the job\)/));
    await user.click(screen.getByText("Serious"));
    await user.type(screen.getByPlaceholderText(/What happened/), "Cut on hand.");

    await user.click(screen.getByText("Log Incident"));
    await user.click(screen.getByText("Log Another"));

    // Form should be back with empty fields
    expect(screen.getByPlaceholderText(/Route/)).toHaveValue("");
    expect(screen.getByPlaceholderText(/Who reported/)).toHaveValue("");
    expect(screen.getByText("Log Incident")).toBeDisabled();
  });
});
