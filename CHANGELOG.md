# @ricsam/react-mui-calendar

## 0.1.1

### Patch Changes

- 647c469: Prevent the calendar navigation week label from being truncated with an ellipsis.
- 0c82a64: Fix the week calendar hour labels drifting out of alignment with their grid rows. The time sidebar cells could shrink below their 60px hour height when the sidebar was rendered inside a shorter flex container, so labels no longer matched the hour lines and events.
- 1bb5857: Fix two week calendar styling regressions. The sticky header no longer stacks its bottom divider on top of the grid's midnight line, so the top of the calendar shows a single border instead of a double one. The all-day overflow link is now the shared "more events" button used by the month calendar, so it reads `n more` instead of `+n more` and matches the padding, height and typography of the events rendered above it.

## 0.1.0

### Minor Changes

- e0fa23e: Publish the reorganized React calendar library under its new package name with focused month and week views, consumer-owned event styling, a Vite component catalog, and Mintlify documentation.
