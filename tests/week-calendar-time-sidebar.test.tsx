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
 * The grid is 1440px tall at 1px per minute, so the 1px line for a given hour
 * is drawn from `hour * 60px`. Each label is absolutely positioned on the
 * middle of that line (+0.5px) and centred on it with translateY(-50%), which
 * keeps it aligned regardless of font metrics or the surrounding flex parent.
 *
 * Stacking fixed-height cells instead made the labels depend on the column
 * never shrinking, and left them a couple of pixels above their lines.
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
  ])("centres each hour label on its grid line in the %s", (_name, props) => {
    const { unmount } = renderWeek(props);

    const expectedTop: Record<string, string> = {
      "1 AM": "60.5px",
      "6 AM": "360.5px",
      "11 AM": "660.5px",
      "12 PM": "720.5px",
      "1 PM": "780.5px",
      "6 PM": "1080.5px",
      "11 PM": "1380.5px",
    };

    for (const hour of hours) {
      const label = screen.getByText(hour).parentElement;
      expect(label).not.toBeNull();
      expect(label).toHaveStyle({
        position: "absolute",
        top: expectedTop[hour],
        // centring on the line is what keeps the label aligned with it
        transform: "translateY(-50%)",
      });
    }

    unmount();
  });
});
