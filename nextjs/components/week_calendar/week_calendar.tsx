import { ChevronDown, ChevronUp } from "../nav/chevrons";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import {
  StartOfWeekOptions,
  addDays,
  addMilliseconds,
  addMinutes,
  areIntervalsOverlapping,
  differenceInCalendarDays,
  differenceInMilliseconds,
  differenceInMinutes,
  endOfDay,
  endOfWeek,
  startOfWeek as fnsStartOfWeek,
  format,
  isSameDay,
  max,
  min,
  roundToNearestMinutes,
  startOfDay,
  subMinutes,
} from "date-fns";
import React from "react";
import {
  DEFAULT_COLOR,
  getEventColor,
  getEventEnd,
  getEventStart,
  isAllDayEvent,
  isTask,
  mergeSx,
  widthToPct,
} from "../helpers";
import { CalendarEvent, ScrollContainer, StartDay } from "../types";
import {
  DragPosition,
  EventContainer,
  MouseState,
  dayDiff,
  xUnitToPx,
  useDragableEvents,
  useEffectRefs,
  useMouse,
} from "../use_mouse";
import { FlexCol, FlexRow } from "../wrappers";
import { getPositions } from "./clique_grid";
import { CalendarConfigContext, useCalendar } from "./context";
import { getAllDayOverlaps } from "./event_overlap_functions";
import { subDayEventSize } from "./sub_day_event_size";
import { TimeIndicator } from "./time_indicator";
import { ModifiableEvent } from "./types";

export type WeekCalendarProps<T> = {
  /**
   * Events for the calendar
   * @default []
   */
  events?: CalendarEvent<T>[];
  /**
   * start week on monday or sunday. if workWeek is true, startDay will be monday
   * @default 'monday'
   */
  startDay?: StartDay;
  /**
   * Will render 5 days, mon-fri if true
   * @default false
   */
  workWeek?: boolean;
  /**
   * Some date during the week. We use the date-fns `startOfWeek` to derive the first day of the week
   * @default new Date()
   */
  startOfWeek?: Date;
  /**
   * The current time. It is used to render the current time indicator
   * @default new Date()
   */
  now?: Date;

  /**
   * When provided the user can create an event by clicking on a day or...
   * If provided the user can drag to create events
   * When the user finishes the drag this function is called with the start and end date
   * @param start when the event starts
   * @param end when event ends
   * @returns void
   */
  onCreateEvent?: (start: Date, end?: Date) => void;

  /**
   * Triggered when an event is moved or resized
   * @param event a calendar event
   * @param newStart new start date for the event
   * @param newEnd new end date for the event
   * @returns void
   */
  onMoveEvent?: (
    event: CalendarEvent<T>,
    newStart: Date,
    newEnd: Date | undefined,
  ) => void;

  /**
   * Triggered when an event clicked - open a modal or similar interface to edit the event
   * @param event a calendar event
   * @returns void
   */
  onClickEvent?: (event: CalendarEvent<T>, nativeEvent: MouseEvent) => void;

  /**
   * This is the default event color, when no event.color is provided (and for new events that are created by dragging for example)
   * @default "#FF7043"
   */
  defaultEventColor?: string;

  /**
   * Provide elements that scroll around the calendar so that events can be moved while the user is scrolling
   * @default [window]
   */
  scrollContainers?: ScrollContainer[];

  /**
   * Make the header position sticky
   */
  stickyHeader?: boolean;

  /**
   * Auto scroll to the time indicator
   */
  autoScroll?: boolean;
};

function parseDefaultProps<T>(props: WeekCalendarProps<T>) {
  const events = props.events ?? [];
  let startDay = props.startDay ?? "monday";
  let workWeek = props.workWeek ?? false;
  const now = props.now ?? new Date();
  if (workWeek) {
    startDay = "monday";
  }
  const startOpts: StartOfWeekOptions = {
    weekStartsOn: startDay === "monday" ? 1 : 0,
  };
  const startOfWeek = props.startOfWeek
    ? fnsStartOfWeek(props.startOfWeek, startOpts)
    : fnsStartOfWeek(new Date(), startOpts);
  const scrollContainers = props.scrollContainers ?? [];
  if (scrollContainers.length === 0) {
    scrollContainers.push(window);
  }
  return {
    events,
    startDay,
    workWeek,
    startOfWeek,
    now,
    onCreateEvent: props.onCreateEvent,
    onMoveEvent: props.onMoveEvent,
    onClickEvent: props.onClickEvent,
    defaultEventColor: props.defaultEventColor ?? DEFAULT_COLOR,
    scrollContainers,
  };
}

