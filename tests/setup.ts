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
