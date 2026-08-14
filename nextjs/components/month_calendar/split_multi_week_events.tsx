import {
  StartOfWeekOptions,
  addDays,
  differenceInCalendarWeeks,
  endOfWeek,
  max,
  min,
  startOfWeek,
} from "date-fns";
import { StartDay } from "../types";
import { ModifiableEvent } from "../week_calendar/types";
import { monthCalendarRange } from "../event_grid";

/**
 * Events that cross into a new week are split into two events or more.
 * split up events that span multiple weeks into multiple events that span a maximum of 1 week
 * we also trim the events so they perfectly fit into our grid (see step 3)
 */
export function splitMultiWeekEvents<T>(
  eventsInMonth: ModifiableEvent<T>[],
  startDay: StartDay,
  startOfMonth: Date
) {
  const { startOfMonthCalendar, endOfMonthCalendar } = monthCalendarRange(
    startDay,
    startOfMonth
  );
  const weekStartsOn: StartOfWeekOptions["weekStartsOn"] =
    startDay === "monday" ? 1 : 0;
  const events: ModifiableEvent<T>[] = eventsInMonth.flatMap((defaultEvent) => {
    const eventStart = defaultEvent.start;
    const eventEnd = defaultEvent.end;

    const constrainedStart = max([eventStart, startOfMonthCalendar]);
    const constrainedEnd = min([eventEnd, endOfMonthCalendar]);

    let parts: { start: Date; end: Date }[] = [];
    if (
      differenceInCalendarWeeks(constrainedEnd, constrainedStart, {
        weekStartsOn,
      }) > 0
    ) {
      // split event up into multiple events to not overflow a single day
      // an event can't be longer than a day
      const part0 = {
        start: eventStart,
        end: endOfWeek(constrainedStart, {
          weekStartsOn,
        }),
      };
      parts.push(part0);
      while (true) {
        const endOfPrevious = parts[parts.length - 1].end;
        const nextWeekStart = startOfWeek(addDays(endOfPrevious, 1), {
          weekStartsOn,
        });
        const nextWeekEnd = min([
          endOfWeek(nextWeekStart, {
            weekStartsOn,
          }),
          eventEnd,
        ]);
        if (nextWeekEnd.getTime() >= constrainedEnd.getTime()) {
          // persist the tail of the "snake"
          parts.push({
            start: nextWeekStart,
            end: eventEnd,
          });
          break;
        }
        parts.push({
          start: nextWeekStart,
          end: nextWeekEnd,
        });
        if (nextWeekEnd.getTime() >= eventEnd.getTime()) {
          break;
        }
      }
      return parts.map((part) => ({
        sourceEvent: defaultEvent.sourceEvent,
        start: part.start,
        end: part.end,
      }));
    }
    return defaultEvent;
  });
  return events;
}
