# React MUI Calendar

Focused month and week calendar components for React and Material UI.

[![CI](https://github.com/ricsam/calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/ricsam/calendar/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ricsam/react-mui-calendar.svg)](https://www.npmjs.com/package/@ricsam/react-mui-calendar)

[**Live demo and component playground**](https://ricsam.github.io/calendar/) · [**Documentation**](https://react-mui-calendar.mintlify.site/)

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

Try the components in the [live playground](https://ricsam.github.io/calendar/) or read the [Mintlify guides and API reference](https://react-mui-calendar.mintlify.site/).

## Develop

```bash
npm install
npm run dev       # Vite landing page and component catalog
npm run typecheck
npm test
npm run build
npm run docs:dev  # Mintlify preview
```

### Demo routing on GitHub Pages

The demo is a single-page app routed with [TanStack Router](https://tanstack.com/router), so `/calendar/`, `/calendar/month`, `/calendar/week`, and `/calendar/navigation` are all real, shareable, bookmarkable URLs.

GitHub Pages serves static files only — it has no rewrite or SPA-fallback configuration — so `npm run build:demo` handles deep links at build time:

- The router's `basepath` comes from `import.meta.env.BASE_URL`, which is `/calendar/` on GitHub Pages (the deploy workflow passes `--base`) and `/` locally, so routes, links, and assets share one prefix.
- A small Vite plugin in `vite.config.ts` copies the built `index.html` shell to `month.html`, `week.html`, and `navigation.html`, so those extensionless URLs return **200** instead of a 404 status.
- The same shell is written to `404.html`, the only catch-all hook Pages exposes, so any other path still boots the app and renders the in-app not-found screen.

Add new routes in `demo/router.tsx` and list their paths in `demo/route-paths.ts` so the build pre-renders an entry point for them. `tests/demo-routing.test.tsx` guards both halves of that contract.

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
