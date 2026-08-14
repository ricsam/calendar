import type { BoxProps } from "@mui/material";
import { Box } from "@mui/material";
import { mergeSx } from "./helpers";
import React from "react";

/**
 *
 * A Flex Box with direction col. Accepts the standard BoxProps.
 * @public
 */
export function FlexCol(props: BoxProps) {
  const { sx, ...other } = props;
  const style = mergeSx(
    {
      display: "flex",
      flexDirection: "column",
    },
    sx,
  );
  return <Box sx={style} {...other} />;
}

/**
 *
 * A Flex Box with direction row. Accepts the standard BoxProps.
 * @public
 */
export const FlexRow = React.forwardRef<HTMLDivElement, BoxProps>(
  function FlexRow(props: BoxProps, ref) {
    const { sx, ...other } = props;
    return (
      <Box
        ref={ref}
        sx={mergeSx(
          {
            display: "flex",
            flexDirection: "row",
          },
          sx,
        )}
        {...other}
      />
    );
  },
);
