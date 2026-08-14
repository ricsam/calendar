import { InteractiveDemo } from "@/components/interactive_demo";
import { Timeline } from "@/components/timeline/timeline";
import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import {
  addDays,
  addHours,
  addMinutes,
  endOfDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { manyEvents } from "./many_events";
import { generateRandomEvents } from "./helpers";
import { realEvents } from "./real_events";
import { eventsToRows } from "../components/events_to_rows";

const meta = {
  title: "Timeline/Timeline",
  component: Timeline,
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
    rows: {
      table: {
        disable: true,
      },
    },
    startTime: {
      control: "date",
    },
    now: {
      control: "date",
    },
  },
  args: {
    startTime: startOfMonth(new Date()),
    now: new Date(),
    startDay: "monday",
  },
  decorators: [],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyCalendar: Story = {
  args: {},
};

export const WithInteractivity: Story = {
  args: {},
  render: (props) => {
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={[
          {
            start: startOfDay(new Date()),
            end: endOfDay(
              addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 14),
            ),
            title: "A loong day event",
            canEdit: true,
          },
        ]}
        timelineResolution={props.resolution}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const WithEvents: Story = {
  args: {
    resolution: "month",
    startDay: "monday",
    startTime: new Date(),
  },
  render: (props) => {
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={[
          {
            start: addDays(
              startOfDay(
                startOfWeek(subWeeks(new Date(), 2), { weekStartsOn: 1 }),
              ),
              3,
            ),
            end: addDays(
              startOfDay(
                startOfWeek(subWeeks(new Date(), 2), { weekStartsOn: 1 }),
              ),
              5,
            ),
            title: "2 days",
          },
          {
            start: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
            end: endOfDay(
              addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 15),
            ),
            title: "2 weeks",
          },
          {
            start: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
            end: endOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
            title: "All day event",
          },
          {
            start: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
            end: endOfDay(
              addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2),
            ),
            title: "3 day",
            color: "blue",
          },
          {
            start: addHours(startOfDay(addDays(new Date(), 2)), 5),
            end: addMinutes(
              addHours(startOfDay(addDays(new Date(), 2)), 5),
              35,
            ),
            title: "35 min",
          },
          {
            start: addDays(startOfDay(new Date()), 1),
            end: addMinutes(addDays(startOfDay(new Date()), 1), 15),
            title: "short event",
          },
          {
            start: addHours(startOfDay(addDays(new Date(), 3)), 5),
            end: addHours(startOfDay(addDays(new Date(), 3)), 6),
            title: "1 hour ",
          },
          {
            start: addHours(startOfDay(addDays(new Date(), 3)), 7),
            end: addHours(startOfDay(addDays(new Date(), 3)), 9),
            title: "2 hours",
          },
        ].map((e) => ({ ...e, canEdit: true }))}
        timelineResolution={props.resolution}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const Week: Story = {
  args: {
    rows: eventsToRows(
      [
        {
          start: addHours(startOfDay(new Date()), 9),
          end: addHours(startOfDay(new Date()), 17),
          title: "All day work",
        },
        {
          start: addHours(startOfDay(addDays(new Date(), 1)), 10),
          end: addHours(startOfDay(addDays(new Date(), 1)), 11),
          title: "1 hour meeting",
        },
        {
          start: startOfDay(addDays(new Date(), 2)),
          end: endOfDay(addDays(new Date(), 3)),
          title: "2 day event",
          color: "blue",
        },
      ],
      "week",
    ),
    resolution: "week",
    startTime: startOfWeek(new Date(), { weekStartsOn: 1 }),
  },
};

export const Month: Story = {
  args: {
    rows: eventsToRows(
      [
        {
          start: startOfDay(new Date()),
          end: endOfDay(
            addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 14),
          ),
          title: "A loong day event",
        },
      ],
      "month",
    ),
    resolution: "month",
  },
};

export const MonthNoEvents: Story = {
  args: {
    rows: [],
    resolution: "month",
  },
};
export const ThreeMonthsNoEvents: Story = {
  args: {
    rows: [],
    resolution: "3-months",
  },
};

export const ThreeMonths: Story = {
  args: {
    rows: eventsToRows(
      [
        {
          start: startOfDay(new Date()),
          end: endOfDay(
            addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 14),
          ),
          title: "A loong day event",
        },
      ],
      "3-months",
    ),
    resolution: "3-months",
  },
};
export const Year: Story = {
  args: {
    rows: eventsToRows(
      [
        {
          start: startOfDay(new Date()),
          end: endOfDay(
            addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 14),
          ),
          title: "A loong day event",
        },
      ],
      "year",
    ),
    resolution: "year",
  },
};
export const ThreeYears: Story = {
  args: {
    rows: eventsToRows(
      [
        {
          start: startOfDay(new Date()),
          end: endOfDay(
            addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 14),
          ),
          title: "A loong day event",
        },
      ],
      "3-years",
    ),
    resolution: "3-years",
  },
};

