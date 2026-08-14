import { Box, Button, Typography } from "@mui/material";
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  differenceInMilliseconds,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  getMonth,
  isSameDay,
  isSameMonth,
  isSameQuarter,
  isSameWeek,
  isSameYear,
  startOfMonth,
  StartOfWeekOptions,
} from "date-fns";
import { StartDay, TimelineResolution } from "../types";
import { FlexCol, FlexRow } from "../wrappers";
import { widthToPct } from "./to_pct";

function WeekHeader({
  startTime,
  now,
  onCreateEvent,
}: {
  startTime: Date;
  now: Date;
  startDay: StartDay;
  onCreateEvent?: (start: Date, end?: Date | undefined) => void;
}) {
  const days: Date[] = [];
  for (let i = 0; i < 7; i += 1) {
    days.push(addDays(startTime, i));
  }
  return (
    <FlexCol sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <BigTime
        now={now}
        times={days}
        isActive={isSameDay}
        formatDate={(date) => format(date, "EEE d")}
        width={720 / 7}
        textSize="h5"
        verticalAlign="center"
        onCreateEvent={
          onCreateEvent
            ? (start) => onCreateEvent(start, endOfDay(start))
            : undefined
        }
      />
    </FlexCol>
  );
}

function MonthHeader({
  startTime,
  now,
  onCreateEvent,
  startDay,
}: {
  startTime: Date;
  now: Date;
  onCreateEvent?: (start: Date, end: Date) => void;
  startDay: StartDay;
}) {
  const options: StartOfWeekOptions = {
    weekStartsOn: startDay === "monday" ? 1 : 0,
  };
  const weeks: Date[] = [];
  const days: Date[] = [];
  for (let i = 0; i < 6; i += 1) {
    for (let j = 0; j < 7; j += 1) {
      if (j === 0) {
        weeks.push(addDays(startTime, i * 7));
      }
      const k = i * 7 + j;
      days.push(addDays(startTime, k));
    }
  }
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <BigTime
        now={now}
        times={weeks}
        isActive={isSameWeek}
        formatDate={(date) => {
          return `W${format(date, "I")}`;
        }}
        width={119}
        onCreateEvent={
          onCreateEvent
            ? (start) => {
                onCreateEvent(start, endOfWeek(start, options));
              }
            : undefined
        }
      />
      <FlexRow sx={{ position: "relative", flex: 1 }}>
        {days.map((day, index) => {
          let w = 17;
          if (index === 0) {
            w = 16;
          }
          w += 1 / 7;
          return (
            <FlexRow key={index} sx={{ width: widthToPct(w), height: "100%" }}>
              {index !== 0 && (
                <Box
                  sx={{
                    width: "1px",
                    flexShrink: 0,
                  }}
                ></Box>
              )}
              <Box
                component={onCreateEvent ? Button : "div"}
                onClick={
                  onCreateEvent
                    ? () => onCreateEvent(day, endOfDay(day))
                    : undefined
                }
                sx={{
                  display: "flex",
                  flex: 1,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  flexDirection: "row",
                  position: "relative",
                  minWidth: "auto",
                  p: 0,
                  m: 0,
                  pt: "4px",
                  // height: '16px',
                  height: `100%`,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    height: "16px",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <FlexCol
                    alignItems="center"
                    justifyContent="flex-start"
                    sx={{ width: "100%", height: "16px" }}
                  >
                    <Typography
                      variant="event"
                      sx={{
                        fontSize: "8px",
                        lineHeight: "8px",
                        color: (theme) => {
                          return theme.palette.text[
                            isSameDay(day, now) ? "primary" : "secondary"
                          ];
                        },
                      }}
                    >
                      {format(day, "d")}
                    </Typography>
                    {isSameDay(day, now) && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          width: "100%",
                          pt: "1px",
                        }}
                      >
                        <Box
                          sx={{
                            background: (theme) => theme.palette.primary.main,
                            height: "1px",
                            width: `min(${(100 * 8) / w}%, 12px)`,
                            borderRadius: "1px",
                          }}
                        ></Box>
                      </Box>
                    )}
                  </FlexCol>
                </Box>
              </Box>
            </FlexRow>
          );
        })}
      </FlexRow>
    </Box>
  );
}

