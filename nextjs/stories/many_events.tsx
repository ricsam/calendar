import { CalendarEvent } from "@/components/types";
import { CheckCircleOutline } from "@mui/icons-material";
import { Box } from "@mui/material";
import {
  addHours,
  startOfDay,
  startOfWeek,
  addDays,
  addMinutes,
  endOfDay,
  subDays,
} from "date-fns";

export const manyEvents: CalendarEvent<undefined>[] = [
  {
    start: startOfDay(new Date()),
    end: addMinutes(startOfDay(new Date()), 15),
    title: "A short event",
  },
  {
    start: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    end: endOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    title: "A full day event",
  },
  {
    start: addHours(
      startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
      2
    ),
    end: addMinutes(
      addHours(startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })), 2),
      15
    ),
    title: "A sub day event",
  },
  // 2 overlapping on monday
  {
    start: addHours(
      startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
      2
    ),
    end: addHours(startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })), 4),
    title: "A two hour event",
  },
  {
    start: addHours(
      startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
      1
    ),
    end: addHours(startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })), 4),
    title: "A three hour event",
  },

  // 3 (+1) overlapping on tuesday
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      2
    ),
    end: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      4
    ),
    title: "A two hour event",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      1
    ),
    end: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      4
    ),
    title: "A three hour event",
  },

  // 3 (+1) overlapping on tuesday
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      7
    ),
    end: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      9
    ),
    title: "A two hour event",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      6
    ),
    end: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      9
    ),
    title: "A three hour event",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      7
    ),
    end: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      9
    ),
    title: "A one hour event",
  },

  // last event that overlapps all on tuesday
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      1
    ),
    end: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
      10
    ),
    title: "A big event",
  },
  // small events
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2)),
      1
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2)),
        1
      ),
      15
    ),
    title: "15 min event",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
      1
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        1
      ),
      5
    ),
    title: "5 min event",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
      2
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        2
      ),
      25
    ),
    title: "25 min event and a pretty long title",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
      3
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        3
      ),
      30
    ),
    title: "30 min event",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
      4
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        4
      ),
      35
    ),
    title: "35 min event",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
      5
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        5
      ),
      45
    ),
    title: "45 min event",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
      6
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        6
      ),
      60
    ),
    title: "60 min event",
  },

  {
    start: addDays(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        1
      ),
      2
    ),
    end: addDays(
      addMinutes(
        addHours(
          startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
          1
        ),
        5
      ),
      2
    ),
    title: "5 min event",
    endAdornment: () => "🎉",
  },
  {
    start: addDays(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        2
      ),
      2
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        2
      ),
      25
    ),
    title: "25 min event and a pretty long title",
    endAdornment: () => "🎉",
  },
  {
    start: addDays(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        3
      ),
      2
    ),
    end: addDays(
      addMinutes(
        addHours(
          startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
          3
        ),
        30
      ),
      2
    ),
    title: "30 min event",
    endAdornment: () => "🎉",
  },
  {
    start: addDays(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        4
      ),
      2
    ),
    end: addDays(
      addMinutes(
        addHours(
          startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
          4
        ),
        35
      ),
      2
    ),
    title: "35 min event",
    endAdornment: () => "🎉",
  },
  {
    start: addDays(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        5
      ),
      2
    ),
    end: addDays(
      addMinutes(
        addHours(
          startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
          5
        ),
        45
      ),
      2
    ),
    title: "45 min event",
    endAdornment: () => "🎉",
  },
  {
    start: addDays(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        6
      ),
      2
    ),
    end: addDays(
      addMinutes(
        addHours(
          startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
          6
        ),
        60
      ),
      2
    ),
    title: "60 min event",
    endAdornment: () => (
      <Box sx={{ display: "flex", width: "10px", height: "10px" }}>
        <CheckCircleOutline sx={{ fontSize: "10px", color: "white" }} />
      </Box>
    ),
  },

  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
      9
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        9
      ),
      30
    ),
    title: "To fix issue #23",
  },
  {
    start: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        9
      ),
      30
    ),
    end: addMinutes(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        17
      ),
      0
    ),
    title: "To fix issue #23 /2",
    endAdornment: () => "🎉",
  },
  {
    start: addHours(
      startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
      23
    ),
    end: addHours(
      addHours(
        startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
        23
      ),
      10
    ),
    canEdit: false,
    title: "over night event",
    endAdornment: () => "🎉",
  },
  // full day events
  {
    start: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    end: endOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1)),
    title: "A two day event",
  },
  {
    start: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    end: endOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    title: "All day event",
    endAdornment: () => "🎉",
  },
  {
    start: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    end: endOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2)),
    title: "A three day event",
  },
  {
    start: startOfDay(subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2)),
    end: endOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 14)),
    title: "A loong day event",
    endAdornment: () => "🎉",
  },
  {
    start: startOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
    end: endOfDay(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)),
    title: "All day event",
    endAdornment: () => "🎉",
  },
  {
    start: new Date("2025-01-01T00:00:00.000Z"),
    end: new Date("2026-01-01T00:00:00.000Z"),
    title: "A year event",
    endAdornment: () => "🎉",
  },
].map((ev) => ({ ...ev, canEdit: ev.canEdit === false ? false : true }));
