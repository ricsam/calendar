import { Box, Button, Typography } from "@mui/material";
import { format } from "date-fns";
import { DEFAULT_COLOR, mergeSx } from "../helpers";
import type { CalendarEvent } from "../types";
import { Triangle } from "../week_calendar/week_calendar";
import { FlexCol, FlexRow } from "../wrappers";

export function MonthCalendarEvent<T>({
  event,
  state = "normal",
  triangle,
  allDayEvent,
  disableInteractive,
  dataProps,
  bg,
  textColor,
  ...buttonProps
}: {
  event: CalendarEvent<T>;
  allDayEvent?: boolean;
  state?: "normal" | "selected";
  triangle?: "right" | "left" | "both";
  disableInteractive?: boolean;
  dataProps: any;
  bg: string;
  textColor: string;
} & Omit<React.ComponentProps<typeof Button>, "color">) {
  const { start, title } = event;

  const hasEndArrow =
    allDayEvent && (triangle === "right" || triangle === "both");

  const hasStartArrow =
    allDayEvent && (triangle === "left" || triangle === "both");

  return (
    <Box
      component={Button}
      {...buttonProps}
      {...dataProps}
      sx={mergeSx(
        {
          display: "flex",
          position: "absolute",
          p: 0,
          alignItems: allDayEvent ? "stretch" : "initial",
          justifyContent: allDayEvent ? "stretch" : "flex-start",
          background: "none",
          minWidth: "auto",
          overflow: "hidden",
          whiteSpace: "nowrap",
          "*:not(.resize-event)": {
            pointerEvents: "none",
          },
        },
        !disableInteractive && {
          boxShadow:
            state === "selected"
              ? (theme) => theme.shadows[1]
              : (theme) => theme.shadows[0],
        },

        buttonProps.sx,
      )}
    >
      {hasStartArrow && (
        <Triangle direction={"left"} height={16} width={4} color={bg} />
      )}
      {allDayEvent ? (
        <FlexRow
          sx={{
            bgcolor: bg,
            justifyContent: "flex-start",
            paddingRight: event.endAdornment
              ? hasEndArrow
                ? 0
                : "4px"
              : "8px",
            paddingLeft: "8px",
            paddingTop: 0,
            paddingBottom: 0,
            flex: 1,
            borderRadius: !triangle ? "4px" : "0px",
            alignItems: "center",
          }}
        >
          <Typography variant="event" color={textColor}>
            {title ?? "(No title)"}
          </Typography>
          {event.endAdornment ? (
            <>
              <Box sx={{ flex: 1 }}></Box>
              <Box>{event.endAdornment({ bg, textColor })}</Box>
            </>
          ) : null}
        </FlexRow>
      ) : (
        <FlexRow
          sx={{
            alignItems: "center",
            gap: "6px",
            padding: "0px 0px 0px 3px",
            borderRadius: "4px",
            overflow: "hidden",
            textWrap: "nowrap",
            width: "100%",
          }}
        >
          <FlexCol justifyContent="center" width="8px">
            <EventDot color={bg} />
          </FlexCol>
          <FlexRow gap="6px" alignItems="center">
            <Typography
              variant="event"
              sx={{
                fontWeight: "400",
                color: (theme) => theme.palette.text.primary,
              }}
            >
              {`${format(start, "h:mm")}`}
            </Typography>

            <Typography
              variant="event"
              sx={{ color: (theme) => theme.palette.text.primary }}
            >
              {title ?? "(No Title)"}
            </Typography>
          </FlexRow>
          {event.endAdornment ? (
            <>
              <Box sx={{ flex: 1 }}></Box>
              <Box sx={{ paddingRight: "4px" }}>
                {event.endAdornment({ bg, textColor })}
              </Box>
            </>
          ) : null}
        </FlexRow>
      )}
      {hasEndArrow && (
        <Triangle direction={"right"} height={16} width={4} color={bg} />
      )}
    </Box>
  );
}

function EventDot({ color = DEFAULT_COLOR }: { color?: string }) {
  return (
    <Box
      sx={{
        width: "8px",
        height: "8px",
        borderRadius: "8px",
        backgroundColor: color,
      }}
    ></Box>
  );
}
