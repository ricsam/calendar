import { ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import React from "react";

/**
 * Usage:
 * ```tsx
 * import { deepmerge } from '@mui/utils';
 * import { calendarTheme } from '@ricsam/react-mui-calendar';
 * <ThemeProvider theme={outerTheme => deepmerge(outerTheme, calendarTheme)}>
 *   ...
 * </ThemeProvider>
 * ```
 */
export const calendarTheme = {
  typography: {
    event: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: "10px",
      fontStyle: "normal",
      fontWeight: "500",
      lineHeight: "14px",
    },
  },
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTooltip: {
      defaultProps: { disableInteractive: true },
    },
  },
};

export function CalendarThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme?: "dark" | "light";
}) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const muiTheme = React.useMemo(
    () =>
      createTheme(
        {
          palette: {
            mode: theme ?? (prefersDarkMode ? "dark" : "light"),
          },
        },
        calendarTheme,
      ),
    [prefersDarkMode, theme],
  );

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
