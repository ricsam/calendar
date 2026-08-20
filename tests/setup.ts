import "@testing-library/jest-dom/vitest";

/**
 * jsdom does not implement ResizeObserver, which `useMeasureHeight` relies on.
 * Elements have no layout in jsdom, so a no-op observer is enough to let the
 * components mount.
 */
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

/**
 * jsdom does not implement `window.scrollTo`, which the demo router's scroll
 * restoration calls on every navigation. Stub it so routing tests stay quiet.
 */
if (typeof window !== "undefined") {
  window.scrollTo = () => {};
}
