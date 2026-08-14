import {
  Box,
  BoxProps,
  Button,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  StartOfWeekOptions,
  addDays,
  addHours,
  addMilliseconds,
  addMinutes,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  areIntervalsOverlapping,
  compareAsc,
  differenceInCalendarDays,
  differenceInMilliseconds,
  endOfDay,
  max,
  min,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subMilliseconds,
} from "date-fns";
import React from "react";
import { minRenderedEventDuration } from "../events_to_rows";
import {
  DEFAULT_COLOR,
  mergeSx,
  tuple,
} from "../helpers";
import { useMeasureHeight } from "../measure_height";
import {
  CalendarEvent,
  ScrollContainer,
  StartDay,
  TimelineResolution,
} from "../types";
import {
  DragPosition,
  DraggedEvent,
  EventContainer,
  MouseState,
  useEffectRefs,
  useMouse,
} from "../use_mouse";
import { ModifiableEvent } from "../week_calendar/types";
import { Grid } from "./grid";
import { Header } from "./header";
import { timelineHeaderHeight } from "./timeline_height";
import { widthToPct } from "./to_pct";

type TimelineGroup<T> = {
  /**
   * group key
   */
  key: string;
  /**
   * title of the group
   */
  title: string;
  /**
   * color of the group
   */
  color: string;

  /**
   * Use these rows instead of the default rows
   */
  rows: CalendarEvent<T>[][];
};

/**
 * To render events we either use the `rows` or `group` prop.
 *
 * The `group` props defines how we can render groups of events.
 *
 * `rows` will just render each row of events, you are responsible for spacing them out.
 */
