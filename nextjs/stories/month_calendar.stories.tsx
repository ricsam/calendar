import { InteractiveDemo } from "@/components/interactive_demo";
import { MonthCalendar } from "@/components/month_calendar/month_calendar";
import { Meta, StoryObj } from "@storybook/react";
import {
  addDays,
  addMinutes,
  addWeeks,
  endOfDay,
  startOfDay,
  subHours,
  subMinutes,
  subWeeks,
} from "date-fns";
import { manyEvents } from "./many_events";
import { CalendarEvent } from "@/components/types";
import { Box } from "@mui/material";
import { CalendarIcon } from "@mui/x-date-pickers/icons";
import { AcUnit, AddAlarm } from "@mui/icons-material";

const meta = {
  title: "Calendar/Month",
  component: MonthCalendar,
  // tags: ["autodocs"],
  argTypes: {
    onCreateEvent: {
      table: {
        disable: true,
      },
    },
    onMoveEvent: {
      table: {
        disable: true,
      },
    },
    events: {
      table: {
        disable: true,
      },
    },
    startOfMonth: {
      control: "date",
    },
    now: {
      control: "date",
    },
  },
  args: {
    startOfMonth: new Date(),
    startDay: "monday",
    now: new Date(),
  },
  render: (props) => {
    return (
      <Box sx={{ height: "calc(100vh - 80px)" }}>
        <InteractiveDemo type="month" {...props} />
      </Box>
    );
  },
} satisfies Meta<typeof MonthCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyCalendar: Story = {
  args: {},
};

const monthEvents: CalendarEvent<undefined>[] = [
  {
    title: "Short event",
    start: subMinutes(new Date(), 30),
    end: subMinutes(new Date(), 15),
    styling: { bg: "#EC407A" },
    canEdit: true,
  },
  {
    title: "Some event",
    start: startOfDay(new Date()),
    end: addMinutes(startOfDay(new Date()), 1339),
    styling: { bg: "#EC407A" },
    canEdit: true,
    endAdornment: () => "🎉",
  },
  {
    title: "2 days event",
    start: startOfDay(addDays(new Date(), 2)),
    end: endOfDay(addDays(addDays(new Date(), 2), 2)),
    styling: { bg: "#EC407A" },
    canEdit: true,
  },
  {
    title: "4 week event",
    start: subWeeks(startOfDay(addDays(new Date(), 1)), 4),
    end: endOfDay(addWeeks(addDays(new Date(), 1), 4)),
    styling: { bg: "#EF5350" },
    canEdit: true,
    endAdornment: () => "🎉",
  },
  {
    title: "10min event",
    start: subHours(new Date(), 3),
    end: addMinutes(subHours(new Date(), 3), 10),
    styling: { bg: "#FF7043" },
    canEdit: true,
  },
  {
    title: "15min event",
    start: addDays(new Date(), 2),
    end: addMinutes(addDays(new Date(), 2), 15),
    styling: { bg: "#EF5350" },
    canEdit: true,
  },
  {
    title: "36 min event",
    start: addMinutes(new Date(), 15),
    end: addMinutes(addMinutes(new Date(), 15), 36),
    styling: { bg: "#26A69A" },
    canEdit: true,
  },
  {
    title: "2 hours event",
    start: new Date(),
    end: addMinutes(new Date(), 120),
    styling: { bg: "#EC407A" },
    canEdit: true,
  },
  {
    title: "3 hours event",
    start: new Date(),
    end: addMinutes(new Date(), 181),
    styling: { bg: "#5C6BC0" },
    canEdit: true,
  },
  {
    title: "5 day event",
    start: startOfDay(addDays(new Date(), 3)),
    end: endOfDay(addDays(addDays(new Date(), 1), 6)),
    styling: { bg: "#EF5350" },
    canEdit: true,
  },
];

export const FilledCalendar: Story = {
  args: {
    events: [...monthEvents],
  },
  render: (props) => {
    return <InteractiveDemo type="month" {...props} />;
  },
};

export const WithBuggedEvents: Story = {
  args: {
    events: [
      {
        title: "A",
        start: startOfDay(addDays(new Date(), 2)),
        end: endOfDay(addDays(new Date(), 2)),
        styling: { bg: "red" },
        canEdit: true,
        endAdornment: () => (
          <Box
            sx={{
              height: "16px",
              display: "flex",
              color: "white",
              alignItems: "center",
              svg: {
                fontSize: "12px",
              },
            }}
          >
            <AddAlarm />
            <AcUnit />
          </Box>
        ),
      },
      {
        title: "B",
        start: startOfDay(addDays(new Date(), 0)),
        end: endOfDay(addDays(new Date(), 1)),
        styling: { bg: "green" },
        canEdit: true,
        endAdornment: () => "🎉",
      },
      {
        title: "C",
        start: startOfDay(addDays(new Date(), 1)),
        end: endOfDay(addDays(new Date(), 2)),
        styling: { bg: "blue" },
        canEdit: true,
      },
    ],
  },
  render: (props) => {
    return <InteractiveDemo type="month" {...props} />;
  },
};

export const WithWeridBackground: Story = {
  args: {
    events: [...monthEvents, ...manyEvents],
  },
  render: (props) => {
    return (
      <Box sx={{ backgroundColor: "#c1c1c1" }}>
        <InteractiveDemo type="month" {...props} />
      </Box>
    );
  },
};

export const WithSubDayEvents: Story = {
  args: {
    events: manyEvents,
  },
  render: (props) => {
    return <InteractiveDemo type="month" {...props} />;
  },
};

export const CanNotCreateEvents: Story = {
  args: {
    events: manyEvents,
    onCreateEvent: undefined,
    onClickEvent: () => {
      console.log("clicked events");
    },
    onMoveEvent: () => {
      console.log("moved event");
    },
  },
};

export const CanNotClickEvents: Story = {
  args: {
    events: manyEvents,
    onCreateEvent: () => {
      console.log("created event");
    },
    onClickEvent: undefined,
    onMoveEvent: () => {
      console.log("moved event");
    },
  },
};

export const CanNotMoveEvents: Story = {
  args: {
    events: manyEvents,
    onCreateEvent: () => {
      console.log("created event");
    },
    onClickEvent: () => {
      console.log("clicked events");
    },
    onMoveEvent: undefined,
  },
};

export const CanNotInteractWithEvents: Story = {
  args: {
    events: manyEvents,
    onCreateEvent: () => {
      console.log("created event");
    },
    onClickEvent: undefined,
    onMoveEvent: undefined,
  },
};

export const DynamicHeight: Story = {
  args: {
    events: [...monthEvents],
  },
  render: (props) => {
    return (
      <Box sx={{ height: "calc(100vh - 80px)" }}>
        <InteractiveDemo type="month" {...props} />
      </Box>
    );
  },
};
export const WithSelected: Story = {
  args: {
    events: [
      ...monthEvents.map((event, i) => ({ ...event, selected: i % 2 === 0 })),
    ],
  },
  render: (props) => {
    return (
      <Box sx={{ height: "calc(100vh - 80px)" }}>
        <InteractiveDemo type="month" {...props} />
      </Box>
    );
  },
};

export const WithDefaultColor: Story = {
  args: {
    events: [...monthEvents],
  },
  render: (props) => {
    return (
      <Box sx={{ height: "calc(100vh - 80px)" }}>
        <InteractiveDemo type="month" {...props} defaultEventColor="red" />
      </Box>
    );
  },
};
