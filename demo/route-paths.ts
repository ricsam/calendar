/**
 * Every statically known route of the demo SPA.
 *
 * Shared between the router (`demo/router.tsx`) and the build (`vite.config.ts`),
 * which pre-renders one HTML shell per path so GitHub Pages can answer deep
 * links such as `/calendar/week` with a real 200 response instead of only the
 * `404.html` fallback.
 */
export const staticRoutePaths = [
  "/",
  "/month",
  "/week",
  "/navigation",
] as const;

export type StaticRoutePath = (typeof staticRoutePaths)[number];
