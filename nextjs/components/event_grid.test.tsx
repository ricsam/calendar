import {
  addDays,
  addMinutes,
  endOfDay,
  startOfDay,
  subMinutes,
} from "date-fns";
import { CalendarEvent } from "./types";
import { monthCalendarRange, eventGrid as realEventGrid } from "./event_grid";
import { splitMultiWeekEvents } from "./month_calendar/split_multi_week_events";
import { filterEventsInMonth } from "./month_calendar/filter_events_in_month";
import { ModifiableEvent } from "./week_calendar/types";

jest.useFakeTimers().setSystemTime(new Date("2024-06-15"));

const fns = {
  splitEvents: splitMultiWeekEvents,
  filterEvents: filterEventsInMonth,
};

function eventGrid<T>(
  events: ModifiableEvent<T>[],
  startDay: "sunday" | "monday",
  startOfMonth: Date,
  _fns: typeof fns
) {
  return realEventGrid(
    _fns.splitEvents(
      _fns.filterEvents(events, startDay, startOfMonth),
      startDay,
      startOfMonth
    ),
    startDay,
    monthCalendarRange(startDay, startOfMonth).startOfMonthCalendar,
    monthCalendarRange(startDay, startOfMonth).endOfMonthCalendar,
    1
  );
}

test("works with a short event", () => {
  expect(
    eventGrid(
      [
        {
          sourceEvent: {
            title: "Short event",
            start: subMinutes(new Date(), 30), // 14th 23:30
            end: subMinutes(new Date(), 15), // 14th 23:45
          },
          start: subMinutes(new Date(), 30), // 14th 23:30
          end: subMinutes(new Date(), 15), // 14th 23:45
        },
      ],

      "monday",
      new Date(),
      fns
    ).grid
  ).toMatchInlineSnapshot(`
    [
      ,
      ,
      [
        ,
        ,
        ,
        ,
        [
          {
            "end": "2024-06-14 23:45",
            "index": 0,
            "start": "2024-06-14 23:30",
            "title": "Short event",
          },
        ],
      ],
    ]
  `);
});

test("works with full day event", () => {
  expect(
    eventGrid(
      [
        {
          sourceEvent: {
            title: "Full day event",
            start: startOfDay(new Date()), // 15th 00:00
            end: endOfDay(new Date()), // 15th 23:59
          },
          start: startOfDay(new Date()), // 15th 00:00
          end: endOfDay(new Date()), // 15th 23:59
        },
      ],

      "monday",
      new Date(),
      fns
    ).grid
  ).toMatchInlineSnapshot(`
    [
      ,
      ,
      [
        ,
        ,
        ,
        ,
        ,
        [
          {
            "end": "2024-06-15 23:59",
            "index": 0,
            "start": "2024-06-15 00:00",
            "title": "Full day event",
          },
        ],
      ],
    ]
  `);
});

test("can populate the grid over multiple days", () => {
  expect(
    eventGrid(
      [
        {
          sourceEvent: {
            title: "3 days event",
            start: startOfDay(addDays(new Date(), 2)), // 17th 00:00
            end: endOfDay(addDays(new Date(), 4)), // 19th 23:59
            styling: { color: "pink" },
          },
          start: startOfDay(addDays(new Date(), 2)), // 17th 00:00
          end: endOfDay(addDays(new Date(), 4)), // 19th 23:59
        },
      ],

      "monday",
      new Date(),
      fns
    ).grid
  ).toMatchInlineSnapshot(`
    [
      ,
      ,
      ,
      [
        [
          {
            "end": "2024-06-19 23:59",
            "index": 0,
            "start": "2024-06-17 00:00",
            "title": "3 days event",
          },
        ],
        [
          {
            "end": "2024-06-19 23:59",
            "index": 0,
            "start": "2024-06-17 00:00",
            "title": "3 days event",
          },
        ],
        [
          {
            "end": "2024-06-19 23:59",
            "index": 0,
            "start": "2024-06-17 00:00",
            "title": "3 days event",
          },
        ],
      ],
    ]
  `);

  // over 2 weeks
  expect(
    eventGrid(
      [
        {
          sourceEvent: {
            title: "3 day event",
            start: startOfDay(addDays(new Date(), 1)), // 16th 00:00
            end: endOfDay(addDays(new Date(), 3)), // 18th 23:59
            styling: { color: "pink" },
          },
          start: startOfDay(addDays(new Date(), 1)), // 16th 00:00
          end: endOfDay(addDays(new Date(), 3)), // 18th 23:59
        },
      ],

      "monday",
      new Date(),
      fns
    ).grid
  ).toMatchInlineSnapshot(`
    [
      ,
      ,
      [
        ,
        ,
        ,
        ,
        ,
        ,
        [
          {
            "end": "2024-06-16 23:59",
            "index": 0,
            "start": "2024-06-16 00:00",
            "title": "3 day event",
          },
        ],
      ],
      [
        [
          {
            "end": "2024-06-18 23:59",
            "index": 1,
            "start": "2024-06-17 00:00",
            "title": "3 day event",
          },
        ],
        [
          {
            "end": "2024-06-18 23:59",
            "index": 1,
            "start": "2024-06-17 00:00",
            "title": "3 day event",
          },
        ],
      ],
    ]
  `);
});