export function WeekCalendar<T>(props: WeekCalendarProps<T>) {
  const {
    events,
    startDay,
    workWeek,
    startOfWeek,
    now,
    onCreateEvent,
    onMoveEvent,
    onClickEvent,
    defaultEventColor,
    scrollContainers,
  } = parseDefaultProps(props);

  const allDayEvents: CalendarEvent<T>[] = [];
  const gridEvents: CalendarEvent<T>[] = [];

  const [isExpanded, setIsExpanded] = React.useState(false);

  const daysInWeek = workWeek ? 5 : 7;

  events.forEach((event) => {
    const eventOverlapWithWeek = areIntervalsOverlapping(
      {
        start: startOfWeek,
        end: addDays(startOfWeek, workWeek ? 5 : 7),
      },
      { start: event.start, end: event.end ?? event.start },
    );

    if (!eventOverlapWithWeek) {
      return;
    }

    if (isAllDayEvent(event)) {
      allDayEvents.push(event);
    } else {
      gridEvents.push(event);
    }
  });

  const overlaps = getAllDayOverlaps(
    startOfWeek,
    daysInWeek,
    allDayEvents.map((e) => ({
      sourceEvent: e,
      start: e.start,
      end: e.end ?? e.start,
    })),
  );
  const maxOverlaps = Math.max(
    0,
    ...Object.values(overlaps).map((o) => o.length),
  );
  const totalHeight = 17 * maxOverlaps;
  const COLLAPSED_ROWS = 6;
  const collapsedHeight = 17 * COLLAPSED_ROWS;
  const hasOverflow = maxOverlaps > COLLAPSED_ROWS;
  const effectiveIsExpanded = isExpanded && hasOverflow;
  const MORE_BUTTON_HEIGHT = hasOverflow && !effectiveIsExpanded ? 20 : 0;
  const effectiveHeight = effectiveIsExpanded
    ? totalHeight
    : Math.min(totalHeight, collapsedHeight);
  // 64px day label row + 12px spacer below it
  const HEADER_OVERHEAD = 76;
  const headerContentHeight =
    effectiveHeight + MORE_BUTTON_HEIGHT + HEADER_OVERHEAD;

  return (
    <CalendarConfigContext.Provider
      value={{
        startDay,
        workWeek,
        startOfWeek: startOfWeek,
        now,
        onCreateEvent,
        onClickEvent,
        onMoveEvent,
        defaultEventColor,
        scrollContainers,
      }}
    >
      {props.stickyHeader ? (
        <FlexCol sx={{ height: "100%", overflow: "hidden" }}>
          <FlexCol
            sx={{
              flex: `0 0 min(${headerContentHeight}px, 50%)`,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <WeekCalendarHeader
              events={allDayEvents}
              sticky
              isExpanded={effectiveIsExpanded}
              setIsExpanded={setIsExpanded}
            />
          </FlexCol>
          <FlexCol
            sx={{
              flex: 1,
              overflow: "auto",
              scrollbarGutter: "stable",
              zIndex: 0,
              position: "relative",
              minHeight: 0,
            }}
          >
            <FlexRow sx={{ height: "100%" }}>
              <TimeSidebar />
              <Box width="100%">
                <FlexRow width="100%">
                  <WeekCalendarGrid
                    events={gridEvents}
                    autoScroll={props.autoScroll}
                  />
                </FlexRow>
              </Box>
            </FlexRow>
          </FlexCol>
        </FlexCol>
      ) : (
        <>
          <WeekCalendarHeader events={allDayEvents} />
          <FlexCol sx={{ zIndex: 0, position: "relative" }}>
            <FlexRow width="100%">
              <TimeSidebar />
              <Box width="100%">
                <FlexRow width="100%">
                  <WeekCalendarGrid
                    events={gridEvents}
                    autoScroll={props.autoScroll}
                  />
                </FlexRow>
              </Box>
            </FlexRow>
          </FlexCol>
        </>
      )}
    </CalendarConfigContext.Provider>
  );
}

export const Triangle = ({
  width,
  height,
  direction,
  color,
}: {
  width: number;
  height: number;
  direction: "left" | "right";
  color: string;
}) => {
  const points =
    direction === "left"
      ? `${width},0 0,${height / 2} ${width},${height}`
      : `0,0 ${width},${height / 2} 0,${height}`;

  return (
    <Box
      component="svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      sx={{ flexShrink: 0 }}
    >
      <polygon points={points} fill={color} />
    </Box>
  );
};

/**
 * All day events that are from 00:00:00 to 23:59:59 are considered to be all day, so when running differenceInCalendarDays we want 1 to appear
 */
const parseAllDayEnd = (end: Date) => {
  if (endOfDay(end).getTime() === end.getTime()) {
    return startOfDay(addDays(end, 1));
  }
  return end;
};

function WeekCalendarHeader<T>(props: {
  events: CalendarEvent<T>[];
  sticky?: boolean;
  isExpanded?: boolean;
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { workWeek, startOfWeek, now, onCreateEvent, ...calendarProps } =
    useCalendar();
  const daysInWeek = workWeek ? 5 : 7;

  const [events, draggedEvent, setDraggedEvent] = useDragableEvents(
    props.events,
  );

  const overlaps = getAllDayOverlaps(startOfWeek, daysInWeek, events);

  const maxOverlaps = Math.max(...Object.values(overlaps).map((o) => o.length));

  const totalHeight = 17 * maxOverlaps;

  const COLLAPSED_ROWS = 6;
  const collapsedHeight = 17 * COLLAPSED_ROWS;
  const hasOverflow = maxOverlaps > COLLAPSED_ROWS;

  const hiddenPerDay: number[] = Array.from(
    { length: daysInWeek },
    (_, i) =>
      (overlaps[i] ?? []).filter((e, idx) => e != null && idx >= COLLAPSED_ROWS)
        .length,
  );

  const [isExpandedInternal, setIsExpandedInternal] = React.useState(false);
  const isExpanded = (props.isExpanded ?? isExpandedInternal) && hasOverflow;
  const setIsExpanded = props.setIsExpanded ?? setIsExpandedInternal;

  const MORE_BUTTON_HEIGHT = hasOverflow && !isExpanded ? 20 : 0;

  const effectiveHeight = isExpanded
    ? totalHeight
    : Math.min(totalHeight, collapsedHeight);

  // handle drag and drop
  /**
   * if event has moved return the new start and end time
   */
  function calculateNewTime(
    state: MouseState,
    dragged: DragPosition<ModifiableEvent<T>>,
    container: EventContainer,
  ) {
    if (state.pos && state.pos0) {
      const addedDays = dayDiff(
        state.pos,
        state.pos0,
        dragged,
        daysInWeek,
        container,
      );
      if (addedDays !== 0) {
        return {
          start: addDays(dragged.event.start, addedDays),
          end: addDays(
            dragged.event.end ?? endOfDay(dragged.event.start),
            addedDays,
          ),
        };
      }
    }
    return undefined;
  }

  const getEvent = (index: string): ModifiableEvent<T> | undefined => {
    return events[parseInt(index)];
  };

  const [effectRefs, eventContainerRef] = useEffectRefs(
    getEvent,
    setDraggedEvent,
    calculateNewTime,
    calendarProps,
  );

  useMouse("week-calendar-all-day-event", effectRefs, workWeek);

  const weekDays = [...Array(daysInWeek)].map((_, index) => {
    const day = addDays(startOfWeek, index);
    return (
      <Box
        component={onCreateEvent ? Button : "div"}
        key={index}
        onClick={
          onCreateEvent
            ? () => {
                const start = startOfDay(day);
                const end = endOfDay(day);
                onCreateEvent(start, end);
              }
            : undefined
        }
        sx={mergeSx(
          onCreateEvent
            ? {
                border: 0,
                p: 0,
                display: "block",
                background: "none",
                cursor: "pointer",
              }
            : undefined,
          {
            pt: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            minWidth: "auto",
            flex: 1,
            ...(props.sticky && isExpanded ? { height: "100%" } : {}),
          },
        )}
      >
        <DayHeader date={day} active={isSameDay(now, day)} />
        <Box sx={{ height: "12px" }} />
        <FlexRow
          sx={{
            height:
              isExpanded && props.sticky
                ? "calc(100% - 76px)"
                : effectiveHeight + MORE_BUTTON_HEIGHT,
            justifyContent: "flex-start",
            width: "100%",
          }}
        ></FlexRow>
      </Box>
    );
  });

  const theme = useTheme();

  return (
    <FlexCol
      sx={mergeSx(
        props.sticky && {
          width: "100%",
          height: "100%",
          position: "sticky",
          top: 0,
          zIndex: 1,
          marginBottom: "-1px",
          background: (theme) => theme.palette.background.paper,
        },
      )}
    >
      <FlexRow sx={props.sticky ? { height: "100%" } : undefined}>
        {/* Left gutter — same 64px width as TimeSidebar */}
        <Box
          sx={{
            width: 64,
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-end",
            pb: 0.5,
            pl: 0.5,
          }}
        >
          {hasOverflow && (
            <IconButton
              size="small"
              onClick={() => setIsExpanded((v) => !v)}
              aria-label={
                isExpanded ? "Collapse all-day events" : "Expand all-day events"
              }
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp width={16} height={16} />
              ) : (
                <ChevronDown width={16} height={16} />
              )}
            </IconButton>
          )}
        </Box>

        <Box
          sx={mergeSx(
            {
              display: "flex",
              position: "relative",
              flex: 1,
              overflowX: "hidden",
            },
            props.sticky && {
              height: "100%",
              scrollbarGutter: "stable",
              background: (theme) => theme.palette.background.paper,
              borderBottomColor: (theme) => theme.palette.divider,
              borderBottomStyle: "solid",
              borderBottomWidth: "thin",
            },
          )}
          ref={eventContainerRef}
        >
          {weekDays}

          <FlexRow
            className="header-vertical-lines"
            sx={{
              position: "absolute",
              alignItems: "stretch",
              justifyContent: "space-between",
              pointerEvents: "none",
              height: "calc(100% - 64px)",
              left: 0,
              right: 0,
              top: 64,
            }}
          >
            {[...Array(workWeek ? 6 : 8)].map((_, i) => {
              return (
                <Divider
                  key={i}
                  orientation="vertical"
                  sx={{
                    opacity:
                      workWeek && i === 5 ? 0 : !workWeek && i == 7 ? 0 : 1,
                  }}
                />
              );
            })}
          </FlexRow>

          {/* Scrollable all-day events area */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 64,
              height:
                isExpanded && props.sticky
                  ? "calc(100% - 64px)"
                  : effectiveHeight,
              maxHeight:
                isExpanded && props.sticky
                  ? "calc(100% - 64px)"
                  : effectiveHeight,
              overflowY: isExpanded ? "auto" : "hidden",
            }}
          >
            {events.map((event, index) => {
              const start = startOfDay(event.start);
              const end = parseAllDayEnd(event.end ?? endOfDay(event.start));
              const endOfWeek = addDays(startOfWeek, daysInWeek);

              const rawX = differenceInCalendarDays(start, startOfWeek);

              const x = Math.max(rawX, 0);
              const y = overlaps[x].indexOf(event);
              const width = differenceInCalendarDays(
                min([end, endOfWeek]),
                max([start, startOfWeek]),
              );

              const style = {
                height: 16,
                width: widthToPct(119 * Math.max(width, 1) - 8, daysInWeek),
              };

              const dayOverflowRight = differenceInCalendarDays(end, endOfWeek);

              const { bg, color } = getEventColor(
                now,
                end,
                theme,
                event.sourceEvent.color ?? calendarProps.defaultEventColor,
              );

              const disableInteractive =
                !calendarProps.onClickEvent && !calendarProps.onMoveEvent;

              return (
                <Box
                  className="all-day-event"
                  key={index}
                  component={Button}
                  data-type="week-calendar-all-day-event"
                  data-calendar-event={JSON.stringify({
                    x,
                    colX: 0,
                    index,
                    w: width,
                  })}
                  disableRipple={
                    disableInteractive ||
                    (draggedEvent?.dragged &&
                      draggedEvent?.source.sourceEvent === event.sourceEvent)
                  }
                  sx={mergeSx(
                    {
                      border: 0,
                      p: 0,
                      m: 0,
                      minWidth: "auto",
                      background: "none",
                      cursor: "pointer",
                      position: "absolute",
                      top: y * 17,
                      left: widthToPct(x * 120 + 1, daysInWeek),
                      ...style,
                      display: "flex",
                      justifyContent: "stretch",
                      alignItems: "stretch",
                      "*": {
                        pointerEvents: "none",
                      },
                    },
                    !disableInteractive &&
                      draggedEvent?.source.sourceEvent ===
                        event.sourceEvent && {
                        opacity: 0.5,
                      },
                    !disableInteractive &&
                      draggedEvent?.dragged &&
                      draggedEvent?.source.sourceEvent ===
                        event.sourceEvent && {
                        opacity: 0.75,
                        boxShadow: theme.shadows[4],
                      },
                    disableInteractive && {
                      cursor: "auto",
                    },
                  )}
                >
                  {rawX < 0 ? (
                    <AllDayCalendarOverflow
                      direction="left"
                      value={rawX}
                      color={color}
                      bg={bg}
                      valueDate={start}
                      compact={width <= 1}
                    />
                  ) : null}
                  <Box
                    sx={{
                      background: bg,
                      display: "flex",
                      justifyContent: "flex-start",
                      flex: 1,
                      px: 1,
                      alignItems: "center",
                      borderRadius: 1,
                      borderTopLeftRadius: rawX < 0 ? 0 : 4,
                      borderBottomLeftRadius: rawX < 0 ? 0 : 4,
                      borderTopRightRadius: dayOverflowRight > 0 ? 0 : 4,
                      borderBottomRightRadius: dayOverflowRight > 0 ? 0 : 4,
                      paddingLeft: rawX < 0 ? 0 : 1,
                      pointerEvents: "none",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      color={color}
                      variant="event"
                      sx={{
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {event.sourceEvent.title ?? "(No name)"}
                    </Typography>
                    {event.sourceEvent.endAdornment && dayOverflowRight <= 0 ? (
                      <>
                        <Box sx={{ flex: 1 }}></Box>
                        <Box>
                          {event.sourceEvent.endAdornment({ bg, color })}
                        </Box>
                      </>
                    ) : null}
                  </Box>
                  {dayOverflowRight > 0 ? (
                    <AllDayCalendarOverflow
                      direction="right"
                      value={dayOverflowRight}
                      bg={bg}
                      color={color}
                      valueDate={end}
                      compact={width <= 1}
                      endAdornment={
                        event.sourceEvent.endAdornment
                          ? event.sourceEvent.endAdornment({ bg, color })
                          : undefined
                      }
                    />
                  ) : null}
                </Box>
              );
            })}
          </Box>

          {/* "+N more" expand links, one per day column with hidden events */}
          {!isExpanded &&
            [...Array(daysInWeek)].map((_, index) => {
              if (hiddenPerDay[index] === 0) return null;
              return (
                <Button
                  key={index}
                  size="small"
                  variant="text"
                  onClick={() => setIsExpanded(true)}
                  sx={{
                    position: "absolute",
                    top: 64 + effectiveHeight,
                    left: widthToPct(index * 120 + 1, daysInWeek),
                    width: widthToPct(119, daysInWeek),
                    fontSize: "0.7rem",
                    p: 0,
                    minWidth: "auto",
                    textTransform: "none",
                    lineHeight: 1,
                    justifyContent: "flex-start",
                  }}
                >
                  +{hiddenPerDay[index]} more
                </Button>
              );
            })}
        </Box>
      </FlexRow>
    </FlexCol>
  );
}

function DayHeader({ date, active }: { date: Date; active?: boolean }) {
  const { workWeek } = useCalendar();
  const dayOfWeek = format(date, "EEE");
  const dayOfMonthNr = format(date, "d");
  const daysInWeek = workWeek ? 5 : 7;

  return (
    <FlexCol
      width={widthToPct(120, daysInWeek)}
      height={52}
      alignItems="center"
      justifyContent="flex-start"
      flexShrink={0}
      position={"relative"}
    >
      {active && (
        <Box
          sx={{
            width: 36,
            height: 36,
            position: "absolute",
            borderRadius: 36,
            bottom: -2,
            backgroundColor: (theme) => theme.palette.primary.main,
          }}
        ></Box>
      )}
      <FlexCol height={20} justifyContent={"center"} alignItems={"center"}>
        <Typography
          variant="caption"
          sx={{
            color: active ? "primary" : (theme) => theme.palette.text.primary,
          }}
        >
          {dayOfWeek}
        </Typography>
      </FlexCol>

      <FlexCol
        height={32}
        justifyContent={"center"}
        alignItems={"center"}
        zIndex={1}
      >
        <Typography
          variant="h5"
          sx={{
            color: active
              ? (theme) => theme.palette.primary.contrastText
              : (theme) => theme.palette.text.primary,
          }}
        >
          {dayOfMonthNr}
        </Typography>
      </FlexCol>
    </FlexCol>
  );
}

function TimeSidebar() {
  return (
    <FlexCol
      sx={{
        width: "64px",
        padding: "29px 24px 0px 0px",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {[...Array.from({ length: 12 }, (_, i) => i + 1)].map((hour, index) => {
        return (
          <FlexCol
            key={index + hour}
            sx={{
              height: "60px",
              alignSelf: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: (theme) => theme.palette.text.primary }}
            >
              {hour === 12 ? `${hour} PM` : `${hour} AM`}
            </Typography>
          </FlexCol>
        );
      })}
      {[...Array.from({ length: 11 }, (_, i) => i + 1)].map((hour, index) => {
        return (
          <FlexCol
            key={index + hour}
            sx={{
              height: "60px",
              alignSelf: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: (theme) => theme.palette.text.primary }}
            >{`${hour} PM`}</Typography>
          </FlexCol>
        );
      })}
    </FlexCol>
  );
}

function WeekCalendarGrid<T>(props: {
  events: CalendarEvent<T>[];
  autoScroll?: boolean;
}) {
  const { workWeek, now, startOfWeek, startDay, ...calendarProps } =
    useCalendar<T>();
  const daysInWeek = workWeek ? 5 : 7;

  const snapFn = (start: Date, end: Date, strict?: boolean) => {
    const delta = differenceInMilliseconds(end, start);
    const newStart = roundToNearestMinutes(start, { nearestTo: 15 });
    if (strict) {
      const newEnd = roundToNearestMinutes(end, { nearestTo: 15 });

      return {
        start: newStart,
        end: newEnd,
      };
    }
    const newEnd = addMilliseconds(newStart, delta);
    return {
      start: newStart,
      end: newEnd,
    };
  };

  const [allEvents, draggedEvent, setDraggedEvent] = useDragableEvents(
    props.events,
    snapFn,
  );

  const options: StartOfWeekOptions = {
    weekStartsOn: startDay === "monday" ? 1 : 0,
  };

  /**
   * Events that cross 12am are split into two events
   */
  const events: ModifiableEvent<T>[] = allEvents
    .map((ev) => {
      return {
        ...ev,
        start: min([
          max([getEventStart(ev), startOfWeek]),
          // it must be within the week
          subMinutes(endOfWeek(startOfWeek, options), 15),
        ]),
        // an event "collision box" should be at least 15 minutes in height (=15px)
        end: max([getEventEnd(ev), addMinutes(ev.start, 15)]),
      };
    })
    .flatMap((defaultEvent) => {
      let parts: { start: Date; end: Date }[] = [];
      if (differenceInCalendarDays(defaultEvent.end, defaultEvent.start) > 0) {
        // split event up into multiple events to not overflow a single day
        // an event can't be longer than a day

        const part0 = {
          start: defaultEvent.start,
          end: endOfDay(defaultEvent.start),
        };
        parts.push(part0);
        while (true) {
          const startOfPrevious = parts[parts.length - 1].start;
          const nextDay = startOfDay(addDays(startOfPrevious, 1));
          const nextDayEnd = min([endOfDay(nextDay), defaultEvent.end]);
          parts.push({
            start: nextDay,
            end: nextDayEnd,
          });
          if (nextDayEnd.getTime() >= defaultEvent.end.getTime()) {
            break;
          }
        }
        return parts.map((part) => ({
          sourceEvent: defaultEvent.sourceEvent,
          start: part.start,
          end: part.end,
        }));
      }
      return defaultEvent;
    });

  const [horizontalPositions, numCols] = getPositions(events);

  // handle drag and drop
  /**
   * if event has moved return the new start and end time
   */
  function calculateNewTime(
    state: MouseState,
    dragged: DragPosition<ModifiableEvent<T>>,
    container: EventContainer,
  ) {
    if (state.pos && state.pos0) {
      const addedDays =
        dragged.type === "existing"
          ? dayDiff(state.pos, state.pos0, dragged, daysInWeek, container)
          : // only allow drag to create event on the current day
            0;

      let start = getEventStart(dragged.event.sourceEvent);
      let end = getEventEnd(dragged.event.sourceEvent);

      if (addedDays !== 0) {
        start = addDays(start, addedDays);
        end = addDays(end, addedDays);
      }

      // calculate based on the split event, so that the "slit event" can't go out of bound on a single day
      const minAddedMinutes =
        differenceInMinutes(startOfDay(dragged.event.end), dragged.event.end) +
        15;
      const maxAddedMinutes =
        differenceInMinutes(
          endOfDay(dragged.event.start),
          dragged.event.start,
        ) - 15;

      const deltaY =
        state.pos.y - state.pos0.y + state.pos.scrollY - state.pos0.scrollY;

      const draggingDown = deltaY >= 0;

      const addedMin = Math.min(
        Math.max(
          deltaY + (dragged.type === "new" ? (draggingDown ? -15 : 0) : 0),
          minAddedMinutes,
        ),
        maxAddedMinutes,
      );

      if (state.hasDragged) {
        start = addMinutes(start, addedMin);
        end = addMinutes(end, addedMin);
      }

      if (dragged.type === "new") {
        // when creating a new event by dragging, we must maintain an "anchor" which depends which is the end if dragging up or the start when dragging down
        if (draggingDown) {
          return snapFn(dragged.event.start, end, true);
        } else {
          return snapFn(start, dragged.event.end, true);
        }
      }

      if (state.hasDragged) {
        return snapFn(start, end);
      }
    }
    return undefined;
  }

  const onClickEvent = calendarProps.onClickEvent;

  const getEvent = (index: string): ModifiableEvent<T> | undefined => {
    return events[parseInt(index)];
  };

  const [effectRefs, eventContainerRef] = useEffectRefs(
    getEvent,
    setDraggedEvent,
    calculateNewTime,
    calendarProps,
    (pos0, container) => {
      const x = pos0.x - container.x;
      const y = pos0.y - container.y;
      const day = Math.floor(x / xUnitToPx(120, daysInWeek, container));
      const minute = y;
      const start = addMinutes(
        startOfDay(addDays(fnsStartOfWeek(startOfWeek, options), day)),
        minute,
      );
      const end = addMinutes(start, 15);

      const dragged: DragPosition<ModifiableEvent<T>> = {
        type: "new",
        colX: 0,
        elX: 0,
        elY: 0,
        event: {
          start,
          end,
          sourceEvent: {
            canEdit: true,
            color: calendarProps.defaultEventColor,
            end,
            start,
            title: "(No title)",
          } as CalendarEvent<T>,
        },
        w: 1,
        x: day + 1,
        resize: undefined,
      };

      return dragged;
    },
  );

  useMouse("week-calendar-sub-day-event", effectRefs, workWeek);

  const theme = useTheme();

  const [timeIndicator, setTimeIndicatorRef] =
    React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (props.autoScroll && timeIndicator) {
      timeIndicator.scrollIntoView();
    }
  }, [props.autoScroll, timeIndicator]);

  let showTimeIndicator = false;

  if (now.getTime() >= startOfWeek.getTime()) {
    if (workWeek) {
      if (now.getTime() <= addDays(startOfWeek, 5).getTime()) {
        showTimeIndicator = true;
      }
    } else if (now.getTime() <= endOfWeek(startOfWeek, options).getTime()) {
      showTimeIndicator = true;
    }
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 1440,
      }}
    >
      {/* Horizontal lines */}
      <FlexCol
        className="horizontal-lines"
        sx={{
          gap: "59px",
          position: "absolute",
          alignItems: "stretch",
          inset: 0,
        }}
      >
        {[...Array(25)].map((_, i) => {
          return (
            <Divider
              key={i}
              sx={{
                marginLeft: "-16px",
              }}
            />
          );
        })}
      </FlexCol>
      {/* Vertical lines */}
      <FlexRow
        sx={{
          position: "absolute",
          alignItems: "stretch",
          justifyContent: "space-between",
          inset: 0,
        }}
      >
        {[...Array(workWeek ? 6 : 8)].map((_, i) => {
          return (
            <Divider
              key={i}
              orientation="vertical"
              sx={{
                opacity: workWeek && i === 5 ? 0 : !workWeek && i == 7 ? 0 : 1,
              }}
            />
          );
        })}
      </FlexRow>

      <Box
        className="grid-events"
        sx={{
          position: "absolute",
          inset: 0,
        }}
        ref={eventContainerRef}
      >
        {events.map((event, index) => {
          const height = Math.max(
            event.end
              ? differenceInMinutes(event.end, event.start, {
                  roundingMethod: "round",
                })
              : 15,
            15,
          );
          const top = differenceInMinutes(
            event.start,
            startOfDay(event.start),
            {
              roundingMethod: "round",
            },
          );
          const x = differenceInCalendarDays(event.start, startOfWeek);
          const left = x * 120;
          const n = numCols[index];
          const horPos = horizontalPositions[index];
          const rect = subDayEventSize(n, horPos);
          /**
           * if the event goes over 12am then the event might be split into multiple events
           */
          const events = allEvents
            .filter((ev) => ev.sourceEvent === event.sourceEvent)
            .sort((a, b) => a.start.getTime() - b.start.getTime());

          const displayStart = events[0].start;
          const displayEnd = events[events.length - 1].end;
          const time = (
            <>
              {format(displayStart, height >= 30 ? "h:mm" : "h:mmaaa")}
              {event.sourceEvent.end && height >= 30 ? (
                <> – {format(displayEnd, "h:mmaaa")}</>
              ) : null}
            </>
          );
          const colX = rect.x;

          const { bg, color } = getEventColor(
            now,
            getEventEnd(event.sourceEvent),
            theme,
            event.sourceEvent.color ?? calendarProps.defaultEventColor,
          );

          const disableInteractive =
            !calendarProps.onClickEvent && !calendarProps.onMoveEvent;
          const textOpacityStyle =
            getEventEnd(event.sourceEvent).getTime() - now.getTime() < 0
              ? {
                  opacity: "0.5",
                }
              : {};
          const dataProps: any = {
            "data-type": "week-calendar-sub-day-event",
            "data-calendar-event": JSON.stringify({
              x,
              index,
              w: 1,
              colX,
            }),
          };
          return (
            <Box
              className={"grid-event"}
              component={Button}
              key={index}
              {...dataProps}
              disableRipple={
                disableInteractive ||
                (draggedEvent?.dragged &&
                  draggedEvent.source.sourceEvent === event.sourceEvent)
              }
              sx={mergeSx(
                {
                  position: "absolute",
                  textAlign: "left",
                  minWidth: "auto",
                  padding: 0,
                  margin: 0,
                  top: top + 1,
                  left: widthToPct(left + colX + 1, daysInWeek),
                  height: height - 1,
                  width: widthToPct(rect.w, daysInWeek),
                  zIndex: horPos,
                  "*:not(.resize-event)": {
                    pointerEvents: "none",
                  },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "stretch",
                  alignItems: "stretch",
                },
                !disableInteractive &&
                  draggedEvent?.source.sourceEvent === event.sourceEvent && {
                    opacity: 0.5,
                  },
                !disableInteractive &&
                  draggedEvent?.dragged &&
                  draggedEvent.source.sourceEvent === event.sourceEvent && {
                    opacity: 0.75,
                    boxShadow: theme.shadows[4],
                  },
                disableInteractive && {
                  cursor: "auto",
                },
                event.sourceEvent.selected && {
                  boxShadow: theme.shadows[6],
                  border: `1px solid ${theme.palette.primary.main}`,
                },
              )}
            >
              <Box
                sx={mergeSx(
                  {
                    flex: 1,
                    background: bg,
                    border: (theme) =>
                      `1px solid ${theme.palette.primary.contrastText}`,
                    borderRadius: 1,
                    overflow: "hidden",
                    px: "7px",
                    py: height >= 35 ? "3px" : 0,
                    gap: "4px",
                    width: "100%",
                    display: "flex",
                  },
                  height >= 60
                    ? {
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }
                    : {
                        alignItems: "center",
                        justifyContent: "space-between",
                      },
                )}
              >
                <Box sx={{ overflow: "hidden" }}>
                  {height >= 30 ? (
                    <>
                      <Typography
                        color={color}
                        variant="event"
                        component="div"
                        sx={mergeSx(
                          {
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "clip",
                          },
                          textOpacityStyle,
                        )}
                      >
                        {event.sourceEvent.title ?? "(No name)"}
                      </Typography>
                      <Typography
                        component="div"
                        color={color}
                        variant="event"
                        sx={mergeSx(
                          {
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                            fontWeight: 400,
                            textOverflow: "clip",
                            overflow: "hidden",
                          },
                          textOpacityStyle,
                        )}
                      >
                        {time}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      color={color}
                      variant="event"
                      component="div"
                      sx={mergeSx(
                        {
                          pointerEvents: "none",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "clip",
                        },
                        textOpacityStyle,
                      )}
                    >
                      {event.sourceEvent.title ?? "(No name)"}
                      <Box component="span" sx={{ fontWeight: 400 }}>
                        {", "}
                        {time}
                      </Box>
                    </Typography>
                  )}
                </Box>

                {event.sourceEvent.endAdornment ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box>{event.sourceEvent.endAdornment({ bg, color })}</Box>
                    </Box>
                  </>
                ) : null}
              </Box>

              {event.sourceEvent.canEdit &&
                !isTask(event.sourceEvent) &&
                (["start", "end"] as const).map((pos, i) => (
                  <Box
                    key={i}
                    className="resize-event"
                    {...dataProps}
                    data-drag-source="resize-event"
                    data-resize-pos={pos}
                    sx={mergeSx(
                      {
                        height: 4,
                        flexShrink: 0,
                        position: "absolute",
                        zIndex: 1,
                        left: 0,
                        right: 0,
                        cursor: "ns-resize",
                      },
                      pos === "start"
                        ? {
                            top: 0,
                          }
                        : {
                            bottom: 0,
                          },
                    )}
                  ></Box>
                ))}
            </Box>
          );
        })}
      </Box>

      {showTimeIndicator && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {/* Time Indicator */}
          <Box
            className="time-indicator"
            ref={setTimeIndicatorRef}
            sx={{
              position: "absolute",
              top: differenceInMinutes(now, startOfDay(now)),
              left: widthToPct(
                differenceInCalendarDays(now, startOfWeek) * 120 + 1,
                daysInWeek,
              ),
              width: `calc(${widthToPct(120, daysInWeek)} + 6.5px)`,
              height: "13px",
              marginTop: "-6px",
              marginLeft: `calc(-${widthToPct(1, daysInWeek)} - 6.5px)`,
            }}
          >
            <TimeIndicator />
          </Box>
        </Box>
      )}
    </Box>
  );
}

function AllDayCalendarOverflow({
  direction,
  value,
  color,
  bg,
  valueDate,
  compact,
  endAdornment,
}: {
  direction: "left" | "right";
  value: number;
  valueDate: Date;
  color: string;
  bg: string;
  compact?: boolean;
  endAdornment?: React.ReactNode;
}) {
  const t = (
    <>
      {Math.sign(value) === -1 ? "-" : "+"}
      {Math.abs(value)}d
    </>
  );
  const d = <>({format(valueDate, "LLL do")})</>;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction === "right" ? "row-reverse" : "row",
        pointerEvents: "none",
      }}
    >
      <Triangle direction={direction} height={16} width={4} color={bg} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 0.5,
          background: bg,
        }}
      >
        <Typography
          variant="event"
          color={color}
          sx={{
            whiteSpace: "nowrap",
            opacity: 0.7,
            fontWeight: "regular",
          }}
        >
          {compact ? (
            <>{t}</>
          ) : (
            <>
              {t} {d}
            </>
          )}
        </Typography>
        {endAdornment ? <Box sx={{ pl: 0.5 }}>{endAdornment}</Box> : null}
      </Box>
    </Box>
  );
}
