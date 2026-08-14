import type { CSSProperties } from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    event: CSSProperties;
  }

  interface TypographyVariantsOptions {
    event?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    event: true;
  }
}

export { MonthCalendar } from "./month_calendar/month_calendar";
export type { MonthCalendarProps } from "./month_calendar/month_calendar";
export { CalendarNav } from "./nav/calendar_nav";
export { calendarTheme, CalendarThemeProvider } from "./theme";
export { DEFAULT_COLOR } from "./helpers";
export { WeekCalendar } from "./week_calendar/week_calendar";
export type { WeekCalendarProps } from "./week_calendar/week_calendar";
export type {
  CalendarEvent,
  CalendarEventStyling,
  ScrollContainer,
  StartDay,
} from "./types";
