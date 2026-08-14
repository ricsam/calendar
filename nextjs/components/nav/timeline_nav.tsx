import {
  Box,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import {
  StartOfWeekOptions,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import React from "react";
import { StartDay, TimelineResolution, TimelineSpeed } from "../types";
import { FlexCol, FlexRow } from "../wrappers";
import { TodayButton } from "./today_button";
import { parseProps } from "./parse_props";
import { ChevronLeft, ChevronRight } from "./chevrons";

/**
 * A list of all resolutions that can be selected for the timeline
 */
export const allResolutions: TimelineResolution[] = [
  "week",
  "month",
  "3-months",
  "year",
  "3-years",
];

/**
 * A list of all speeds that can be selected for the timeline
 */
const allSpeeds: TimelineSpeed[] = [
  "day",
  "week",
  "month",
  "3-months",
  "quarter",
  "year",
  "3-years",
];

/**
 * A list of speeds for each resolution
 */
export const speeds: Record<TimelineResolution, TimelineSpeed[]> = {
  week: ["day", "week"],
  month: ["week", "month"],
  "3-months": ["week", "month", "3-months"],
  year: ["quarter", "year"],
  "3-years": ["year", "3-years"],
};

export function TimelineNav(props: {
  /**
   * When clicking the Today button, this is the date that will be set
   */
  now?: Date;

  /**
   * For week views, is the week starting on Sunday or Monday
   */
  startDay?: StartDay;

  /**
   * The starting date in the timeline
   */
  time?: Date;
  /**
   * Update the starting date in the timeline. When navigating the timeline, this will be called
   */
  setTime?: (newTime: Date) => void;

  /**
   * Control the resolution of the timeline
   */
  resolution?: TimelineResolution;
  setResolution?: (newResolution: TimelineResolution) => void;

  /**
   * Control the speed of the timeline
   */
  speed?: TimelineSpeed;
  setSpeed?: (newSpeed: TimelineSpeed) => void;
}) {
  const parsedProps = parseProps(props);
  const { now, time: currentDate, setTime } = parsedProps;
  const { startDay = "monday" } = props;

  const options: StartOfWeekOptions = {
    weekStartsOn: startDay === "monday" ? 1 : 0,
  };

  const [localResolution, setLocalResolution] =
    React.useState<TimelineResolution>(props.resolution ?? "month");

  const resolution = props.resolution ?? localResolution;
  const setResolution = props.setResolution ?? setLocalResolution;

  const [localSpeed, setLocalSpeed] = React.useState<TimelineSpeed>(
    props.speed ?? speeds[resolution][0],
  );

  let speed = props.speed ?? localSpeed;

  if (!speeds[resolution].includes(speed)) {
    speed = speeds[resolution][0];
  }

  const setSpeed = props.setSpeed ?? setLocalSpeed;

  const functions: Record<
    TimelineSpeed,
    Record<"left" | "right", (val: Date) => Date>
  > = {
    day: {
      left: (val) => subDays(val, 1),
      right: (val) => addDays(val, 1),
    },
    week: {
      left: (val) => subDays(val, 7),
      right: (val) => addDays(val, 7),
    },
    month: {
      left: (val) => {
        if (resolution === "month" || resolution === "3-months") {
          return startOfWeek(
            startOfMonth(subMonths(endOfWeek(val, options), 1)),
            options,
          );
        }
        return subMonths(val, 1);
      },
      right: (val) => {
        if (resolution === "month" || resolution === "3-months") {
          return startOfWeek(
            startOfMonth(addMonths(endOfWeek(val, options), 1)),
            options,
          );
        }
        return addMonths(val, 1);
      },
    },
    "3-months": {
      left: (val) => startOfWeek(subWeeks(val, 15), options),
      right: (val) => startOfWeek(addWeeks(val, 15), options),
    },
    quarter: {
      left: (val) => subMonths(val, 3),
      right: (val) => addMonths(val, 3),
    },
    year: {
      left: (val) => subMonths(val, 12),
      right: (val) => addMonths(val, 12),
    },
    "3-years": {
      left: (val) => subYears(val, 3),
      right: (val) => addYears(val, 3),
    },
  };

  const onPressLeft = setTime
    ? () => {
        setTime(functions[speed].left(currentDate));
      }
    : undefined;
  const onPressRight = setTime
    ? () => {
        setTime(functions[speed].right(currentDate));
      }
    : undefined;

  const handleChange = (event: SelectChangeEvent) => {
    setSpeed(event.target.value as TimelineSpeed);
  };

  const timeFormats: Record<TimelineSpeed, string | (() => string)> = {
    day: "do",
    week: () => "W" + format(currentDate, "I"),
    month: () => {
      if (resolution === "month" || resolution === "3-months") {
        return format(endOfWeek(currentDate, options), "MMMM");
      }
      return format(currentDate, "MMMM");
    },
    "3-months": () =>
      `${format(endOfWeek(currentDate, options), "MMM")} – ${format(
        startOfWeek(addMonths(currentDate, 3), options),
        "MMM",
      )}`,
    quarter: "qqq",
    year: "yyyy",
    "3-years": () =>
      `${format(currentDate, "yyyy")} – ${format(
        addYears(currentDate, 2),
        "yyyy",
      )}`,
  };

  const getTimeLabel = (s: TimelineSpeed) => {
    const timeFormat = timeFormats[s];
    return typeof timeFormat === "function"
      ? timeFormat()
      : format(currentDate, timeFormat);
  };

  return (
    <FlexRow
      justifyContent="flex-start"
      gap={3}
      alignItems="center"
      zIndex={1}
      sx={{
        height: "48px",
        background: (theme) =>
          theme.palette.mode === "light" ? "#e1e1e1" : "#242424",
        px: 1.5,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        mb: 1,
      }}
    >
      <FlexRow gap={1}>
        {setResolution && (
          <>
            <Box
              sx={{
                background: (theme) => theme.palette.background.default,
                borderRadius: 1,
                display: "flex",
              }}
            >
              <Select
                value={resolution}
                onChange={(ev) => {
                  const newRes = ev.target.value as TimelineResolution;
                  setResolution(newRes);
                  if (
                    resolution !== newRes &&
                    !speeds[newRes].includes(speed)
                  ) {
                    // quarter and 3-months are similar, so we can switch between them
                    if (speed === "quarter" && newRes === "3-months") {
                      setSpeed("3-months");
                    } else if (speed === "3-months" && newRes === "year") {
                      setSpeed("quarter");
                    } else {
                      setSpeed(speeds[newRes][0]);
                    }
                  }
                }}
                size="small"
                sx={{
                  width: 160,
                }}
              >
                {allResolutions.map((value) => {
                  let title: string = value;
                  if (value === "week") {
                    title = "Week";
                  } else if (value === "3-months") {
                    title = "Quarter";
                  } else if (value === "3-years") {
                    title = "Three years";
                  } else if (value === "year") {
                    title = "Year";
                  } else if (value === "month") {
                    title = "Month";
                  }
                  return (
                    <MenuItem key={value} value={value}>
                      {title}
                    </MenuItem>
                  );
                })}
              </Select>
            </Box>
          </>
        )}
        <IconButton onClick={onPressLeft}>
          <ChevronLeft />
        </IconButton>
        <Box
          sx={{
            background: (theme) => theme.palette.background.default,
            borderRadius: 1,
            display: "flex",
          }}
        >
          <Select
            value={speed}
            onChange={handleChange}
            size="small"
            sx={{
              width: 160,
            }}
            renderValue={(value) => {
              if (value === "year" || value === "3-years") {
                return getTimeLabel(value);
              }
              return (
                <Box
                  sx={{ height: "24px", position: "relative" }}
                  className="wef"
                >
                  <Typography
                    sx={{ top: "-8px", position: "absolute", left: "0" }}
                  >
                    {getTimeLabel(value)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      top: "12px",
                      position: "absolute",
                      left: "0",
                      color: (theme) => theme.palette.text.secondary,
                    }}
                  >
                    {allSpeeds
                      .slice(allSpeeds.indexOf(value) + 1)
                      .filter((speed) => !speed.includes("-"))
                      .map(getTimeLabel)
                      .join(", ")}
                  </Typography>
                </Box>
              );
            }}
          >
            {speeds[resolution].map((value) => (
              <MenuItem key={value} value={value}>
                {getTimeLabel(value)}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <IconButton onClick={onPressRight}>
          <ChevronRight />
        </IconButton>
      </FlexRow>

      <Box flex={1} />
      <FlexCol
        sx={{
          width: "140px",
          alignItems: "flex-end",
          whiteSpace: "nowrap",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: (theme) => theme.palette.text.secondary }}
        >
          {format(now, "LLLL do yyyy")}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: (theme) => theme.palette.text.secondary }}
        >
          W{format(now, "I")}, {format(now, "qqq")}
        </Typography>
      </FlexCol>
      <TodayButton
        onPress={
          setTime
            ? () => {
                setTime(now);
              }
            : undefined
        }
      />
    </FlexRow>
  );
}
