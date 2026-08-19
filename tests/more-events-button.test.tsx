import { render, screen } from "@testing-library/react";
import { addDays, endOfDay, startOfDay, startOfWeek } from "date-fns";
import { MonthCalendar } from "../src/month_calendar/month_calendar";
import { CalendarThemeProvider } from "../src/theme";
import type { CalendarEvent } from "../src/types";
import { WeekCalendar } from "../src/week_calendar/week_calendar";

const anchor = new Date(2026, 2, 11, 10, 20);
const week = startOfWeek(anchor, { weekStartsOn: 1 });

/**
 * Enough all-day events on a single day to overflow both the week calendar's
 * collapsed all-day row and a month calendar cell.
 */
function allDayEvents(count: number): CalendarEvent<unknown>[] {
  const day = addDays(week, 2);
  return Array.from({ length: count }, (_, i) => ({
    title: `All day ${i + 1}`,
    start: startOfDay(day),
    end: endOfDay(day),
  }));
}

function renderWeek() {
  return render(
    <CalendarThemeProvider theme="light">
      <WeekCalendar
        events={allDayEvents(10)}
        startOfWeek={anchor}
        now={anchor}
      />
    </CalendarThemeProvider>,
  );
}

function renderMonth() {
  return render(
    <CalendarThemeProvider theme="light">
      <MonthCalendar
        events={allDayEvents(10)}
        startOfMonth={anchor}
        now={anchor}
      />
    </CalendarThemeProvider>,
  );
}

describe("more events button", () => {
  it("labels hidden week calendar events without a leading plus", () => {
    renderWeek();

    // 10 all-day events with 6 visible rows leaves 4 hidden.
    expect(screen.getByText("4 more")).toBeVisible();
    expect(screen.queryByText("+4 more")).toBeNull();
  });

  it("uses the same sizing in the week and the month calendar", () => {
    const sizing = (button: HTMLElement) => {
      const style = getComputedStyle(button);
      return {
        height: style.height,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
      };
    };

    const { unmount } = renderWeek();
    const weekSizing = sizing(
      screen.getByText("4 more").closest("button") as HTMLElement,
    );
    unmount();

    renderMonth();
    const monthSizing = sizing(
      screen.getByText(/\d+ more/).closest("button") as HTMLElement,
    );

    expect(weekSizing).toEqual(monthSizing);
    // A single event row is 16px tall; the button must match it.
    expect(weekSizing.height).toBe("16px");
  });
});