function ThreeMonthHeader({
  startTime,
  now,
  startDay,
  onCreateEvent,
}: {
  startTime: Date;
  now: Date;
  startDay: StartDay;
  onCreateEvent?: (start: Date, end: Date) => void;
}) {
  const monthMap = new Map<number, Date>();
  const weeks: Date[] = [];
  for (let i = 0; i < 15; i += 1) {
    const week = addWeeks(startTime, i);
    weeks.push(week);
    const month = getMonth(week);
    if (!monthMap.has(month)) {
      monthMap.set(month, startOfMonth(week));
    }
  }
  const months: Date[] = Array.from(monthMap.values());

  const totalWidth = differenceInMilliseconds(
    addWeeks(startTime, 15),
    startTime,
  );

  const options: StartOfWeekOptions = {
    weekStartsOn: startDay === "monday" ? 1 : 0,
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ position: "relative", height: "60px", width: "100%" }}>
        <>
          {months.flatMap((month, index) => {
            const xStart = month.getTime() - startTime.getTime();
            const xWidth = differenceInMilliseconds(
              startOfMonth(addMonths(month, 1)),
              month,
            );

            return (
              <Box
                key={index}
                component={onCreateEvent ? Button : "div"}
                onClick={
                  onCreateEvent
                    ? () => onCreateEvent(month, endOfMonth(month))
                    : undefined
                }
                sx={{
                  width: widthToPct((720 * xWidth) / totalWidth),
                  height: "60px",
                  overflow: "hidden",
                  left: widthToPct((720 * xStart) / totalWidth),
                  position: "absolute",
                  display: "flex",
                  alignItems: "stretch",
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  minWidth: "auto",
                  p: 0,
                  m: 0,
                }}
                justifyContent={"center"}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      collor: (theme) =>
                        theme.palette.text[
                          isSameMonth(month, now) ? "primary" : "secondary"
                        ],
                    }}
                  >
                    {format(month, "MMM")}
                  </Typography>
                  {isSameMonth(month, now) && (
                    <Box
                      sx={{
                        background: (theme) => theme.palette.primary.main,
                        height: "2px",
                        width: "100%",
                        borderRadius: "2px",
                      }}
                    ></Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </>
      </Box>
      <SmallTime
        formatDate={(date) => "W" + format(date, "I")}
        times={weeks}
        noBorderMod={4}
        isActive={(d) => {
          const options: StartOfWeekOptions = {
            weekStartsOn: startDay === "monday" ? 1 : 0,
          };
          return isSameWeek(d, now, options);
        }}
        onCreateEvent={
          onCreateEvent
            ? (start) => {
                onCreateEvent(start, endOfWeek(start, options));
              }
            : undefined
        }
      />
    </Box>
  );
}

function YearHeader({
  startTime,
  now,
  onCreateEvent,
}: {
  startTime: Date;
  now: Date;
  startDay: StartDay;
  onCreateEvent?: (start: Date, end: Date) => void;
}) {
  const quarters: Date[] = [];
  const months: Date[] = [];
  // 4 quarters
  for (let i = 0; i < 4; i += 1) {
    // 3 months
    for (let j = 0; j < 3; j += 1) {
      if (j === 0) {
        quarters.push(addMonths(startTime, i * 3));
      }
      const k = i * 3 + j;
      months.push(addMonths(startTime, k));
    }
  }
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <BigTime
        now={now}
        times={quarters}
        isActive={isSameQuarter}
        formatDate={(date) => {
          return format(date, "qqq");
        }}
        width={179}
        onCreateEvent={
          onCreateEvent
            ? (start) => {
                onCreateEvent(start, endOfQuarter(start));
              }
            : undefined
        }
      />
      <SmallTime
        formatDate={(date) => format(date, "MMM")}
        times={months}
        noBorderMod={3}
        isActive={(d) => isSameMonth(d, now)}
        onCreateEvent={
          onCreateEvent
            ? (start) => {
                onCreateEvent(start, endOfMonth(start));
              }
            : undefined
        }
      />
    </Box>
  );
}

function ThreeYearHeader({
  startTime,
  now,
  onCreateEvent,
}: {
  startTime: Date;
  now: Date;
  onCreateEvent?: (start: Date, end: Date) => void;
}) {
  const years: Date[] = [];
  const quarters: Date[] = [];
  // 3 years
  for (let i = 0; i < 3; i += 1) {
    // 4 quarters per year
    for (let j = 0; j < 4; j += 1) {
      if (j === 0) {
        years.push(addYears(startTime, i));
      }
      quarters.push(addQuarters(addYears(startTime, i), j));
    }
  }
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
      }}
    >
      <BigTime
        now={now}
        times={years}
        isActive={isSameYear}
        formatDate={(date) => {
          return format(date, "yyyy");
        }}
        width={239}
        onCreateEvent={
          onCreateEvent
            ? (start) => {
                onCreateEvent(start, endOfYear(start));
              }
            : undefined
        }
      />
      <SmallTime
        formatDate={(date) => format(date, "qqq")}
        times={quarters}
        noBorderMod={4}
        isActive={(d) => isSameQuarter(d, now)}
        onCreateEvent={
          onCreateEvent
            ? (start) => {
                onCreateEvent(start, endOfQuarter(start));
              }
            : undefined
        }
      />
    </Box>
  );
}

