import {
  StartOfWeekOptions,
  addDays,
  addWeeks,
  differenceInCalendarWeeks,
  differenceInDays,
  differenceInWeeks,
  endOfWeek,
  startOfMonth as fnsStartOfMonth,
  format,
  lastDayOfMonth,
  max,
  min,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { StartDay } from "./types";
import { ModifiableEvent } from "./week_calendar/types";

export function monthCalendarRange(startDay: StartDay, startOfMonth: Date) {
  const weekStartsOn: StartOfWeekOptions["weekStartsOn"] =
    startDay === "monday" ? 1 : 0;

  const startOfMonthCalendar = startOfWeek(fnsStartOfMonth(startOfMonth), {
    weekStartsOn,
  });
  const endOfMonthCalendar = endOfWeek(lastDayOfMonth(startOfMonth), {
    weekStartsOn,
  });
  return { startOfMonthCalendar, endOfMonthCalendar };
}

export function eventGrid<T>(
  events: ModifiableEvent<T>[],
  startDay: StartDay,
  startTime: Date,
  endTime: Date,
  maxEventsPerDay: number
) {
  const weekStartsOn: StartOfWeekOptions["weekStartsOn"] =
    startDay === "monday" ? 1 : 0;

  /**
   * This will hold all the properties about the events that we need to render them in the correct position
   */
  const eventProperties: {
    [
      /**
       * The index of the event
       */
      index: string
    ]: {
      row: number;
      day: number;
      week: number;
      startDay: number;
      endDay: number;
      inMoreButton: boolean;
    };
  } = {};

  // step 2.
  // sort the events by 1. start date and 2. duration
  events.sort((a, b) => {
    const startComparison = a.start.getTime() - b.start.getTime();
    if (startComparison !== 0) return startComparison;
    return b.end.getTime() - a.end.getTime();
  });

  // step 3.
  // for each week we have a grid of 7x5 positions. We loop over each event during the week and occupy the first available positions in the grid
  // in this process we will get the x, y position for each event
  // prettier-ignore
  const grid: (
    // event index
    {
      // metadata for the snapshot test
      index: number,
      title: string;
      start: string;
      end: string;
    }
  )[
    // row in a day
  ][
    // day
  ][
    // week
  ] = [];

  const assignEventToGrid = (
    week: number,
    day: number,
    eventIndex: number,
    {
      event,
      eventStart,
      eventEnd,
      endDay,
      startDay,
    }: {
      event: ModifiableEvent<T>;
      eventStart: Date;
      eventEnd: Date;
      endDay: number;
      startDay: number;
    }
  ) => {
    grid[week] = grid[week] ?? [];
    grid[week][day] = grid[week][day] ?? [];

    const rows = grid[week][day];

    // find the first available position
    let occupiedRows: number[] = [];
    let pinnedRow = -1;
    grid[week].forEach((week, dayIndex) => {
      week.forEach((event, row) => {
        const ev = events[event.index];
        const eventEnd = min([ev.end, endTime]);
        const evEndDay = differenceInDays(
          eventEnd,
          startOfWeek(eventEnd, { weekStartsOn })
        );
        if (evEndDay >= day) {
          if (event.index === eventIndex) {
            pinnedRow = row;
          } else {
            occupiedRows.push(row);
          }
        }
      });
    });
    let firstAvailableRow = pinnedRow !== -1 ? pinnedRow : rows.length;
    if (pinnedRow === -1) {
      for (let i = 0; i < Math.max(...occupiedRows); i += 1) {
        if (!occupiedRows.includes(i)) {
          firstAvailableRow = i;
          break;
        }
      }
    }

    rows[firstAvailableRow] = {
      index: eventIndex,
      title: event.sourceEvent.title ?? "no title",
      start: format(event.start, "yyyy-MM-dd HH:mm"),
      end: format(event.end, "yyyy-MM-dd HH:mm"),
    };

    // only the first time we assign the event to the grid we will store the properties
    if (!eventProperties[eventIndex]) {
      eventProperties[eventIndex] = {
        row: firstAvailableRow,
        day,
        week,
        startDay,
        endDay,
        inMoreButton: false,
      };
    }
  };

  events.forEach((event, index) => {
    const eventStart = max([event.start, startTime]);
    const eventEnd = min([event.end, endTime]);

    const week = differenceInCalendarWeeks(eventStart, startTime, {
      weekStartsOn,
    });
    const day = differenceInDays(
      eventStart,
      startOfWeek(eventStart, { weekStartsOn })
    );

    const endDay = differenceInDays(
      eventEnd,
      startOfWeek(eventStart, { weekStartsOn })
    );

    assignEventToGrid(week, day, index, {
      event,
      startDay: day,
      endDay,
      eventStart,
      eventEnd,
    });

    // we have a 1 day event - we will assign it to the grid according to the line above
    // we have a 2 day event - we will assign the first day of the event to the grid according to the line above
    //  - for a 2 day event, the loop with have d === 1, the end - start === 1 so the loop will loop only once
    for (let d = 1; d <= differenceInDays(eventEnd, eventStart); d++) {
      const start = addDays(eventStart, d);
      const week = differenceInCalendarWeeks(start, startTime, {
        weekStartsOn,
      });
      const day = differenceInDays(start, startOfWeek(start, { weekStartsOn }));

      assignEventToGrid(week, day, index, {
        event,
        startDay: day,
        endDay,
        eventStart: start,
        eventEnd,
      });
    }
  });

  const maxRows: number /* week / day */[][] = [];

  // get max row
  grid.forEach((week, weekIndex) => {
    week.forEach((day, dayIndex) => {
      if (!Array.isArray(maxRows[weekIndex])) {
        maxRows[weekIndex] = [];
      }
      maxRows[weekIndex][dayIndex] = Math.max(
        day.length,
        maxRows[weekIndex][dayIndex] || 0
      );
    });
  });

  // construct the list of more buttons

  const moreButtonsDict: Record<
    /**
     * The key is the `${week}-${day}`
     */
    string,
    MoreButton<T>
  > = {};

  events.forEach((event, eventIndex) => {
    const { week, row, startDay, endDay } = eventProperties[eventIndex];
    for (let day = startDay; day <= endDay; day++) {
      const key = `${week}-${day}`;

      let moreButton = moreButtonsDict[key];
      if (moreButton) {
        moreButton.allEvents.push(eventIndex);
      } else {
        const date = startOfDay(addDays(addWeeks(startTime, week), day));
        moreButtonsDict[key] = {
          week,
          day,
          events: [],
          allEvents: [eventIndex],
          date,
        };
        moreButton = moreButtonsDict[key];
      }
      const pushEvent = () => {
        moreButton.events.push(eventIndex);
        eventProperties[eventIndex].inMoreButton = true;
      };
      const maxRow = maxRows[week][day];
      eventProperties[eventIndex];
      if (maxRow > maxEventsPerDay) {
        // has more button
        if (row >= maxEventsPerDay - 1) {
          pushEvent();
        }
      } else {
        if (row >= maxEventsPerDay) {
          pushEvent();
        }
      }
    }
  });

  return {
    grid,
    eventProperties,
    events,
    moreButtons: Object.values(moreButtonsDict).filter(
      (button) => button.events.length > 0
    ),
  };
}

export type MoreButton<T> = {
  week: number;
  day: number;
  date: Date;
  events: number[];
  allEvents: number[];
};
