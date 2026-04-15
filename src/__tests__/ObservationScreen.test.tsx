import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ObservationScreen from "@/components/ObservationScreen";

describe("ObservationScreen", () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it("renders the info banner and all observation types", () => {
    render(<ObservationScreen onSubmit={onSubmit} />);

    expect(screen.getByText(/Log what you see/)).toBeInTheDocument();
    expect(screen.getByText("Unsafe condition")).toBeInTheDocument();
    expect(screen.getByText("Unsafe behavior")).toBeInTheDocument();
    expect(screen.getByText("Positive observation")).toBeInTheDocument();
    expect(screen.getByText("Hazard identified")).toBeInTheDocument();
  });

  it("submit button is disabled when required fields are empty", () => {
    render(<ObservationScreen onSubmit={onSubmit} />);
    expect(screen.getByText("Log Observation")).toBeDisabled();
  });

  it("calls onSubmit with correct data", async () => {
    const user = userEvent.setup();
    render(<ObservationScreen onSubmit={onSubmit} />);

    await user.click(screen.getByText("Unsafe condition"));
    await user.type(screen.getByPlaceholderText(/Your name/), "Cameron");
    await user.type(screen.getByPlaceholderText(/Where was this/), "Parking Lot C");
    await user.type(screen.getByPlaceholderText(/What did you see/), "Broken handrail on stairwell.");
    await user.type(screen.getByPlaceholderText(/What should be done/), "Replace handrail");

    await user.click(screen.getByText("Log Observation"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.observation_type).toBe("Unsafe condition");
    expect(submitted.observer_name).toBe("Cameron");
    expect(submitted.location).toBe("Parking Lot C");
    expect(submitted.description).toBe("Broken handrail on stairwell.");
    expect(submitted.corrective_action).toBe("Replace handrail");
    expect(submitted.id).toBeTruthy();
    expect(submitted.created_at).toBeTruthy();
  });

  it("shows success screen after submission", async () => {
    const user = userEvent.setup();
    render(<ObservationScreen onSubmit={onSubmit} />);

    await user.click(screen.getByText("Positive observation"));
    await user.type(screen.getByPlaceholderText(/Your name/), "Cameron");
    await user.type(screen.getByPlaceholderText(/Where was this/), "Field Site A");
    await user.type(screen.getByPlaceholderText(/What did you see/), "Worker wearing correct PPE.");

    await user.click(screen.getByText("Log Observation"));

    expect(screen.getByText("Observation Logged")).toBeInTheDocument();
    expect(screen.getByText("Log Another")).toBeInTheDocument();
  });

  it("resets form when 'Log Another' is clicked", async () => {
    const user = userEvent.setup();
    render(<ObservationScreen onSubmit={onSubmit} />);

    await user.click(screen.getByText("Hazard identified"));
    await user.type(screen.getByPlaceholderText(/Your name/), "Cameron");
    await user.type(screen.getByPlaceholderText(/Where was this/), "Building B");
    await user.type(screen.getByPlaceholderText(/What did you see/), "Loose wiring.");

    await user.click(screen.getByText("Log Observation"));
    await user.click(screen.getByText("Log Another"));

    expect(screen.getByPlaceholderText(/Your name/)).toHaveValue("");
    expect(screen.getByPlaceholderText(/Where was this/)).toHaveValue("");
    expect(screen.getByText("Log Observation")).toBeDisabled();
  });
});