test("works with overlaps", () => {
  expect(
    eventGrid(
      [
        {
          sourceEvent: {
            title: "3 day event",
            start: startOfDay(addDays(new Date(), 1)), // 16th 00:00
            end: endOfDay(addDays(new Date(), 3)), // 18th 23:59
            styling: { color: "pink" },
          },
          start: startOfDay(addDays(new Date(), 1)), // 16th 00:00
          end: endOfDay(addDays(new Date(), 3)), // 18th 23:59
        },
        {
          sourceEvent: {
            title: "3 day event overlapping",
            start: startOfDay(addDays(new Date(), 2)), // 17th 00:00
            end: endOfDay(addDays(new Date(), 4)), // 19th 23:59
            styling: { color: "pink" },
          },
          start: startOfDay(addDays(new Date(), 2)), // 17th 00:00
          end: endOfDay(addDays(new Date(), 4)), // 19th 23:59
        },
        // {
        //   title: "loong event",
        //   start: startOfDay(subWeeks(new Date(), 2)), // 1st 00:00
        //   end: endOfDay(addWeeks(new Date(), 2)), // 29th 23:59
        //   color: "pink",
        // },
      ],

      "monday",
      new Date(),
      fns
    ).grid
  ).toMatchInlineSnapshot(`
    [
      ,
      ,
      [
        ,
        ,
        ,
        ,
        ,
        ,
        [
          {
            "end": "2024-06-16 23:59",
            "index": 0,
            "start": "2024-06-16 00:00",
            "title": "3 day event",
          },
        ],
      ],
      [
        [
          {
            "end": "2024-06-19 23:59",
            "index": 1,
            "start": "2024-06-17 00:00",
            "title": "3 day event overlapping",
          },
          {
            "end": "2024-06-18 23:59",
            "index": 2,
            "start": "2024-06-17 00:00",
            "title": "3 day event",
          },
        ],
        [
          {
            "end": "2024-06-19 23:59",
            "index": 1,
            "start": "2024-06-17 00:00",
            "title": "3 day event overlapping",
          },
          {
            "end": "2024-06-18 23:59",
            "index": 2,
            "start": "2024-06-17 00:00",
            "title": "3 day event",
          },
        ],
        [
          {
            "end": "2024-06-19 23:59",
            "index": 1,
            "start": "2024-06-17 00:00",
            "title": "3 day event overlapping",
          },
        ],
      ],
    ]
  `);
});

test("events are correct", () => {
  expect(
    eventGrid(
      [
        {
          sourceEvent: {
            title: "3 day event",
            start: startOfDay(addDays(new Date(), 1)), // 16th 00:00
            end: endOfDay(addDays(new Date(), 3)), // 18th 23:59
            styling: { color: "pink" },
          },
          start: startOfDay(addDays(new Date(), 1)), // 16th 00:00
          end: endOfDay(addDays(new Date(), 3)), // 18th 23:59
        },
      ],

      "monday",
      new Date(),
      fns
    ).events
  ).toMatchInlineSnapshot(`
    [
      {
        "end": 2024-06-16T23:59:59.999Z,
        "sourceEvent": {
          "color": "pink",
          "end": 2024-06-18T23:59:59.999Z,
          "start": 2024-06-16T00:00:00.000Z,
          "title": "3 day event",
        },
        "start": 2024-06-16T00:00:00.000Z,
      },
      {
        "end": 2024-06-18T23:59:59.999Z,
        "sourceEvent": {
          "color": "pink",
          "end": 2024-06-18T23:59:59.999Z,
          "start": 2024-06-16T00:00:00.000Z,
          "title": "3 day event",
        },
        "start": 2024-06-17T00:00:00.000Z,
      },
    ]
  `);
});

