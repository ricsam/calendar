import { Button, ButtonProps, Typography } from "@mui/material";
import { mergeSx } from "./helpers";

/**
 * The overflow button that is rendered when a day can not show all of its
 * events. It is shared by the month calendar and the all-day row of the week
 * calendar so that both views use the same padding, sizing and typography as
 * the events that are rendered above it.
 *
 * Positioning is left to the caller, the sizing here matches a single event
 * row (16px tall).
 *
 * Pass `numHiddenEvents` for the usual "n more" label, or `label` to render
 * another action (for example "Show less") with identical styling.
 */
export function MoreEventsButton({
  numHiddenEvents,
  label,
  ...buttonProps
}: {
  numHiddenEvents?: number;
  label?: string;
} & ButtonProps) {
  return (
    <Button
      variant="text"
      {...buttonProps}
      sx={mergeSx(
        {
          justifyContent: "flex-start",
          m: 0,
          py: "0px",
          px: "5px",
          height: "16px",
          minWidth: "auto",
          borderRadius: "4px",
          overflow: "hidden",
          whiteSpace: "nowrap",
        },
        buttonProps.sx,
      )}
    >
      <Typography
        sx={{
          color: "var(--Light-Primary-Dark, #1565C0)",
          textTransform: "none",
          fontFamily: "Roboto",
          fontSize: "10px",
          fontStyle: "normal",
          fontWeight: 500,
          lineHeight: "100%",
        }}
      >
        {label ?? `${numHiddenEvents} more`}
      </Typography>
    </Button>
  );
}
