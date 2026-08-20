---
"@ricsam/react-mui-calendar": patch
---

Fix week calendar header and hour label alignment.

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
