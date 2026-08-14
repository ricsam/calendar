import { TimelineResolution } from "@/components/types";
import { addMilliseconds } from "date-fns";

export type PartialEvent = { start: Date; end: Date };

export const minRenderedEventDuration = (resolution: TimelineResolution) => {
  // month: hour
  // 3-months: day
  // year: day
  // 3-years: week

  let minDuration = 1000 * 3600 * 1; // month
  if (resolution === "week") {
    minDuration = 1000 * 3600 * 1; // 1 hour
  }
  if (resolution === "3-months") {
    minDuration = 1000 * 3600 * 24;
  }
  if (resolution === "year") {
    minDuration = 1000 * 3600 * 24;
  }
  if (resolution === "3-years") {
    minDuration = 1000 * 3600 * 24 * 7;
  }
  return minDuration;
};

export const eventsOverlaps = (
  resolution: TimelineResolution,
  a: PartialEvent,
  b: PartialEvent,
) => {
  const minDuration = minRenderedEventDuration(resolution);

  const aStart = a.start;
  let aEnd = a.end;
  if (aEnd.getTime() - aStart.getTime() < minDuration) {
    aEnd = addMilliseconds(aStart, minDuration);
  }

  const bStart = b.start;
  let bEnd = b.end;
  if (bEnd.getTime() - bStart.getTime() < minDuration) {
    bEnd = addMilliseconds(bStart, minDuration);
  }

  return (
    (aStart.getTime() <= bEnd.getTime() &&
      aEnd.getTime() >= bStart.getTime()) ||
    (bStart.getTime() <= aEnd.getTime() && bEnd.getTime() >= aStart.getTime())
  );
};

export const eventsToRows = <T extends PartialEvent>(
  events: T[],
  resolution: TimelineResolution,
): T[][] => {
  const rows: T[][] = [[]];
  for (let j = 0; j < events.length; j++) {
    const row = rows.find((row) => {
      return !row.some((evInRow) =>
        eventsOverlaps(resolution, events[j], evInRow),
      );
    });
    if (row) {
      row.push(events[j]);
    } else {
      rows.push([events[j]]);
    }
  }
  return rows;
};
