import {
  addDays,
  addHours,
  addMinutes,
  endOfDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "../src";

export type DemoEvent = CalendarEvent<{ data: { id: string } }>;

const palette = {
  blue: { bg: "#4338ca", textColor: "#ffffff" },
  coral: { bg: "#e85d3f", textColor: "#ffffff" },
  green: { bg: "#047857", textColor: "#ffffff" },
  gold: { bg: "#d97706", textColor: "#ffffff" },
};

export function createDemoEvents(anchor: Date): DemoEvent[] {
  const week = startOfWeek(anchor, { weekStartsOn: 1 });
  const at = (day: number, hour: number, minutes = 0) =>
    addMinutes(addHours(startOfDay(addDays(week, day)), hour), minutes);

  return [
    {
      data: { id: "planning" },
      title: "Product planning",
      start: at(0, 9),
      end: at(0, 10, 30),
      styling: palette.blue,
      canEdit: true,
    },
    {
      data: { id: "design" },
      title: "Design review",
      start: at(1, 11),
      end: at(1, 12),
      styling: palette.coral,
      canEdit: true,
    },
    {
      data: { id: "focus" },
      title: "Focus time",
      start: at(2, 9, 30),
      end: at(2, 12),
      styling: palette.green,
      canEdit: true,
    },
    {
      data: { id: "customer" },
      title: "Customer call",
      start: at(2, 13),
      end: at(2, 14),
      styling: palette.gold,
      canEdit: true,
    },
    {
      data: { id: "retro" },
      title: "Weekly retro",
      start: at(4, 15),
      end: at(4, 16),
      styling: palette.blue,
      canEdit: true,
    },
    {
      data: { id: "launch" },
      title: "Launch window",
      start: startOfDay(addDays(week, 1)),
      end: endOfDay(addDays(week, 3)),
      styling: palette.coral,
      canEdit: true,
    },
    {
      data: { id: "conference" },
      title: "Team offsite",
      start: startOfDay(addDays(week, 8)),
      end: endOfDay(addDays(week, 10)),
      styling: palette.green,
      canEdit: true,
    },
    {
      data: { id: "research" },
      title: "Research synthesis",
      start: at(9, 10),
      end: at(9, 11, 30),
      styling: palette.gold,
      canEdit: true,
    },
  ];
}
