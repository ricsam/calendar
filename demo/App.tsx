import { Box, Button, Chip, CssBaseline } from "@mui/material";
import { addHours } from "date-fns";
import React from "react";
import {
  CalendarNav,
  CalendarThemeProvider,
  MonthCalendar,
  WeekCalendar,
  type CalendarEvent,
} from "../src";
import { createDemoEvents, type DemoEvent } from "./data";

type View = "home" | "month" | "week" | "navigation";

const anchor = new Date(2026, 2, 11, 10, 20);
const docsUrl = "https://react-mui-calendar.mintlify.site/";
const githubUrl = "https://github.com/ricsam/calendar";

export function App() {
  const [view, setView] = React.useState<View>("home");
  const [mode, setMode] = React.useState<"light" | "dark">("light");

  return (
    <CalendarThemeProvider theme={mode}>
      <CssBaseline />
      <div className={`site-shell ${mode === "dark" ? "dark-mode" : ""}`}>
        <Header view={view} setView={setView} mode={mode} setMode={setMode} />
        {view === "home" ? (
          <Landing setView={setView} />
        ) : (
          <Catalog view={view} />
        )}
      </div>
    </CalendarThemeProvider>
  );
}

function Header({
  view,
  setView,
  mode,
  setMode,
}: {
  view: View;
  setView: (view: View) => void;
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
}) {
  const links: Array<{ label: string; view: View }> = [
    { label: "Overview", view: "home" },
    { label: "Month", view: "month" },
    { label: "Week", view: "week" },
    { label: "Navigation", view: "navigation" },
  ];

  return (
    <header className="topbar">
      <button className="brand" onClick={() => setView("home")}>
        <span className="brand-mark">
          <span>12</span>
        </span>
        <span>React MUI Calendar</span>
      </button>
      <nav className="main-nav" aria-label="Demo navigation">
        {links.map((link) => (
          <button
            className={view === link.view ? "active" : undefined}
            key={link.view}
            onClick={() => setView(link.view)}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <a href={docsUrl}>Docs</a>
        <a href={githubUrl}>GitHub</a>
        <button
          className="mode-toggle"
          onClick={() => setMode(mode === "light" ? "dark" : "light")}
          aria-label={`Use ${mode === "light" ? "dark" : "light"} theme`}
        >
          {mode === "light" ? "Dark" : "Light"}
        </button>
      </div>
    </header>
  );
}

function Landing({ setView }: { setView: (view: View) => void }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Open source React + MUI components</div>
          <h1>Calendars that feel native to your product.</h1>
          <p>
            Polished month and week views built for Material UI. Bring your own
            data, colors, theme, and event editor without bringing a scheduling
            platform along for the ride.
          </p>
          <div className="hero-actions">
            <Button
              variant="contained"
              size="large"
              onClick={() => setView("month")}
            >
              Explore components
            </Button>
            <Button variant="outlined" size="large" href={docsUrl}>
              Read the docs
            </Button>
          </div>
          <div className="install-command">
            <code>npm i @ricsam/react-mui-calendar</code>
            <span>MIT licensed · React 18/19 · MUI 5/6/7</span>
          </div>
        </div>
        <div className="hero-calendar">
          <div className="window-bar">
            <span></span>
            <span></span>
            <span></span>
            <small>Team calendar</small>
          </div>
          <CalendarPreview type="month" compact />
        </div>
      </section>

      <section className="value-section">
        <div className="section-heading">
          <span>Small surface, serious behavior</span>
          <h2>The calendar primitives your app actually needs.</h2>
        </div>
        <div className="feature-grid">
          <Feature number="01" title="Controlled by you">
            Events remain in your state. The components report creation,
            movement, resizing, and clicks without prescribing a backend.
          </Feature>
          <Feature number="02" title="Material UI native">
            Merge the calendar theme into an existing MUI system and customize
            it through the palette and standard component overrides.
          </Feature>
          <Feature number="03" title="Dense data, clear layout">
            Overlaps, multi-day events, overflow menus, current-time indicators,
            work weeks, and sticky headers are handled out of the box.
          </Feature>
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-heading split">
          <div>
            <span>Two focused views</span>
            <h2>Go from the month to the minute.</h2>
          </div>
          <p>
            Keep navigation separate, compose the view you need, and wire it
            into the rest of your interface.
          </p>
        </div>
        <div className="showcase-grid">
          <button className="showcase-card" onClick={() => setView("month")}>
            <div className="showcase-copy">
              <Chip label="MonthCalendar" size="small" />
              <h3>See the whole plan.</h3>
              <p>
                Dynamic rows, multi-week spans, overflow details, and
                drag-to-move.
              </p>
            </div>
            <div className="showcase-preview month">
              <CalendarPreview type="month" compact />
            </div>
          </button>
          <button className="showcase-card" onClick={() => setView("week")}>
            <div className="showcase-copy">
              <Chip label="WeekCalendar" size="small" />
              <h3>Work at day-level detail.</h3>
              <p>
                Timed overlaps, all-day events, resizing, work weeks, and
                auto-scroll.
              </p>
            </div>
            <div className="showcase-preview week">
              <CalendarPreview type="week" compact />
            </div>
          </button>
        </div>
      </section>

      <section className="cta-section">
        <div>
          <span>Ready for your event model</span>
          <h2>Start with the view. Own everything else.</h2>
        </div>
        <div className="cta-actions">
          <Button
            variant="contained"
            size="large"
            onClick={() => setView("month")}
          >
            Try the playground
          </Button>
          <Button variant="text" size="large" href={docsUrl}>
            Read the docs
          </Button>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            <span>12</span>
          </span>
          <div>
            <strong>React MUI Calendar</strong>
            <span>Focused calendars. Your product rules.</span>
          </div>
        </div>
        <div className="footer-links">
          <a href={docsUrl}>Documentation</a>
          <a href="https://www.npmjs.com/package/@ricsam/react-mui-calendar">
            npm
          </a>
          <a href={githubUrl}>GitHub</a>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  number,
  title,
  children,
}: React.PropsWithChildren<{ number: string; title: string }>) {
  return (
    <article className="feature-card">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function Catalog({ view }: { view: Exclude<View, "home"> }) {
  return (
    <main className="catalog">
      <aside className="catalog-aside">
        <span className="eyebrow">Component catalog</span>
        <h1>
          {view === "month"
            ? "Month calendar"
            : view === "week"
              ? "Week calendar"
              : "Calendar navigation"}
        </h1>
        <p>
          {view === "month"
            ? "A responsive month grid for short, all-day, and multi-day events."
            : view === "week"
              ? "A detailed time grid with overlap layout and an expandable all-day area."
              : "A controlled toolbar for moving between month and week ranges."}
        </p>
        <div className="catalog-note">
          <strong>This is a live component</strong>
          <span>
            Click an event to select it. Drag editable events to move or resize
            them, or drag empty space to create one.
          </span>
        </div>
      </aside>
      <div className="story-list">
        {view === "month" && (
          <>
            <Story
              title="Interactive month"
              description="Standard month view with owned event styling."
            >
              <CalendarPreview type="month" />
            </Story>
            <Story
              title="Week starts Sunday"
              description="Change the first day without rebuilding event data."
            >
              <CalendarPreview type="month" startDay="sunday" />
            </Story>
          </>
        )}
        {view === "week" && (
          <>
            <Story
              title="Interactive week"
              description="Timed and all-day events with full interaction callbacks."
            >
              <CalendarPreview type="week" />
            </Story>
            <Story
              title="Work week"
              description="A Monday-to-Friday view with a sticky header."
            >
              <CalendarPreview type="week" workWeek />
            </Story>
          </>
        )}
        {view === "navigation" && <NavigationStory />}
      </div>
    </main>
  );
}

function Story({
  title,
  description,
  children,
}: React.PropsWithChildren<{ title: string; description: string }>) {
  return (
    <section className="story-card">
      <div className="story-heading">
        <div>
          <span>Story</span>
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
      </div>
      <div className="story-canvas">{children}</div>
    </section>
  );
}

function NavigationStory() {
  const [month, setMonth] = React.useState(anchor);
  const [week, setWeek] = React.useState(anchor);
  return (
    <>
      <Story
        title="Month navigation"
        description="The toolbar is controlled through time and setTime."
      >
        <div className="nav-story">
          <CalendarNav
            type="month"
            now={anchor}
            time={month}
            setTime={setMonth}
          />
        </div>
      </Story>
      <Story
        title="Week navigation"
        description="Week mode adds the current week number."
      >
        <div className="nav-story">
          <CalendarNav type="week" now={anchor} time={week} setTime={setWeek} />
        </div>
      </Story>
    </>
  );
}

function CalendarPreview({
  type,
  compact = false,
  startDay = "monday",
  workWeek = false,
}: {
  type: "month" | "week";
  compact?: boolean;
  startDay?: "monday" | "sunday";
  workWeek?: boolean;
}) {
  const [time, setTime] = React.useState(anchor);
  const [events, setEvents] = React.useState(() => createDemoEvents(anchor));
  const [selected, setSelected] = React.useState<string>();
  const [activity, setActivity] = React.useState(
    "Select, drag, resize, or create an event",
  );

  const visibleEvents = events.map((event) => ({
    ...event,
    selected: event.data.id === selected,
  }));

  const moveEvent = (event: DemoEvent, start: Date, end: Date) => {
    setEvents((current) =>
      current.map((item) =>
        item.data.id === event.data.id ? { ...item, start, end } : item,
      ),
    );
    setSelected(event.data.id);
    setActivity(`Updated “${event.title ?? "Untitled event"}”`);
  };
  const createEvent = (start: Date, end: Date) => {
    const id = `created-${Date.now()}`;
    setEvents((current) => [
      ...current,
      {
        data: { id },
        title: "New event",
        start,
        end: end ?? addHours(start, 1),
        styling: { bg: "#4338ca", textColor: "#fff" },
        canEdit: true,
      },
    ]);
    setSelected(id);
    setActivity("Created “New event”");
  };
  const clickEvent = (event: CalendarEvent<{ data: { id: string } }>) => {
    setSelected(event.data.id);
    setActivity(`Selected “${event.title ?? "Untitled event"}”`);
  };
  const resetDemo = () => {
    setTime(anchor);
    setEvents(createDemoEvents(anchor));
    setSelected(undefined);
    setActivity("Demo reset — try another interaction");
  };

  return (
    <div className={`calendar-demo ${type} ${compact ? "compact" : ""}`}>
      {!compact && (
        <>
          <div className="demo-status" aria-live="polite">
            <span>
              <i aria-hidden="true" />
              <strong>Live demo</strong>
              {activity}
            </span>
            <Button size="small" variant="text" onClick={resetDemo}>
              Reset
            </Button>
          </div>
          <CalendarNav type={type} now={anchor} time={time} setTime={setTime} />
        </>
      )}
      <Box
        sx={{
          height: compact ? "100%" : type === "month" ? 650 : 720,
          minWidth: 680,
        }}
      >
        {type === "month" ? (
          <MonthCalendar
            events={visibleEvents}
            startOfMonth={time}
            now={anchor}
            startDay={startDay}
            onClickEvent={clickEvent}
            onMoveEvent={moveEvent}
            onCreateEvent={createEvent}
          />
        ) : (
          <WeekCalendar
            events={visibleEvents}
            startOfWeek={time}
            now={anchor}
            startDay={startDay}
            workWeek={workWeek}
            stickyHeader={!compact}
            onClickEvent={clickEvent}
            onMoveEvent={moveEvent}
            onCreateEvent={createEvent}
          />
        )}
      </Box>
    </div>
  );
}