export function Header(props: {
  startTime: Date;
  resolution: TimelineResolution;
  now: Date;
  startDay: StartDay;
  empty: boolean;
  onCreateEvent?: (start: Date, end: Date) => void;
}) {
  const { resolution } = props;

  if (resolution === "week") {
    return <WeekHeader {...props} />;
  }
  if (resolution === "month") {
    return <MonthHeader {...props} />;
  }
  if (resolution === "3-months") {
    return <ThreeMonthHeader {...props} />;
  }
  if (resolution === "year") {
    return <YearHeader {...props} />;
  }
  if (resolution === "3-years") {
    return <ThreeYearHeader {...props} />;
  }
  throw new Error("Invalid resolution");
}
function BigTime({
  now,
  times,
  isActive,
  formatDate,
  width,
  onCreateEvent,
  textSize,
  verticalAlign,
}: {
  now: Date;
  times: Date[];
  isActive: (a: Date, now: Date) => boolean;
  formatDate: (date: Date) => string;
  width: number;
  onCreateEvent?: (start: Date) => void;
  textSize?: "h3" | "h4" | "h5";
  verticalAlign?: "flex-start" | "center";
}) {
  return (
    <FlexRow>
      {times.flatMap((time, index) => {
        const els = [
          <FlexRow
            key={index}
            component={onCreateEvent ? Button : undefined}
            onClick={onCreateEvent ? () => onCreateEvent(time) : undefined}
            sx={{
              width: widthToPct(width),
              overflow: "hidden",
              p: 0,
              m: 0,
              height: "56px",
              display: "flex",
              alignItems: verticalAlign ?? "flex-start",
            }}
            justifyContent={"center"}
          >
            <Box>
              <Typography
                variant={textSize ?? "h4"}
                sx={{
                  color: (theme) =>
                    theme.palette.text[
                      isActive(time, now) ? "primary" : "secondary"
                    ],
                  whiteSpace: "nowrap",
                }}
              >
                {formatDate(time)}
              </Typography>
              {isActive(time, now) && (
                <Box
                  sx={{
                    background: (theme) => theme.palette.primary.main,
                    height: "2px",
                    width: "100%",
                    borderRadius: "2px",
                  }}
                ></Box>
              )}
            </Box>
          </FlexRow>,
        ];
        if (index < times.length - 1) {
          els.push(
            <Box
              key={index + "divider"}
              sx={{
                width: "1px",
                height: "16px",
              }}
            >
              <Box
                sx={{
                  width: "1px",
                  height: "48px",
                  background: (theme) => "none",
                  borderRadius: "1px",
                }}
              ></Box>
            </Box>,
          );
        }
        return els;
      })}
    </FlexRow>
  );
}

function SmallTime({
  times,
  formatDate,
  noBorderMod,
  isActive,
  onCreateEvent,
}: {
  times: Date[];
  formatDate: (date: Date) => string;
  noBorderMod: number;
  isActive: (date: Date) => boolean;
  onCreateEvent?: (start: Date) => void;
}) {
  return (
    <FlexRow justifyContent="space-between" sx={{ flex: 1 }}>
      {times.flatMap((week, index) => {
        const els = [
          <Box
            key={index}
            component={onCreateEvent ? Button : "div"}
            onClick={onCreateEvent ? () => onCreateEvent(week) : undefined}
            className="small-time-button"
            sx={{
              overflow: "hidden",
              p: 0,
              m: 0,
              display: "flex",
              minWidth: "auto",
              flex: 1,
              justifyContent: "center",
              alignItems: "stretch",
              height: `100%`,
            }}
          >
            <Box sx={{ height: "20px" }}>
              <Typography
                variant="body2"
                sx={{ color: (theme) => theme.palette.text.secondary }}
              >
                {formatDate(week)}
              </Typography>
              {isActive(week) ? (
                <Box
                  sx={{
                    background: (theme) => theme.palette.primary.main,
                    height: "2px",
                    borderRadius: "2px",
                    width: "100%",
                  }}
                ></Box>
              ) : null}
            </Box>
          </Box>,
        ];
        if (index !== 0) {
          els.unshift(
            <Box
              key={index + "divider"}
              sx={{
                width: "1px",
                height: "16px",
              }}
            >
              <Box
                sx={{
                  width: "1px",
                  height: 16,
                  background:
                    index % noBorderMod === 0 ? "none" : (theme) => "none",
                  borderTopLeftRadius: "1px",
                  borderTopRightRadius: "1px",
                }}
              ></Box>
            </Box>,
          );
        }
        return els;
      })}
    </FlexRow>
  );
}
