/**
 * * `if (startOfDay(event.start) === event.start && endOfDay(event.start) === event.end)` the event is considered to be an all-day event
 * * `if (differenceInCalendarDays(event.end, event.start) === >= 1)` the event is considered to be an all-day event
 */
export type CalendarEvent<T> = {
  start: Date;
  end: Date;
  /**
   * If no title is provided the default title is "(no title)"
   */
  title?: string;
  /**
   * Styling options for the event.
   * Use `bg` to set the event background color, `textColor` to set the text color,
   * and `textOpacity` to control the opacity of the text independently.
   */
  styling?: {
    /**
     * Computed background CSS color string for the event. Falls back to `DEFAULT_COLOR` if not provided.
     */
    bg?: string;
    /**
     * Computed text/contrast CSS color string for the event.
     */
    textColor?: string;
    /**
     * Opacity of the event text (0–1).
     */
    textOpacity?: number;
  };
  canEdit?: boolean;
  selected?: boolean;
  endAdornment?: (colors: { bg: string; textColor: string }) => React.ReactNode;
} & (T extends { data: any } ? T : {});

export type StartDay = "monday" | "sunday";

/**
 * How many days the timeline span
 *
 * e.g.\
 * month = 30 days\
 * 3-months = 90 days
 */
export type TimelineResolution = "month" | "3-months" | "year" | "3-years";

/**
 * The speed that you navigate left / right using the timeline nav
 *
 * e.g. speed = 1 day / click\
 * e.g. speed = 7 day / click (week)\
 * e.g. speed = 30 days / click (month)
 */
export type TimelineSpeed =
  | "day"
  | "week"
  | "month"
  | "3-months"
  | "quarter"
  | "year"
  | "3-years";

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
    options?: any
  ): void;
  removeEventListener?(
    type: string,
    listener: (...args: any[]) => any,
    options?: any
  ): void;
};
