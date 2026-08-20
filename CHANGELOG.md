# @ricsam/react-mui-calendar

## 0.1.2

### Patch Changes

- 2d9b20f: Fix week calendar header and hour label alignment.

  The all-day expand/collapse chevron has been removed. The "n more" link already
  communicates the overflow, and the chevron's gutter was covering the midnight
  grid line, which then only appeared while momentum scrolling. Expanding is now
  done through "n more" and collapsing through a matching "Show less" link.

  Hour labels are positioned on their grid line and centred on it instead of
  being stacked as fixed-height cells, so each label lines up exactly with the
  hour it marks.

  The sticky header no longer draws its own bottom border or applies a negative
  margin to overlap the grid. The grid's midnight line is the single divider
  between the two, and spacing around the calendar is left to the consumer.

## 0.1.1

### Patch Changes

- 647c469: Prevent the calendar navigation week label from being truncated with an ellipsis.
- 0c82a64: Fix the week calendar hour labels drifting out of alignment with their grid rows. The time sidebar cells could shrink below their 60px hour height when the sidebar was rendered inside a shorter flex container, so labels no longer matched the hour lines and events.
- 1bb5857: Fix two week calendar styling regressions. The sticky header no longer stacks its bottom divider on top of the grid's midnight line, so the top of the calendar shows a single border instead of a double one. The all-day overflow link is now the shared "more events" button used by the month calendar, so it reads `n more` instead of `+n more` and matches the padding, height and typography of the events rendered above it.

## 0.1.0

### Minor Changes

- e0fa23e: Publish the reorganized React calendar library under its new package name with focused month and week views, consumer-owned event styling, a Vite component catalog, and Mintlify documentation.
