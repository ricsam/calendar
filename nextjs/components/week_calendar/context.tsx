import React from "react";
import { CalendarEvent, ScrollContainer, StartDay } from "../types";

type RawContext<T> =
  | undefined
  | {
      startDay: StartDay;
      workWeek: boolean;
      startOfWeek: Date;
      now: Date;
      onCreateEvent?: (start: Date, end: Date) => void;
      onClickEvent?: (event: CalendarEvent<T>, nativeEvent: MouseEvent) => void;
      onMoveEvent?: (
        event: CalendarEvent<T>,
        newStart: Date,
        newEnd: Date,
      ) => void;
      defaultEventColor: string;
      scrollContainers: ScrollContainer[];
    };
export const CalendarConfigContext =
  React.createContext<RawContext<any>>(undefined);

export function useCalendar<T>() {
  const ctx: RawContext<T> = React.useContext(CalendarConfigContext);
  if (!ctx) {
    throw new Error("useCalendar must be used within a CalendarConfigContext");
  }
  return ctx;
}
