import { render, screen } from "@testing-library/react";
import { WeekCalendar } from "../src/week_calendar/week_calendar";
import { CalendarThemeProvider } from "../src/theme";

const anchor = new Date(2026, 2, 11, 10, 20);

function renderWeek(props: { stickyHeader?: boolean } = {}) {
  return render(
    <CalendarThemeProvider theme="light">
      <WeekCalendar events={[]} startOfWeek={anchor} now={anchor} {...props} />
    </CalendarThemeProvider>,
  );
}

/**
 * The hour labels are laid out in a flex column next to a 1440px tall grid
 * (1px per minute). Each hour cell must keep its full 60px so that every label
 * stays aligned with the hour line it belongs to.
 *
 * When the sidebar is placed in a shorter flex parent (for example the sticky
 * header layout, where the scroll container is smaller than 1440px), the
 * default `flex-shrink: 1` lets the cells collapse. The labels then drift out
 * of the visible range and stop matching the grid rows.
 */
describe("WeekCalendar time sidebar", () => {
  const hours = [
    "1 AM",
    "6 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "6 PM",
    "11 PM",
  ] as const;

  it("renders every hour label exactly once", () => {
    renderWeek();

    for (const hour of hours) {
      expect(screen.getByText(hour)).toBeVisible();
    }

    // 12 AM is not rendered; the sidebar starts at 1 AM and ends at 11 PM.
    expect(screen.queryByText("12 AM")).toBeNull();
    expect(screen.getAllByText(/^\d{1,2} (AM|PM)$/)).toHaveLength(23);
  });

  it.each([
    ["default layout", {}],
    ["sticky header layout", { stickyHeader: true }],
  ])("keeps each hour cell at a full 60px in the %s", (_name, props) => {
    const { unmount } = renderWeek(props);

    for (const hour of hours) {
      const cell = screen.getByText(hour).parentElement;
      expect(cell).not.toBeNull();
      // A shrinking cell is what broke label/grid-line alignment.
      expect(cell).toHaveStyle({ height: "60px", flexShrink: "0" });
    }

    unmount();
  });
});
