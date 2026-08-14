/**
 * * `if (startOfDay(event.start) === event.start && endOfDay(event.start) === event.end)` the event is considered to be an all-day event
 * * `if (differenceInCalendarDays(event.end, event.start) === >= 1)` the event is considered to be an all-day event
 */
export type CalendarEventStyling = {
  /** Event background as any valid CSS color. */
  bg?: string;
  /** Event text as any valid CSS color. */
  textColor?: string;
  /** Text opacity from 0 to 1. */
  textOpacity?: number;
};

/** A calendar event. Both `start` and `end` are required. */
export type CalendarEvent<T = undefined> = {
  start: Date;
  end: Date;
  /** @default "(No title)" */
  title?: string;
  styling?: CalendarEventStyling;
  /** Allows moving and resizing when interaction callbacks are provided. */
  canEdit?: boolean;
  selected?: boolean;
  endAdornment?: (colors: { bg: string; textColor: string }) => React.ReactNode;
} & (T extends { data: unknown } ? T : {});

export type StartDay = "monday" | "sunday";

export type ScrollContainer =
  | (El & {
      current?: El | null;
    })
  | undefined
  | null;

type El = {
  scrollTop?: number;
  scrollLeft?: number;
  scrollY?: number;
  scrollX?: number;
  addEventListener?(
    type: string,
    listener: (...args: any[]) => any,
    options?: any,
  ): void;
  removeEventListener?(
    type: string,
    listener: (...args: any[]) => any,
    options?: any,
  ): void;
};