test("eventProperties", () => {
  expect(
    eventGrid(
      [
        {
          sourceEvent: {
            title: "3 day event",
            start: startOfDay(addDays(new Date(), 1)), // 16th 00:00
            end: endOfDay(addDays(new Date(), 3)), // 18th 23:59
            styling: { color: "pink" },
          },
          start: startOfDay(addDays(new Date(), 1)), // 16th 00:00
          end: endOfDay(addDays(new Date(), 3)), // 18th 23:59
        },
        {
          sourceEvent: {
            title: "3 day event overlapping",
            start: startOfDay(addDays(new Date(), 2)), // 17th 00:00
            end: endOfDay(addDays(new Date(), 4)), // 19th 23:59
            styling: { color: "pink" },
          },
          start: startOfDay(addDays(new Date(), 2)), // 17th 00:00
          end: endOfDay(addDays(new Date(), 4)), // 19th 23:59
        },
      ],

      "monday",
      new Date(),
      fns
    ).eventProperties
  ).toMatchInlineSnapshot(`
    {
      "0": {
        "day": 6,
        "endDay": 6,
        "inMoreButton": false,
        "row": 0,
        "startDay": 6,
        "week": 2,
      },
      "1": {
        "day": 0,
        "endDay": 2,
        "inMoreButton": true,
        "row": 0,
        "startDay": 0,
        "week": 3,
      },
      "2": {
        "day": 0,
        "endDay": 1,
        "inMoreButton": true,
        "row": 1,
        "startDay": 0,
        "week": 3,
      },
    }
  `);
});

test("some edge-case", () => {
  expect(
    eventGrid(
      [
        {
          sourceEvent: {
            start: startOfDay(addDays(new Date(), 5)),
            styling: { color: "red" },
            title: "A",
            canEdit: true,
          },
          start: startOfDay(addDays(new Date(), 5)),
          end: endOfDay(addDays(new Date(), 5)),
        },
        {
          start: startOfDay(addDays(new Date(), 3)),
          end: endOfDay(addDays(new Date(), 4)),
          sourceEvent: {
            start: startOfDay(addDays(new Date(), 3)),
            end: endOfDay(addDays(new Date(), 4)),
            title: "B",
            styling: { color: "green" },
            canEdit: true,
          },
        },
        {
          start: startOfDay(addDays(new Date(), 4)),
          end: endOfDay(addDays(new Date(), 5)),
          sourceEvent: {
            start: startOfDay(addDays(new Date(), 4)),
            end: endOfDay(addDays(new Date(), 5)),
            title: "C",
            styling: { color: "blue" },
            canEdit: true,
          },
        },
      ],

      "monday",
      new Date(),
      fns
    ).grid
  ).toMatchInlineSnapshot(`
    [
      ,
      ,
      ,
      [
        ,
        [
          {
            "end": "2024-06-19 23:59",
            "index": 0,
            "start": "2024-06-18 00:00",
            "title": "B",
          },
        ],
        [
          {
            "end": "2024-06-19 23:59",
            "index": 0,
            "start": "2024-06-18 00:00",
            "title": "B",
          },
          {
            "end": "2024-06-20 23:59",
            "index": 1,
            "start": "2024-06-19 00:00",
            "title": "C",
          },
        ],
        [
          {
            "end": "2024-06-20 23:59",
            "index": 2,
            "start": "2024-06-20 00:00",
            "title": "A",
          },
          {
            "end": "2024-06-20 23:59",
            "index": 1,
            "start": "2024-06-19 00:00",
            "title": "C",
          },
        ],
      ],
    ]
  `);
});
