# React MUI Calendar

Focused month and week calendar components for React and Material UI.

[![CI](https://github.com/ricsam/calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/ricsam/calendar/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ricsam/react-mui-calendar.svg)](https://www.npmjs.com/package/@ricsam/react-mui-calendar)

## Why this package

- Controlled event state with typed callbacks
- Month and week views, including overlaps and multi-day events
- Drag creation, moving, resizing, selection, work weeks, and sticky headers
- Consumer-owned event colors and Material UI theming
- No Next.js or Storybook runtime

## Install

```bash
npm install @ricsam/react-mui-calendar @mui/material @emotion/react @emotion/styled date-fns
```

## Example

```tsx
import { endOfDay, startOfDay } from "date-fns";
import {
  CalendarThemeProvider,
  MonthCalendar,
  type CalendarEvent,
} from "@ricsam/react-mui-calendar";

const events: CalendarEvent[] = [
  {
    title: "Launch",
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
    styling: { bg: "#4338ca", textColor: "#fff" },
  },
];

export function App() {
  return (
    <CalendarThemeProvider>
      <div style={{ height: 680 }}>
        <MonthCalendar events={events} />
      </div>
    </CalendarThemeProvider>
  );
}
```

See [`docs/`](./docs) for the Mintlify guides and API reference.

## Develop

```bash
npm install
npm run dev       # Vite landing page and component catalog
npm run typecheck
npm test
npm run build
npm run docs:dev  # Mintlify preview
```

## Publish

The `Publish package` GitHub Action publishes tags matching `v*` using npm trusted publishing (OIDC), Node 24, and npm 11+. Configure the npm trusted publisher with:

- GitHub owner: `ricsam`
- Repository: `calendar`
- Workflow filename: `publish.yml`

No long-lived npm token is used by the workflow. The package version must match the release tag before it is pushed.

## Scope

The timeline/Gantt component from the original project has been intentionally removed. This package concentrates on month and week calendars.

## License

MIT
