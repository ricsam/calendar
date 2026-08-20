import {
  createRootRoute,
  createRoute,
  createRouter,
  type RouterHistory,
} from "@tanstack/react-router";
import {
  Catalog,
  Landing,
  NotFound,
  RootLayout,
  type CatalogView,
} from "./App";

const siteName = "React MUI Calendar";

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  head: () => ({
    meta: [{ title: `${siteName} — Interactive React calendar components` }],
  }),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

function catalogRoute(path: CatalogView, title: string) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: `/${path}`,
    component: () => <Catalog view={path} />,
    head: () => ({ meta: [{ title: `${title} — ${siteName}` }] }),
  });
}

const routeTree = rootRoute.addChildren([
  indexRoute,
  catalogRoute("month", "Month calendar"),
  catalogRoute("week", "Week calendar"),
  catalogRoute("navigation", "Calendar navigation"),
]);

/**
 * Builds the demo router.
 *
 * `basepath` defaults to the Vite deployment base, which is `/calendar/` on
 * GitHub Pages and `/` during local development, so routes, links, and assets
 * all stay under the same prefix. Tests pass an explicit basepath and an
 * in-memory history.
 */
export function createDemoRouter(options?: {
  basepath?: string;
  history?: RouterHistory;
}) {
  return createRouter({
    routeTree,
    basepath: options?.basepath ?? import.meta.env.BASE_URL,
    history: options?.history,
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createDemoRouter>;
  }
}
