import { Box, Typography } from "@mui/material";
import {
  addDays,
  isSameWeek,
  format,
  isSameDay,
  addMonths,
  addWeeks,
  isSameMonth,
  StartOfWeekOptions,
  isSameQuarter,
  addYears,
  addQuarters,
  isSameYear,
  getMonth,
  startOfMonth,
  startOfWeek,
  differenceInMilliseconds,
} from "date-fns";
import { TimelineResolution, StartDay } from "../types";
import { FlexRow, FlexCol } from "../wrappers";
import { widthToPct } from "./to_pct";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <Box sx={{ position: "absolute", inset: 0 }}>{children}</Box>;
}

function WeekGrid({
  startTime,
  startOfTimeline,
  totalSecondsOfTimeline,
}: {
  startTime: Date;
  noHeader?: boolean;
  startOfTimeline: number;
  totalSecondsOfTimeline: number;
}) {
  const days: Date[] = [];
  for (let i = 0; i < 7; i += 1) {
    days.push(addDays(startTime, i));
  }
  return (
    <Wrapper>
      <BigTime
        times={days}
        startOfTimeline={startOfTimeline}
        totalSecondsOfTimeline={totalSecondsOfTimeline}
      />
    </Wrapper>
  );
}

function MonthHeader({
  startTime,
  noHeader,
  startOfTimeline,
  totalSecondsOfTimeline,
}: {
  startTime: Date;
  noHeader?: boolean;
  startOfTimeline: number;
  totalSecondsOfTimeline: number;
}) {
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
    <>
      <BigTime
        times={weeks}
        startOfTimeline={startOfTimeline}
        totalSecondsOfTimeline={totalSecondsOfTimeline}
      />
      {!noHeader && (
        <Box sx={{ position: "absolute", inset: 0 }}>
          <FlexRow
            className="grid-line"
            sx={{
              position: "absolute",
              top: "56px",
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {days.map((day, index) => {
              let w = 17;
              if (index === 0) {
                w = 16;
              }
              w += 1 / 7;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    width: widthToPct(w),
                    alignItems: "center",
                    height: "18px",
                    position: "relative",
                  }}
                >
                  {index !== 0 && (
                    <Box
                      sx={{
                        width: "1px",
                        borderRadius: "1px",
                        height: "18px",
                        backgroundColor:
                          index % 7 === 0
                            ? "none"
                            : (theme) => theme.palette.divider,
                        marginTop: "0px",
                      }}
                    ></Box>
                  )}
                  <FlexRow
                    justifyContent="center"
                    alignItems={"center"}
                    sx={{ width: widthToPct(w - 1), height: "16px" }}
                  ></FlexRow>
                </Box>
              );
            })}
          </FlexRow>
        </Box>
      )}
    </>
  );
}

