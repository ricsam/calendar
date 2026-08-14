import { InteractiveDemo } from "@/components/interactive_demo";
import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import {
  addDays,
  addHours,
  addMinutes,
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfHour,
  startOfWeek,
  subDays,
} from "date-fns";
import React from "react";
import { WeekCalendar } from "../components/week_calendar/week_calendar";
import { manyEvents } from "./many_events";

const meta = {
  title: "Calendar/Week",
  component: WeekCalendar,
  parameters: {
    // layout: "centered",
  },
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
    onClickEvent: {
      table: {
        disable: true,
      },
    },
    events: {
      table: {
        disable: true,
      },
    },
    workWeek: {
      control: "boolean",
    },
    startOfWeek: {
      control: "date",
    },
    now: {
      control: "date",
    },
    sidebar: {
      control: "boolean",
    },
  },
  args: {
    workWeek: false,
    startDay: "monday",
    startOfWeek: new Date(),
    now: new Date(),
    sidebar: false,
  },
  decorators: [],
} satisfies Meta<typeof InteractiveDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyCalendar: Story = {
  args: {},
};

export const CanCreateEvents: Story = {
  render: (props) => {
    return <InteractiveDemo type="week" {...props} />;
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

export const WithAllDayEvents: Story = {
  args: {
    events: manyEvents,
  },
  render: (props) => {
    return <InteractiveDemo type="week" {...props} />;
  },
};

export const WithDefaultColor: Story = {
  args: {
    events: manyEvents,
    defaultEventColor: "red",
  },
  render: (props) => {
    return <InteractiveDemo type="week" {...props} />;
  },
};

export const WithSubDayEvents: Story = {
  args: {
    events: manyEvents,
  },
  render: (props) => {
    return <InteractiveDemo type="week" {...props} />;
  },
};
export const WithHuuugeSubDayEvent: Story = {
  args: {
    events: [
      ...manyEvents,
      {
        start: subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5),
        end: addDays(endOfWeek(new Date(), { weekStartsOn: 1 }), 5),
        title: "Huuuge event",
        canEdit: true,
      },
    ],

    now: addHours(startOfDay(new Date()), 11),
  },
  render: (props) => {
    return <InteractiveDemo type="week" {...props} />;
  },
};

export const WithSelectedEvents: Story = {
  args: {
    events: [
      ...manyEvents.slice(3),
      {
        start: startOfHour(new Date()),
        end: addMinutes(startOfHour(new Date()), 15),
        title: "A short event",
        canEdit: true,
        selected: true,
      },
      {
        start: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
        end: endOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
        title: "A full day event",
        selected: true,
      },
      {
        start: addHours(
          startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
          2
        ),
        end: addMinutes(
          addHours(
            startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
            2
          ),
          15
        ),
        title: "A sub day event",
        selected: true,
      },
    ],

    now: addHours(startOfDay(new Date()), 11),
  },
  render: (props) => {
    return <InteractiveDemo type="week" {...props} />;
  },
};

export const WorkWeek: Story = {
  args: {
    events: manyEvents,
    workWeek: true,
  },
  render: (props) => {
    return <InteractiveDemo type="week" {...props} />;
  },
};

export const WeekStartsOnSunday: Story = {
  args: {
    events: manyEvents,
    startDay: "sunday",
  },
  render: (props) => {
    return <InteractiveDemo type="week" {...props} />;
  },
};

export const WithScrollableContainers: Story = {
  args: {
    events: manyEvents,
    workWeek: true,
  },
  render: (props) => {
    return <ScrollDemo {...props} />;
  },
};
function ScrollDemo(
  props: React.ComponentPropsWithoutRef<typeof WeekCalendar>
) {
  const scrollableContainer = React.useRef<HTMLDivElement>(null);
  return (
    <Box
      sx={{ maxHeight: "480px", overflowY: "scroll" }}
      ref={scrollableContainer}
    >
      <WeekCalendar
        {...props}
        scrollContainers={[scrollableContainer, window]}
      />
    </Box>
  );
}

export const WithStickyHeader: Story = {
  args: {
    events: manyEvents,
    workWeek: true,
  },
  render: (props) => {
    return <ScrollDemo {...props} stickyHeader />;
  },
};

export const WithAutoScroll: Story = {
  args: {
    events: manyEvents,
    workWeek: true,
  },
  render: (props) => {
    return <ScrollDemo {...props} autoScroll />;
  },
};
