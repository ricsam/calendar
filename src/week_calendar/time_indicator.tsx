import { Box } from "@mui/material";
import { useCalendar } from "./context";

export const TimeIndicator = () => {
  const { workWeek } = useCalendar();
  const daysInWeek = workWeek ? 5 : 7;
  return (
    <Box
      sx={{
        width: "100%",
        height: 13,
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
      className="time-indicator"
    >
      <Box
        sx={{
          width: 13,
          height: 13,
          borderRadius: 13,
          background: (theme) => theme.palette.primary.main,
          border: (theme) => `1px solid ${theme.palette.primary.contrastText}`,
        }}
      ></Box>
      <Box
        sx={{
          background: (theme) => theme.palette.primary.main,
          height: "4px",
          flex: 1,
          marginLeft: "-1px",
          borderTopRightRadius: "4px",
          borderBottomRightRadius: "4px",
          border: (theme) => `1px solid ${theme.palette.primary.contrastText}`,
          borderLeft: "none",
        }}
      ></Box>
      <Box
        sx={{
          background: (theme) => theme.palette.primary.main,
          position: "absolute",
          height: "2px",
          flex: 1,
          marginLeft: "-1px",
          borderLeft: "none",
          top: "5.5px",
          left: "6px",
          zIndex: 1,
          width: "10px",
        }}
      ></Box>
    </Box>
  );
};