export type TimelineProps<T> = {
  /**
   * Events for the calendar. Memoize this prop for better performance
   * @default []
   */
  rows?: CalendarEvent<T>[][];

  /**
   * Define how to group the events. Memoize this prop for better performance.
   */
  group?: {
    /**
     * return the group key of the event
     */
    getGroup: (event: CalendarEvent<T>) => string;
    /**
     * a list of groups
     */
    groups: TimelineGroup<T>[];
  };

  /**
   * If you want to maintain the position of the events when they are dragged
   * the timeline must know what id to use for the event. This is used to keep track of the event
   */
  getId?: (event: CalendarEvent<T>) => string;

  /**
   * Will be e.g. start of the week / year / month / quarter / 3 years / 3 months depending on the resolution
   * @default new Date()
   */
  startTime?: Date;
  /**
   * What view do we want to show
   * @default "month"
   */
  resolution?: TimelineResolution;
  /**
   * The current time. It is used to render the current time indicator
   * @default new Date()
   */
  now?: Date;

  /**
   * start week on monday or sunday
   * @default 'monday'
   */
  startDay?: StartDay;

  /**
   * When provided the user can create an event by clicking on a day or dragging over areas in the calendar
   * @param start when the event starts
   * @param end when event ends
   * @returns void
   */
  onCreateEvent?: (start: Date, end: Date) => void;

  /**
   * Triggered when an event is moved
   * @param event a calendar event
   * @param newStart new start date for the event
   * @param newEnd new end date for the event
   * @returns void
   */
  onMoveEvent?: (
    event: CalendarEvent<T>,
    newStart: Date,
    newEnd: Date
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
   * If you remove the header it will not render the week / month / year / 3 years header
   */
  noHeader?: boolean;
};

function getStartTime(
  startTime: Date,
  resolution: TimelineResolution,
  startDay: StartDay
): Date {
  const options: StartOfWeekOptions = {
    weekStartsOn: startDay === "monday" ? 1 : 0,
  };
  if (resolution === "month") {
    return startOfWeek(startTime, options);
  }
  if (resolution === "3-months") {
    return startOfWeek(startTime, options);
  }
  if (resolution === "year") {
    return startOfQuarter(startTime);
  }
  if (resolution === "3-years") {
    return startOfYear(startTime);
  }
  throw new Error("invalid resolution");
}

function useParseDefaultProps<T>(props: TimelineProps<T>) {
  const rows = React.useMemo(() => props.rows ?? [], [props.rows]);
  let startDay = props.startDay ?? "monday";
  const now = props.now ?? new Date();

  const resolution = props.resolution ?? "month";

  const scrollContainers = props.scrollContainers ?? [];
  if (scrollContainers.length === 0) {
    scrollContainers.push(window);
  }

  return {
    rows,
    startDay,
    startTime: React.useMemo(
      () => getStartTime(props.startTime ?? new Date(), resolution, startDay),
      [props.startTime, resolution, startDay]
    ),
    startOfWeek,
    resolution,
    now,
    onCreateEvent: props.onCreateEvent,
    onMoveEvent: props.onMoveEvent,
    onClickEvent: props.onClickEvent,
    scrollContainers,
    noHeader: props.noHeader,
    group: props.group,
    getId: props.getId,
    defaultEventColor: props.defaultEventColor ?? DEFAULT_COLOR,
  };
}

export function Timeline<T>(props: TimelineProps<T>) {
  const p = useParseDefaultProps(props);
  const {
    startTime,
    rows: sourceRows,
    startDay,
    resolution,
    noHeader,
    group,
    getId,
    defaultEventColor,
    now,
    ...calendarProps
  } = p;

  const options: StartOfWeekOptions = React.useMemo(() => {
    return {
      weekStartsOn: startDay === "monday" ? 1 : 0,
    };
  }, [startDay]);

  const snapFn = React.useCallback(
    (start: Date, end: Date, snapType: "both" | "start" | "end" = "start") => {
      const evDuration = differenceInMilliseconds(end, start);

      const handleSnap = (snappedStart: Date, snappedEnd: Date) => {
        if (snapType === "both") {
          return {
            start: snappedStart,
            end: snappedEnd,
          };
        } else if (snapType === "start") {
          return {
            start: snappedStart,
            end: addMilliseconds(snappedStart, evDuration),
          };
        } else if (snapType === "end") {
          return {
            start: subMilliseconds(snappedEnd, evDuration),
            end: snappedEnd,
          };
        }
        throw new Error("invalid snap type");
      };

      const snapToHour = () => {
        const middleOfTheHour = addMinutes(startOfHour(start), 30);

        const snap = (date: Date) => {
          return compareAsc(date, middleOfTheHour) === -1
            ? startOfHour(date)
            : startOfHour(addHours(date, 1));
        };
        const snappedStart = snap(start);
        const snappedEnd = snap(end);

        return handleSnap(snappedStart, snappedEnd);
      };
      const snapToMonth = () => {
        const delta = differenceInMilliseconds(end, start);

        const monthDelta = differenceInMilliseconds(
          startOfMonth(addMonths(start, 1)),
          startOfMonth(start)
        );

        const middleOfTheMonth = addMilliseconds(
          startOfMonth(start),
          monthDelta / 2
        );

        const snap = (date: Date) => {
          return compareAsc(date, middleOfTheMonth) === -1
            ? startOfMonth(date)
            : startOfMonth(addMonths(date, 1));
        };
        const snappedStart = snap(start);
        const snappedEnd = snap(end);

        return handleSnap(snappedStart, snappedEnd);
      };
      const snapToDay = () => {
        const middleOfTheDay = addHours(startOfDay(start), 12);

        const snap = (date: Date) => {
          return compareAsc(date, middleOfTheDay) === -1
            ? startOfDay(date)
            : startOfDay(addDays(date, 1));
        };
        const snappedStart = snap(start);
        const snappedEnd = snap(end);

        return handleSnap(snappedStart, snappedEnd);
      };

      const snapToWeek = () => {
        const middleOfTheWeek = addMinutes(
          startOfWeek(start, options),
          (7 * 720) / 2
        );

        const snap = (date: Date) => {
          return compareAsc(date, middleOfTheWeek) === -1
            ? startOfWeek(date, options)
            : startOfWeek(addWeeks(date, 1), options);
        };

        const snappedStart = snap(start);
        const snappedEnd = snap(end);

        return handleSnap(snappedStart, snappedEnd);
      };

      if (resolution === "month") {
        return snapToDay();
      }
      if (resolution === "3-months") {
        return snapToDay();
      }
      if (resolution === "year") {
        return snapToDay();
      }
      if (resolution === "3-years") {
        return snapToMonth();
      }
      return { start, end };
    },
    [options, resolution]
  );

  // const [allEvents, draggedEvent, setDraggedEvent] = useDragableEvents(
  //   sourceEvents,
  //   snapFn
  // );

  const [draggedEvent, setDraggedEvent] = React.useState<
    DraggedEvent<ModifiableEvent<T>> | undefined
  >(undefined);

  const { allRows, eventGroupMap } = React.useMemo(() => {
    let allRows = sourceRows;
    const eventGroupMap: (TimelineGroup<T> | undefined)[] = [];
    if (group) {
      allRows = [];
      group.groups.forEach((group) => {
        group.rows.forEach((row) => {
          allRows.push(row);
          eventGroupMap.push(group);
        });
      });
      sourceRows.forEach((row, rowIndex) => {
        allRows.push(row);
        eventGroupMap.push(undefined);
      });
    }
    return {
      allRows: allRows.map((sourceRow) =>
        sourceRow.map((sourceEvent) => ({
          sourceEvent,
          start: sourceEvent.start,
          end: sourceEvent.end,
        }))
      ),
      eventGroupMap,
    };
  }, [sourceRows, group]);

  const rows: ModifiableEvent<T>[][] = React.useMemo(
    () => parseEventsInTimeline(allRows, resolution, startTime),
    [allRows, resolution, startTime]
  );

  const [timelineStart, timelineEnd] = React.useMemo(
    () => getTimelineRange(resolution, startTime),
    [resolution, startTime]
  );

  function calculateNewTime(
    state: MouseState,
    dragged: DragPosition<ModifiableEvent<T>>,
    container: EventContainer
  ) {
    if (state.pos && state.pos0) {
      const { pos, pos0 } = state;
      let deltaX = pos.x + -pos0.x + pos.scrollX - pos0.scrollX;

      let addedMs =
        (timelineEnd.getTime() - timelineStart.getTime()) *
        (deltaX / container.width);

      const minDuration = minRenderedEventDuration(resolution);

      const minAddedMs =
        timelineStart.getTime() - dragged.event.end.getTime() + minDuration;

      const maxAddedMs =
        timelineEnd.getTime() - dragged.event.start.getTime() - minDuration;

      addedMs = Math.min(Math.max(addedMs, minAddedMs), maxAddedMs);

      let start = addMilliseconds(
        dragged.event.sourceEvent.start,
        addedMs
      );
      let end = addMilliseconds(
        dragged.event.sourceEvent.end,
        addedMs
      );

      if (dragged.type === "new") {
        const draggingLeft = deltaX < 0;
        // when creating a new event by dragging, we must maintain an "anchor" which depends which is the end if dragging up or the start when dragging down
        if (draggingLeft) {
          return snapFn(start, dragged.event.end, "both");
        } else {
          return snapFn(dragged.event.start, end, "both");
        }
      }

      if (state.hasDragged) {
        // in use_mouse only start is changed when resizing from left and end when resizing from right
        // thus snap both during resize
        // otherwise just snap the start position
        return snapFn(start, end, dragged.resize ? "both" : "start");
      }
    }
    return undefined;
  }

  function constrainResize(
    origEv: { start: Date; end: Date },
    newEv: { start: Date; end: Date },
    resize: "start" | "end"
  ) {
    if (resize === "end") {
      const delta = differenceInMilliseconds(newEv.end, origEv.start);
      const minDuration = minRenderedEventDuration(resolution);
      if (delta < minDuration) {
        const newEnd = addMilliseconds(origEv.start, minDuration);
        return {
          start: origEv.start,
          end: newEnd,
        };
      }
    } else {
      const delta = differenceInMilliseconds(origEv.end, newEv.start);
      let minDuration = minRenderedEventDuration(resolution);
      if (delta < minDuration) {
        const newStart = subMilliseconds(origEv.end, minDuration);
        return {
          start: newStart,
          end: origEv.end,
        };
      }
    }

    if (resize === "end") {
      return {
        start: origEv.start,
        end: newEv.end,
      };
    }
    return {
      start: newEv.start,
      end: origEv.end,
    };
  }

  const getEvent = (id: string): ModifiableEvent<T> | undefined => {
    const [row, index] = id.split("|");
    if (typeof row === "undefined" || typeof index === "undefined") {
      return;
    }
    const event = rows[Number(row)][Number(index)];
    return event;
  };

  const [effectRefs, eventContainerRef] = useEffectRefs(
    getEvent,
    setDraggedEvent,
    calculateNewTime,
    calendarProps,
    undefined,
    constrainResize
  );

  useMouse("timeline-event", effectRefs, false);

  const start = timelineStart.getTime();
  const end = timelineEnd.getTime();

  const headerHeight = timelineHeaderHeight({
    resolution,
  });

  const { height, setWrapperRef, hasMeasuredHeight, width } =
    useMeasureHeight(0);

  // half a screen of rows
  const padding = Math.floor(height / 17 / 2);

  const [direction, setDirection] = React.useState<"up" | "down">("down");
  const windowSize = !hasMeasuredHeight
    ? 0
    : Math.ceil(height / 17) + padding * 2;

  const [topRowIndex, setTopRowIndex] = React.useState(0);

  const startIndex = Math.max(topRowIndex - padding, 0);
  const endIndex = Math.min(topRowIndex + windowSize, rows.length - 1);

  const [scrollableRef, setScrollableRef] = React.useState<HTMLElement | null>(
    null
  );

  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!scrollableRef) {
      return;
    }
    let t: number;
    let current = 0;
    const emit = () => {
      const scrollTop = scrollableRef.scrollTop;
      setDirection(scrollTop > current ? "down" : "up");
      current = scrollTop;
      const newStartIndex = Math.floor(scrollTop / 17);
      setTimeout(() => {
        setTopRowIndex(newStartIndex);
      }, 0);
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) {
        return;
      }
      t = requestAnimationFrame(() => {
        emit();
        ticking = false;
      });
      ticking = true;
    };
    scrollableRef.addEventListener("scroll", onScroll, { passive: true });

    onScroll();

    // const i = setInterval(() => {
    //   const scrollTop = scrollableRef.scrollTop;
    //   setTopRowIndex((i) => i + 1);
    // }, 1000);

    return () => {
      // clearInterval(i);
      scrollableRef.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(t);
    };
  }, [scrollableRef, rows.length]);

  const scrollLength = rows.length * 17;

  const empty = rows.length === 0 || rows.every((r) => r.length === 0);
  const leftSidebarWidth = 64;

  const startOfTimeline = timelineStart.getTime();
  const endOfTimeline = timelineEnd.getTime();
  const totalSecondsOfTimeline = end - start;

  let displayTimeIndicator = false;
  if (now.getTime() >= start && now.getTime() <= end) {
    displayTimeIndicator = true;
  }

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        height: "100%",
        flex: 1,
        flexDirection: "column",
        opacity: hasMeasuredHeight ? 1 : 0,
        transition: "opacity 0.2s ease-in-out",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
        }}
        className="sticky-header-container"
      >
        {group && (
          <Box
            sx={{
              width: `${leftSidebarWidth}px`,
              flexShrink: 0,
              background: (theme) => theme.palette.background.paper,
              height: `${noHeader ? 0 : headerHeight}px`,
            }}
          ></Box>
        )}
        <Box
          sx={{
            position: "relative",
            width: `${
              !width ? "100%" : width - (group ? leftSidebarWidth : 0)
            }px`,
          }}
        >
          {!noHeader && (
            <Box
              sx={{
                background: (theme) => theme.palette.background.paper,
                height: `${noHeader ? 0 : headerHeight}px`,
                pointerEvents: "all",
                overflow: "hidden",
              }}
            >
              <Header
                {...p}
                empty={empty}
                onCreateEvent={props.onCreateEvent}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          right: "0",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          display: "flex",
          alignItems: "stretch",
        }}
        className="sticky-grid"
      >
        {group && (
          <Box
            sx={{
              width: `${leftSidebarWidth}px`,
              flexShrink: 0,
              background: (theme) => theme.palette.background.paper,
              height: `${noHeader ? 0 : headerHeight}px`,
            }}
          ></Box>
        )}
        <Box
          sx={{
            position: "relative",
            width: `${
              !width ? "100%" : width - (group ? leftSidebarWidth : 0)
            }px`,
          }}
        >
          <Grid
            {...p}
            empty={empty}
            noHeader={noHeader}
            totalSecondsOfTimeline={totalSecondsOfTimeline}
            startOfTimeline={startOfTimeline}
          />
        </Box>
      </Box>
      {displayTimeIndicator && (
        <Box
          sx={{
            position: "absolute",
            left: group ? leftSidebarWidth : 0,
            width: `${
              !width ? "100%" : width - (group ? leftSidebarWidth : 0)
            }px`,
            bottom: 0,
            top: `${noHeader ? 0 : headerHeight}px`,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              pointerEvents: "none",
              left: widthToPct(
                (720 * (now.getTime() - start)) / totalSecondsOfTimeline
              ),
              height: "100%",
            }}
          >
            <TimeIndicator />
          </Box>
        </Box>
      )}

      <Box
        className="timeline"
        sx={{
          position: "relative",
          flex: 1,
          overflow: "auto",
        }}
        component="div"
        ref={(el: HTMLDivElement | null) => {
          setScrollableRef(el);
          eventContainerRef.current = el;
        }}
      >
        {/* To measure the width/height of the container */}
        <Box
          ref={setWrapperRef}
          sx={{
            position: "absolute",
            overflow: "hidden",
            inset: 0,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            // backgroundColor: "yellow",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              height: `${scrollLength}px`,
              width: `64px`,
              position: "absolute",
              pointerEvents: "none",
              overflow: "hidden",
            }}
          ></Box>
          <Box
            style={{
              transform: `translateY(${startIndex * 17}px)`,
              pointerEvents: "all",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            {group && (
              <Box
                sx={{
                  width: `${leftSidebarWidth}px`,
                  flexShrink: 0,
                }}
                className="group-marker"
              >
                {eventGroupMap
                  .slice(startIndex, endIndex + 1)
                  .map((group, index) => {
                    if (!group) {
                      return null;
                    }
                    let last = false;
                    if (
                      eventGroupMap[index + startIndex + 1]?.key !== group.key
                    ) {
                      last = true;
                    }

                    if (last) {
                      return (
                        <Box
                          sx={{
                            height: "17px",
                            borderBottom:
                              "3px solid " + (group.color ?? DEFAULT_COLOR),
                            borderRight:
                              "3px solid " + (group.color ?? DEFAULT_COLOR),
                            position: "relative",
                            overflow: "hidden",
                          }}
                          key={startIndex + index}
                        >
                          <Tooltip title={group.title} placement="top">
                            <Typography
                              variant="caption"
                              sx={{
                                position: "absolute",
                                top: "-2px",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                width: "100%",
                                overflow: "hidden",
                              }}
                            >
                              {group.title}
                            </Typography>
                          </Tooltip>
                        </Box>
                      );
                    }
                    return (
                      <Box
                        sx={{
                          height: "17px",
                          borderRight:
                            "3px solid " + (group.color ?? DEFAULT_COLOR),
                        }}
                        key={startIndex + index}
                      ></Box>
                    );
                  })}
              </Box>
            )}
            <Box sx={{ flex: 1 }}>
              {rows.slice(startIndex, endIndex + 1).map((row, index) => {
                let draggedEventForRow:
                  | DraggedEvent<ModifiableEvent<T>>
                  | undefined;

                if (
                  row.some(
                    (r) => r.sourceEvent === draggedEvent?.source.sourceEvent
                  )
                ) {
                  draggedEventForRow = draggedEvent;
                }

                return (
                  <Row
                    row={row}
                    key={startIndex + index}
                    draggedEvent={draggedEventForRow}
                    rowIndex={startIndex + index}
                    timelineStart={timelineStart}
                    timelineEnd={timelineEnd}
                    resolution={resolution}
                    defaultEventColor={defaultEventColor}
                    now={now}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const initial = Symbol();
/**
 * Use like `console.log(useDebugDeps([a, b, c]))` where `[a, b, c]` are the dependencies to e.g. a useEffect. This will log when one of the deps change
 * @public
 */
export const useDebugDeps = (...deps: unknown[]) => {
  const previousDeps = React.useRef<unknown[]>(deps.map(() => initial));
  const diffingDeps: unknown[] = [];
  deps.forEach((dep, index) => {
    const prev = previousDeps.current[index];
    if (prev === initial) {
      diffingDeps.push(tuple("initial_render", index, dep));
    } else if (prev !== dep) {
      diffingDeps.push(tuple(index, prev, dep));
    }
  });
  previousDeps.current = deps;
  return diffingDeps;
};

const Row = React.memo(function Row<T>({
  row,
  rowIndex,
  draggedEvent,
  timelineStart,
  timelineEnd,
  resolution,
  defaultEventColor,
  now,
}: {
  row: ModifiableEvent<T>[];
  rowIndex: number;
  draggedEvent?: DraggedEvent<ModifiableEvent<T>>;
  timelineStart: Date;
  timelineEnd: Date;
  resolution: TimelineResolution;
  defaultEventColor: string;
  now: Date;
}) {
  const start = timelineStart.getTime();
  const end = timelineEnd.getTime();
  const totalSecondsOfTimeline = end - start;
  const theme = useTheme();

  return (
    <Box
      style={{
        display: "flex",
        position: "relative",
        height: "17px",
      }}
    >
      {row.map((event, evIndex) => {
        const dragged = draggedEvent?.source.sourceEvent === event.sourceEvent;
        const bg = event.sourceEvent.styling?.bg ?? defaultEventColor ?? DEFAULT_COLOR;
        const textColor = event.sourceEvent.styling?.textColor ?? theme.palette.text.primary;
        return (
          <RowEvent
            key={evIndex}
            event={event}
            draggedEvent={dragged ? draggedEvent : undefined}
            start={start}
            totalSecondsOfTimeline={totalSecondsOfTimeline}
            rowIndex={rowIndex}
            evIndex={evIndex}
            resolution={resolution}
            bg={bg}
            textColor={textColor}
          />
        );
      })}
    </Box>
  );
});

const RowEvent = React.memo(function RowEvent<T>({
  draggedEvent,
  event,
  start,
  totalSecondsOfTimeline,
  rowIndex,
  evIndex,
  resolution,
  bg,
  textColor,
}: {
  draggedEvent?: DraggedEvent<ModifiableEvent<T>>;
  event: ModifiableEvent<T>;
  start: number;
  totalSecondsOfTimeline: number;
  rowIndex: number;
  evIndex: number;
  resolution: TimelineResolution;
  bg: string;
  textColor: string;
}) {
  let evStart = event.start;
  let evEnd = event.end;

  let dragged = false;

  if (draggedEvent?.dragged) {
    dragged = true;
    const newDragged = {
      ...draggedEvent.source,
      ...draggedEvent.dragged,
    };

    newDragged.end = max([
      newDragged.end,
      addMilliseconds(newDragged.start, minRenderedEventDuration(resolution)),
    ]);

    evStart = newDragged.start;
    evEnd = newDragged.end;
  }

  const x = widthToPct(
    (720 * (evStart.getTime() - start)) / totalSecondsOfTimeline
  );
  const w = widthToPct(
    (720 * (evEnd.getTime() - evStart.getTime())) / totalSecondsOfTimeline
  );

  let width = differenceInCalendarDays(evEnd, evStart);
  if (evEnd.getTime() === endOfDay(evEnd).getTime()) {
    width += 1;
  }

  const title = event.sourceEvent.title ?? "(No title)";

  const dataProps: any = {
    "data-type": "timeline-event",
    "data-calendar-event": JSON.stringify({
      x: 0,
      colX: 0,
      index: `${rowIndex}|${evIndex}`,
      w: Math.max(width, 1),
    }),
  };

  const theme = useTheme();

  let extraStyle: React.CSSProperties = {};
  let p = 8;

  if (event.sourceEvent.selected) {
    extraStyle = {
      boxShadow: theme.shadows[6],
      border: `1px solid ${theme.palette.primary.main}`,
    };
    p = 7;
  }

  return (
    <React.Fragment>
      <Box
        zIndex={2}
        component={Button}
        {...dataProps}
        style={{
          minWidth: "auto",
          width: w,
          left: x,
          height: "16px",
          position: "absolute",
          borderRadius: "4px",
          padding: 0,
          margin: 0,
          zIndex: dragged ? 2 : 1,
          paddingLeft: 0,
          paddingRight: 0,
          background: "white",
          overflow: "hidden",
          ...extraStyle,
        }}
      >
        <Box
          style={{
            height: "16px",
            backgroundColor: bg,
            display: "flex",
            justifyContent: "center",
            flex: 1,
            alignItems: "center",
            flexShrink: 1,
            whiteSpace: "nowrap",
            padding: 0,
            pointerEvents: "none",
            width: "100%",
            overflow: "flex",
          }}
        >
          <Box
            style={{
              paddingLeft: p + "px",
              paddingRight: p + "px",
              flexShrink: 1,
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <Typography variant="event" style={{ color: textColor }}>
              {title}
            </Typography>
            {event.sourceEvent.endAdornment ? (
              <>
                <Box sx={{ flex: 1 }}></Box>
                <Box>{event.sourceEvent.endAdornment({ bg, textColor })}</Box>
              </>
            ) : null}
          </Box>
        </Box>

        {event.sourceEvent.canEdit &&
          (["start", "end"] as const).map((pos, i) => (
            <Box
              key={i}
              className="resize-event"
              {...dataProps}
              data-drag-source="resize-event"
              data-resize-pos={pos}
              style={{
                height: "100%",
                width: "max(min(4%, 4px), 1px)",
                flexShrink: 0,
                position: "absolute",
                zIndex: 1,
                top: 0,
                bottom: 0,
                cursor: "ew-resize",
                left: pos === "start" ? 0 : undefined,
                right: pos === "start" ? undefined : 0,
              }}
            ></Box>
          ))}
      </Box>
    </React.Fragment>
  );
});

const getTimelineRange = (
  resolution: TimelineResolution,
  startTime: Date
): [Date, Date] => {
  if (resolution === "month") {
    return [startTime, addWeeks(startTime, 6)];
  }
  if (resolution === "3-months") {
    return [startTime, addWeeks(startTime, 15)];
  }
  if (resolution === "year") {
    return [startTime, addQuarters(startTime, 4)];
  }
  if (resolution === "3-years") {
    return [startTime, addYears(startTime, 3)];
  }
  throw new Error("Invalid resolution");
};

const constrainEvent = (
  resolution: TimelineResolution,
  startTime: Date,
  _start: Date,
  _end: Date
) => {
  const [timelineStart, timelineEnd] = getTimelineRange(resolution, startTime);

  let minDuration = minRenderedEventDuration(resolution);
  // start will be within timeline
  // more than left bound
  let start = max([_start, timelineStart]);
  // less than right - minDuration
  start = min([start, subMilliseconds(timelineEnd, minDuration)]);

  // less than right bound
  let end = min([_end, timelineEnd]);
  // more than left + minDuration
  end = max([end, addMilliseconds(timelineStart, minDuration)]);

  // event width must be at least minDuration
  end = max([addMilliseconds(start, minDuration), end]);

  return {
    start: start,
    end: end,
  };
};

function parseEventsInTimeline<T>(
  rows: ModifiableEvent<T>[][],
  resolution: TimelineResolution,
  startTime: Date
) {
  const [timelineStart, timelineEnd] = getTimelineRange(resolution, startTime);

  const rowsInTimeline: ModifiableEvent<T>[][] = rows.map((events) =>
    events
      .filter((event) => {
        return areIntervalsOverlapping(
          {
            start: timelineStart,
            end: timelineEnd,
          },
          { start: event.start, end: event.end }
        );
      })
      .map((event) => {
        const { start, end } = constrainEvent(
          resolution,
          startTime,
          event.start,
          event.end
        );
        return { sourceEvent: event.sourceEvent, start, end };
      })
  );
  return rowsInTimeline;
}

function TimeIndicator(boxProps: BoxProps) {
  return (
    <Box
      className="time-indicator"
      {...boxProps}
      sx={mergeSx(boxProps.sx, {
        width: "3px",
        marginLeft: "-1.5px",
        marginTop: "0px",
        position: "absolute",
        overflow: "hidden",
        height: "100%",
      })}
    >
      <Box
        sx={{
          position: "absolute",
          backgroundColor: (theme) => theme.palette.background.default,
          width: "3px",
          height: "100%",
          left: 0,
          top: "0px",
        }}
      ></Box>
      <Box
        sx={{
          position: "absolute",
          background: "#FFA000",
          width: "1px",
          height: "100%",
          left: "1px",
          top: "0px",
          borderRadius: "1px",
        }}
      ></Box>
    </Box>
  );
}
