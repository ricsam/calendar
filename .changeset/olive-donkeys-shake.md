---
"@ricsam/react-mui-calendar": patch
---

Fix the week calendar hour labels drifting out of alignment with their grid rows. The time sidebar cells could shrink below their 60px hour height when the sidebar was rendered inside a shorter flex container, so labels no longer matched the hour lines and events.
