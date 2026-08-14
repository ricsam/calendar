import { Button, Chip, IconButton, Typography } from "@mui/material";
import { addMonths, addWeeks, format, subMonths, subWeeks } from "date-fns";
import React from "react";
import { FlexRow } from "../wrappers";
import { ChevronLeft, ChevronRight } from "./chevrons";
import { parseProps } from "./parse_props";

export function CalendarNav(props: {
  now?: Date;
  time?: Date;
  setTime?: (newTime: Date) => void;
  type: "week" | "month";
}) {
  const parsedProps = parseProps(props);
  const { now, time, setTime } = parsedProps;

  const functions: Record<
    "week" | "month",
    Record<"left" | "right", (val: Date) => Date>
  > = {
    month: {
      left: (val) => subMonths(val, 1),
      right: (val) => addMonths(val, 1),
    },
    week: {
      left: (val) => subWeeks(val, 1),
      right: (val) => addWeeks(val, 1),
    },
  };

  const onPressLeft = !setTime
    ? undefined
    : () => {
        setTime(functions[props.type].left(time));
      };

  const onPressToday = !setTime
    ? undefined
    : () => {
        setTime(now);
      };

  const onPressRight = !setTime
    ? undefined
    : () => {
        setTime(functions[props.type].right(time));
      };

  return (
    <FlexRow
      justifyContent="flex-start"
      px="22px"
      py="14px"
      gap={3}
      alignItems="center"
      zIndex={1}
    >
      <Button variant="outlined" onClick={onPressToday}>
        Today
      </Button>
      <FlexRow>
        <IconButton onClick={onPressLeft}>
          <ChevronLeft />
        </IconButton>
        <IconButton onClick={onPressRight}>
          <ChevronRight />
        </IconButton>
      </FlexRow>

      <MonthYearRowDate date={time} />
      {props.type === "week" && <WeekChip date={time} />}
    </FlexRow>
  );
}

function MonthYearRowDate({ date }: { date: Date }) {
  const monthYear = format(date, "MMM yyyy");

  return (
    <FlexRow width={106} height={32}>
      <Typography
        variant="h5"
        sx={{ color: (theme) => theme.palette.text.primary }}
      >
        {monthYear}
      </Typography>
    </FlexRow>
  );
}

function WeekChip({ date }: { date: Date }) {
  const weekNr = format(date, "w");

  return <Chip label={`Week ${weekNr}`} sx={{ height: 32 }} />;
}