function ThreeMonthHeader({
  startTime,
  noHeader,
  startOfTimeline,
  totalSecondsOfTimeline,
}: {
  startTime: Date;
  noHeader?: boolean;
  startOfTimeline: number;
  totalSecondsOfTimeline: number;
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

  return (
    <Wrapper>
      {!noHeader && (
        <Box sx={{ position: "absolute", inset: 0 }}>
          <>
            {months.flatMap((month, index) => {
              const xStart = month.getTime() - startTime.getTime();

              return (
                <Box
                  key={index + "divider"}
                  sx={{
                    width: "1px",
                    height: 44,
                    position: "absolute",
                    left: widthToPct((720 * xStart) / totalWidth),
                  }}
                >
                  <Box
                    sx={{
                      width: "1px",
                      height: "100%",
                      background: (theme) => theme.palette.divider,
                      borderRadius: "1px",
                    }}
                  ></Box>
                </Box>
              );
            })}
          </>
        </Box>
      )}

      <SmallTime
        top={noHeader ? 0 : 60}
        times={weeks}
        noBorderMod={0}
        startOfTimeline={startOfTimeline}
        totalSecondsOfTimeline={totalSecondsOfTimeline}
      />
    </Wrapper>
  );
}

function YearHeader({
  startTime,
  noHeader,
  startOfTimeline,
  totalSecondsOfTimeline,
}: {
  startTime: Date;
  startOfTimeline: number;
  totalSecondsOfTimeline: number;
  noHeader?: boolean;
}) {
  const quarters: Date[] = [];
  const months: Date[] = [];
  // 4 quarters
  for (let i = 0; i < 4; i += 1) {
    // 3 months
    for (let j = 0; j < 3; j += 1) {
      if (j === 0) {
        quarters.push(addMonths(startOfMonth(startTime), i * 3));
      }
      const k = i * 3 + j;
      months.push(addMonths(startOfMonth(startTime), k));
    }
  }
  return (
    <Wrapper>
      <BigTime
        times={quarters}
        startOfTimeline={startOfTimeline}
        totalSecondsOfTimeline={totalSecondsOfTimeline}
      />
      <SmallTime
        times={months}
        noBorderMod={3}
        top={noHeader ? 0 : 56}
        startOfTimeline={startOfTimeline}
        totalSecondsOfTimeline={totalSecondsOfTimeline}
      />
    </Wrapper>
  );
}

function ThreeYearHeader({
  startTime,
  noHeader,
  startOfTimeline,
  totalSecondsOfTimeline,
}: {
  startTime: Date;
  startOfTimeline: number;
  totalSecondsOfTimeline: number;
  noHeader?: boolean;
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
    <Wrapper>
      <BigTime
        times={years}
        startOfTimeline={startOfTimeline}
        totalSecondsOfTimeline={totalSecondsOfTimeline}
      />
      <SmallTime
        times={quarters}
        noBorderMod={4}
        top={noHeader ? 0 : 56}
        startOfTimeline={startOfTimeline}
        totalSecondsOfTimeline={totalSecondsOfTimeline}
      />
    </Wrapper>
  );
}

export function Grid(props: {
  startTime: Date;
  startOfTimeline: number;
  totalSecondsOfTimeline: number;
  resolution: TimelineResolution;
  now: Date;
  startDay: StartDay;
  empty: boolean;
  noHeader?: boolean;
}) {
  const { resolution } = props;

  if (resolution === "week") {
    return <WeekGrid {...props} />;
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
  times,
  startOfTimeline,
  totalSecondsOfTimeline,
}: {
  times: Date[];
  startOfTimeline: number;
  totalSecondsOfTimeline: number;
}) {
  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      <FlexRow sx={{ height: "100%" }}>
        {times.flatMap((month, index) => {
          const x = widthToPct(
            (720 * (month.getTime() - startOfTimeline)) /
              totalSecondsOfTimeline,
          );
          const els = [];
          if (index > 0) {
            els.push(
              <Box
                key={index + "divider"}
                className="big-time-divider"
                sx={{
                  width: "1px",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: x,
                }}
              >
                <Box
                  sx={{
                    width: "1px",
                    height: "100%",
                    background: (theme) => theme.palette.divider,
                    borderRadius: "1px",
                  }}
                ></Box>
              </Box>,
            );
          }
          return els;
        })}
      </FlexRow>
    </Box>
  );
}

function SmallTime({
  times,
  noBorderMod,
  top,
  startOfTimeline,
  totalSecondsOfTimeline,
}: {
  times: Date[];
  noBorderMod?: number;
  top: number;
  startOfTimeline: number;
  totalSecondsOfTimeline: number;
}) {
  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      <FlexRow
        sx={{
          top: `${top}px`,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {times.flatMap((week, index) => {
          const els = [
            <FlexRow key={index} justifyContent="center" flex="1"></FlexRow>,
          ];
          const x = widthToPct(
            (720 * (week.getTime() - startOfTimeline)) / totalSecondsOfTimeline,
          );
          const divider = (index: number) => (
            <Box
              key={index + "divider"}
              className="small-time-divider"
              sx={{
                width: "1px",
                height: "100%",
                position: "absolute",
                top: 0,
                bottom: 0,
                left: x,
              }}
            >
              <Box
                sx={{
                  width: "1px",
                  height: "100%",
                  background:
                    noBorderMod !== undefined
                      ? index % noBorderMod === 0
                        ? "none"
                        : (theme) => theme.palette.divider
                      : (theme) => theme.palette.divider,
                  borderRadius: "1px",
                }}
              ></Box>
            </Box>
          );

          // don't put borders on left and right
          if (index !== 0) {
            els.unshift(divider(index));
          }

          // put borders on left and right
          // els.unshift(divider(index));
          // if (index === times.length - 1) {
          //   els.push(divider(index + 1));
          // }

          return els;
        })}
      </FlexRow>
    </Box>
  );
}