export const MonthInteractive: Story = {
  args: {
    startDay: "monday",
    resolution: "month",
  },

  render: (props) => {
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={manyEvents}
        timelineResolution={props.resolution}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const ThreeMonthsInteractive: Story = {
  args: {
    startDay: "monday",
    resolution: "3-months",
  },

  render: (props) => {
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={manyEvents}
        timelineResolution={props.resolution}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const YearInteractive: Story = {
  args: {
    startDay: "monday",
    resolution: "year",
  },

  render: (props) => {
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={manyEvents}
        timelineResolution={props.resolution}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const ThreeYearsInteractive: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={manyEvents}
        timelineResolution={props.resolution}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const NoHeader: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    return (
      <Box display="flex" flexDirection="column" gap={0}>
        <Timeline
          {...props}
          resolution={props.resolution}
          rows={eventsToRows(manyEvents, props.resolution ?? "3-years")}
        />
        <Timeline
          {...props}
          resolution={props.resolution}
          noHeader
          rows={eventsToRows(
            manyEvents.map((e) => ({ ...e, color: "#4985f5" })),
            props.resolution ?? "3-years",
          )}
        />
        <Timeline
          {...props}
          resolution={props.resolution}
          noHeader
          rows={eventsToRows(
            manyEvents.map((e) => ({ ...e, color: "#718059" })),
            props.resolution ?? "3-years",
          )}
        />
      </Box>
    );
  },
};

export const ManyEvents: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    const events = generateRandomEvents(5000);
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={events}
        timelineResolution={props.resolution}
        getId={(e) => e.data.id}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const WithSelected: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    const events = generateRandomEvents(5000).map((e, i) => ({
      ...e,
      selected: i % 2 === 0,
    }));
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={events}
        timelineResolution={props.resolution}
        getId={(e) => e.data.id}
        testSelection
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const Grouped: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    const events = generateRandomEvents(5000);
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        events={events}
        timelineResolution={props.resolution}
        getId={(e) => e.data.id}
        group={true}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const RealEvents: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={realEvents}
        timelineResolution={props.resolution}
        getId={(e) => e.data.id}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const WithDefaultColor: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={realEvents}
        timelineResolution={props.resolution}
        getId={(e) => e.data.id}
        defaultEventColor="red"
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};

export const BuggedEvents1: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    const _events = [
      {
        start: "2025-02-12T17:44:28.741Z",
        end: "2025-06-06T21:13:04.379Z",
        canEdit: true,
      },
      {
        start: "2025-06-19T14:20:29.635Z",
        end: "2025-11-11T05:44:44.081Z",
        canEdit: true,
      },
      {
        start: "2025-07-22T23:16:46.517Z",
        end: "2026-06-27T12:01:54.143Z",
        canEdit: true,
      },
      {
        start: "2024-09-23T15:07:15.013Z",
        end: "2025-07-17T17:32:30.897Z",
        canEdit: true,
      },
    ];
    const events = _events.map((e, index) => ({
      start: new Date(e.start),
      end: new Date(e.end),
      canEdit: e.canEdit,
      title: String(index),
    }));
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={events}
        timelineResolution={props.resolution}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};
export const BuggedEvents2: Story = {
  args: {
    startDay: "monday",
    resolution: "3-years",
  },

  render: (props) => {
    const _events = [
      {
        start: "2025-01-22T10:31:15.656Z",
        end: "2025-11-11T16:23:53.152Z",
        canEdit: true,
      },
      {
        start: "2024-10-18T13:52:57.593Z",
        end: "2025-08-05T19:03:23.855Z",
        canEdit: true,
      },
      {
        start: "2024-10-12T14:51:36.100Z",
        end: "2025-03-11T22:17:22.443Z",
        canEdit: true,
      },
      {
        start: "2024-10-02T10:26:14.772Z",
        end: "2025-08-20T14:15:41.613Z",
        canEdit: true,
      },
      {
        start: "2024-09-10T00:01:48.344Z",
        end: "2024-10-14T08:51:22.866Z",
        canEdit: true,
      },
      {
        start: "2025-04-23T23:34:03.626Z",
        end: "2026-03-02T10:57:27.037Z",
        canEdit: true,
      },
      {
        start: "2025-03-15T22:49:57.104Z",
        end: "2025-11-23T00:15:26.173Z",
        canEdit: true,
      },
    ];
    const events = _events.map((e, index) => ({
      start: new Date(e.start),
      end: new Date(e.end),
      canEdit: e.canEdit,
      title: String(index),
    }));
    return (
      <InteractiveDemo
        type="timeline"
        {...props}
        group={false}
        events={events}
        timelineResolution={props.resolution}
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      />
    );
  },
};
