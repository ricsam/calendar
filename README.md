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

## Release with Changesets

Add a changeset with every consumer-facing change:

```bash
npm run changeset
```

The `Publish package` workflow runs on `main`. When pending changesets exist it creates or updates a **Version Packages** pull request containing version and changelog updates. Merging that pull request publishes the package and creates the release tag through npm trusted publishing.

The trusted publisher is configured for `ricsam/calendar` and `publish.yml`; no long-lived npm token is used. GitHub Actions needs permission to create pull requests under **Settings → Actions → General**.

## Scope

The timeline/Gantt component from the original project has been intentionally removed. This package concentrates on month and week calendars.

## License

MIT
