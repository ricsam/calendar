import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { staticRoutePaths } from "../demo/route-paths";
import { createDemoRouter } from "../demo/router";

/** The GitHub Pages project-site prefix the demo is deployed under. */
const basepath = "/calendar/";

/** Renders the real demo router at a path, using an in-memory history. */
function renderAt(initialPath: string) {
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createDemoRouter({ basepath, history });
  render(<RouterProvider router={router} />);
  return { router, history };
}

describe("demo routing under the /calendar/ basepath", () => {
  it("renders the week catalog for a /calendar/week deep link", async () => {
    renderAt("/calendar/week");
    expect(
      await screen.findByRole("heading", { name: "Week calendar", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders the month catalog for a /calendar/month deep link", async () => {
    renderAt("/calendar/month");
    expect(
      await screen.findByRole("heading", { name: "Month calendar", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders the navigation catalog for a /calendar/navigation deep link", async () => {
    renderAt("/calendar/navigation");
    expect(
      await screen.findByRole("heading", {
        name: "Calendar navigation",
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders the landing page at the basepath root", async () => {
    renderAt("/calendar/");
    expect(
      await screen.findByRole("heading", {
        name: /Calendars that feel native/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders the not-found screen for an unknown path", async () => {
    renderAt("/calendar/nope");
    expect(
      await screen.findByRole("heading", {
        name: /not on the calendar/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("prefixes every nav link with the basepath", async () => {
    renderAt("/calendar/");
    const nav = await screen.findByRole("navigation", {
      name: "Demo navigation",
    });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toEqual([
      "/calendar/",
      "/calendar/month",
      "/calendar/week",
      "/calendar/navigation",
    ]);
  });

  it("navigates between routes client-side and keeps the basepath in the URL", async () => {
    const user = userEvent.setup();
    const { router, history } = renderAt("/calendar/");

    await user.click(await screen.findByRole("link", { name: "Week" }));

    await waitFor(() => {
      // The browser-visible URL keeps the GitHub Pages prefix...
      expect(history.location.pathname).toBe("/calendar/week");
    });
    // ...while the router matches on the basepath-stripped internal path.
    expect(router.state.location.pathname).toBe("/week");
    expect(
      await screen.findByRole("heading", { name: "Week calendar", level: 1 }),
    ).toBeInTheDocument();
  });

  it("resolves every pre-rendered static route path to a real route", async () => {
    for (const routePath of staticRoutePaths) {
      const deepLink = `${basepath}${routePath.replace(/^\//, "")}`;
      const router = createDemoRouter({
        basepath,
        history: createMemoryHistory({ initialEntries: [deepLink] }),
      });
      await router.load();

      expect(
        router.state.matches.some((match) => match.status === "notFound"),
      ).toBe(false);
      // Every static path the build pre-renders must also be a link target
      // that resolves back to the same GitHub Pages URL.
      expect(router.buildLocation({ to: routePath }).href).toBe(deepLink);
    }
  });
});
