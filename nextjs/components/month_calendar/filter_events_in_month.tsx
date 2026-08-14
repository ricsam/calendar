import { areIntervalsOverlapping } from "date-fns";
import { monthCalendarRange } from "../event_grid";
import { StartDay } from "../types";
import { ModifiableEvent } from "../week_calendar/types";

export function filterEventsInMonth<T>(
  events: ModifiableEvent<T>[],
  startDay: StartDay,
  startOfMonth: Date
) {
  const { startOfMonthCalendar, endOfMonthCalendar } = monthCalendarRange(
    startDay,
    startOfMonth
  );
  const eventsInMonth: ModifiableEvent<T>[] = events.filter((event) => {
    return areIntervalsOverlapping(
      { start: startOfMonthCalendar, end: endOfMonthCalendar },
      { start: event.start, end: event.end }
    );
  });
  return eventsInMonth;
}
