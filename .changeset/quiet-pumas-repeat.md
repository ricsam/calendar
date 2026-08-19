---
"@ricsam/react-mui-calendar": patch
---

Fix two week calendar styling regressions. The sticky header no longer stacks its bottom divider on top of the grid's midnight line, so the top of the calendar shows a single border instead of a double one. The all-day overflow link is now the shared "more events" button used by the month calendar, so it reads `n more` instead of `+n more` and matches the padding, height and typography of the events rendered above it.
