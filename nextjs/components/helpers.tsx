import type { SxProps, Theme } from "@mui/material";
import { addMinutes, endOfDay, startOfDay, subMinutes } from "date-fns";
import { CalendarEvent } from "./types";

type Sx = SxProps<Theme>;

/**
 * Use this function to merge sx props
 * @public
 */
export function mergeSx(...sxs: (Sx | null | undefined | boolean)[]): Sx {
  const sx: any[] = [];

  if (sxs.length === 1 && !sxs[0]) {
    return undefined as any;
  }

  if (sxs.length === 1 && sxs[0]) {
    return sxs[0] as any;
  }

  sxs.forEach((passedSx) => {
    if (!passedSx) {
      return;
    }
    if (Array.isArray(passedSx)) {
      sx.push(
        ...passedSx.flat(Number.POSITIVE_INFINITY).filter((val) => !!val)
      );
    } else {
      sx.push(passedSx);
    }
  });

  return sx;
}

export function isAllDayEvent<T>(event: CalendarEvent<T>) {
  const inRange = (date: Date, start: Date, end: Date) =>
    date.getTime() >= start.getTime() && date.getTime() <= end.getTime();

  return (
    // all day event, it is more than 24h
    event.end.getTime() - event.start.getTime() >= 24 * 60 * 60 * 1000 ||
    // all day event that is exactly 24h (plus minus 1 minute)
    (inRange(
      event.start,
      startOfDay(event.start),
      addMinutes(startOfDay(event.start), 1)
    ) &&
      inRange(
        event.end,
        subMinutes(endOfDay(event.start), 1),
        endOfDay(event.start)
      ))
  );
}

export const DEFAULT_COLOR = "#FF7043";

export function widthToPct(width: number, daysInWeek: number): string {
  return String((width / (120 * daysInWeek)) * 100) + "%";
}
export function heightToPct(height: number, weeksInMonth: number): string {
  return String((height / (120 * weeksInMonth)) * 100) + "%";
}

/**
 * @public
 */
export function tuple<A, B, C, D>(a: A, b: B, c: C, d: D): [A, B, C, D];
/**
 * @public
 */
export function tuple<A, B, C>(a: A, b: B, c: C): [A, B, C];
/**
 * @public
 */
export function tuple<A, B>(a: A, b: B): [A, B];
/**
 * @public
 */
export function tuple<A>(a: A): [A];
/**
 * @public
 */
export function tuple(...args: any[]) {
  return args;
}
