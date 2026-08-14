import { render, screen } from "@testing-library/react";
import { CalendarThemeProvider } from "../src/theme";
import { CalendarNav } from "../src/nav/calendar_nav";

describe("CalendarNav", () => {
  it("shows the complete week number", () => {
    render(
      <CalendarThemeProvider theme="light">
        <CalendarNav type="week" time={new Date(2026, 2, 11)} />
      </CalendarThemeProvider>,
    );

    expect(screen.getByText("Week 11")).toBeVisible();
    expect(
      screen.getByText("Week 11").closest(".MuiChip-root"),
    ).not.toHaveStyle({
      width: "72px",
    });
  });
});
