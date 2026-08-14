import { DEFAULT_COLOR, isAllDayEvent } from "@/components/helpers";
import { CalendarEvent } from "@/components/types";
import { FlexRow } from "@/components/wrappers";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CircleIcon from "@mui/icons-material/Circle";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Paper,
  Popper,
  Select,
  SelectChangeEvent,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import type {} from "@mui/x-date-pickers/AdapterDateFnsV3"; // important for the build to work
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimeField } from "@mui/x-date-pickers/TimeField";
import {
  addHours,
  addMilliseconds,
  addMinutes,
  differenceInMilliseconds,
  differenceInMinutes,
  endOfDay,
  format,
  getHours,
  isSameDay,
  roundToNearestMinutes,
  setHours,
  startOfDay,
} from "date-fns";
import React from "react";

export function CreateEvent<T>({
  event,
  onCloseModalRef,
  onSave,
  onDelete,
  defaultEventColor,
  draft,
  onClose,
  sidebar,
  onEdit,
}: {
  event: CalendarEvent<T>;
  onCloseModalRef: { current?: (cb: () => void) => void };
  onSave: (event: CalendarEvent<T>, originalEvent: CalendarEvent<T>) => void;
  onDelete: (event: CalendarEvent<T>) => void;
  defaultEventColor?: string;
  onClose?: () => void;
  draft?: boolean;
  sidebar?: boolean;
  onEdit: (event: CalendarEvent<T>) => void;
}) {
  const start = event.start;
  const end = event.end;
  const setStart = (newStart: Date) => {
    onEdit({ ...event, start: newStart });
  };
  const setEnd = (newEnd: Date) => {
    onEdit({ ...event, end: newEnd });
  };

  const allDay = isAllDayEvent({ start, end });

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const [onClosed, setOnClosed] = React.useState<undefined | (() => void)>(
    undefined
  );

  onCloseModalRef.current = (cb) => {
    if (!open) {
      cb();
    } else {
      setOpen(false);
      setOnClosed(cb);
    }
  };

  const [title, setTitle] = React.useState(event.title ?? "");

  const colors = [DEFAULT_COLOR, "#5C6BC0", "#EC407A", "#26A69A", "#EF5350"];

  const [eventColor, setEventColor] = React.useState(
    event.styling?.bg ?? defaultEventColor ?? DEFAULT_COLOR
  );

  const unofficialColors = React.useRef<string[]>([]);

  if (!colors.includes(eventColor)) {
    if (!unofficialColors.current.includes(eventColor)) {
      unofficialColors.current.push(eventColor);
    }
  }
  unofficialColors.current.forEach((color) => {
    if (!colors.includes(color)) {
      colors.unshift(color);
    }
  });

  const onChangeEventColor = (event: SelectChangeEvent) => {
    setEventColor(event.target.value);
  };

  const content = (
    <>
      <DialogContent>
        <FlexRow pt={2} gap={2}>
          <Box width={24} />
          <TextField
            autoFocus
            id="name"
            name="title"
            placeholder="Add title and time"
            fullWidth
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            variant="standard"
            size="medium"
            InputProps={{
              sx: {
                fontSize: "1.5rem",
                color: (theme) => theme.palette.text.primary,
              },
            }}
            InputLabelProps={{
              sx: {
                fontSize: "1.5rem",
              },
            }}
          />
        </FlexRow>
        <FlexRow pt={2} alignItems="center" gap={2}>
          <SvgIcon
            sx={{
              path: {
                fill: (theme) => theme.palette.text.primary,
              },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
            >
              <g clipPath="url(#a)">
                <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 2a1 1 0 0 1 .993.883L13 7v4.586l2.707 2.707a1 1 0 0 1-1.32 1.497l-.094-.083-3-3a1 1 0 0 1-.284-.576L11 12V7a1 1 0 0 1 1-1Z" />
              </g>
              <defs>
                <clipPath id="a">
                  <path d="M0 0h24v24H0z" />
                </clipPath>
              </defs>
            </svg>
          </SvgIcon>
          {allDay ? (
            <>
              <DatePicker
                value={start}
                onChange={(date): void => {
                  if (date) {
                    setStart(date);
                    if (differenceInMilliseconds(end, date) < 0) {
                      setEnd(endOfDay(date));
                    }
                  }
                }}
              />
              {"–"}
              <DatePicker
                value={end}
                onChange={(date): void => {
                  if (date) {
                    if (differenceInMilliseconds(date, start) < 0) {
                      setStart(date);
                      setEnd(endOfDay(date));
                    } else {
                      setEnd(date);
                    }
                  }
                }}
              />
            </>
          ) : (
            <>
              <DatePicker
                value={start}
                onChange={(date): void => {
                  if (date) {
                    if (!isSameDay(date, end)) {
                      setEnd(
                        addMilliseconds(
                          date,
                          differenceInMilliseconds(end, start)
                        )
                      );
                    }
                    setStart(date);
                  }
                }}
              />
              <TimePicker
                startTime={startOfDay(start)}
                value={start}
                onChange={(newValue) => {
                  if (newValue) {
                    setStart(newValue);
                  }
                }}
              />
              {"–"}
              <TimePicker
                startTime={start}
                value={end}
                onChange={(newValue) => {
                  if (newValue) {
                    setEnd(newValue);
                  }
                }}
                showDiff
              />
            </>
          )}
        </FlexRow>

        <FlexRow pt={1} gap={2}>
          <Box width={24} />
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allDay}
                  onChange={(ev, checked) => {
                    if (!checked) {
                      if (start.getTime() === startOfDay(start).getTime()) {
                        // set the same hour as now
                        const hours = getHours(addHours(new Date(), 1));
                        const newStart = setHours(start, hours);
                        setStart(newStart);
                        setEnd(addHours(newStart, 1));
                      } else {
                        setEnd(addHours(start, 1));
                      }
                    } else {
                      setStart(startOfDay(start));
                      setEnd(endOfDay(start));
                    }
                  }}
                />
              }
              label="All day"
            />
          </FormGroup>
        </FlexRow>

        <FlexRow pt={1} gap={2} alignItems="flex-end">
          <Box width={24}>
            <Box
              component="svg"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              sx={{ path: { fill: (theme) => theme.palette.text.primary } }}
            >
              <g>
                <path d="M12 22C6.49 22 2 17.51 2 12C2 6.49 6.49 2 12 2C17.51 2 22 6.04 22 11C22 14.31 19.31 17 16 17H14.23C13.95 17 13.73 17.22 13.73 17.5C13.73 17.62 13.78 17.73 13.86 17.83C14.27 18.3 14.5 18.89 14.5 19.5C14.5 20.88 13.38 22 12 22V22ZM12 4C7.59 4 4 7.59 4 12C4 16.41 7.59 20 12 20C12.28 20 12.5 19.78 12.5 19.5C12.5 19.34 12.42 19.22 12.36 19.15C11.95 18.69 11.73 18.1 11.73 17.5C11.73 16.12 12.85 15 14.23 15H16C18.21 15 20 13.21 20 11C20 7.14 16.41 4 12 4Z" />
                <path d="M6.5 13C7.32843 13 8 12.3284 8 11.5C8 10.6716 7.32843 10 6.5 10C5.67157 10 5 10.6716 5 11.5C5 12.3284 5.67157 13 6.5 13Z" />
                <path d="M9.5 9C10.3284 9 11 8.32843 11 7.5C11 6.67157 10.3284 6 9.5 6C8.67157 6 8 6.67157 8 7.5C8 8.32843 8.67157 9 9.5 9Z" />
                <path d="M14.5 9C15.3284 9 16 8.32843 16 7.5C16 6.67157 15.3284 6 14.5 6C13.6716 6 13 6.67157 13 7.5C13 8.32843 13.6716 9 14.5 9Z" />
                <path d="M17.5 13C18.3284 13 19 12.3284 19 11.5C19 10.6716 18.3284 10 17.5 10C16.6716 10 16 10.6716 16 11.5C16 12.3284 16.6716 13 17.5 13Z" />
              </g>
            </Box>
          </Box>

          <Select
            variant="standard"
            size="small"
            value={eventColor}
            onChange={onChangeEventColor}
          >
            {colors.map((hex) => (
              <MenuItem key={hex} value={hex}>
                <Box
                  sx={{
                    background: hex,
                    width: "24px",
                    aspectRatio: 1,
                    borderRadius: "24px",
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FlexRow>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Box />
        <FlexRow gap={1}>
          <Button
            variant="text"
            color="error"
            onClick={() => {
              onDelete(event);
              handleClose();
            }}
          >
            Delete event
          </Button>
          <Divider flexItem {...{ orientation: "vertical" }} />
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              !draft &&
              start.getTime() === event.start.getTime() &&
              end.getTime() === event.end.getTime() &&
              title === event.title &&
              eventColor === (event.styling?.bg ?? defaultEventColor ?? DEFAULT_COLOR)
            }
            onClick={() => {
              onSave(
                {
                  ...event,
                  start,
                  end,
                  title,
                  styling: { ...event.styling, bg: eventColor },
                  canEdit: true,
                },
                event
              );
              handleClose();
            }}
          >
            Save
          </Button>
        </FlexRow>
      </DialogActions>
    </>
  );

  if (sidebar) {
    return (
      <Sidebar open={open} onClosed={onClosed} handleClose={handleClose}>
        {content}
      </Sidebar>
    );
  }

  return (
    <React.Fragment>
      <PopOver open={open} onClosed={onClosed} handleClose={handleClose}>
        {content}
      </PopOver>
    </React.Fragment>
  );
}

function Sidebar({
  children,
  open,
  onClosed,
  handleClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClosed?: () => void;
  handleClose: () => void;
}) {
  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={open}
      onClose={handleClose}
      onTransitionEnd={(event) => {
        if (!open) {
          if (onClosed) {
            onClosed();
          }
        }
      }}
      PaperProps={{
        component: "div",
        sx: { width: 320 },
      }}
    >
      {children}
    </Drawer>
  );
}

function PopOver({
  children,
  open,
  onClosed,
  handleClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClosed?: () => void;
  handleClose: () => void;
}) {
  return (
    <Dialog
      container={() =>
        document.getElementById("more-event-modal") ?? document.body
      }
      open={open}
      onClose={handleClose}
      onTransitionEnd={(event) => {
        if (!open) {
          if (onClosed) {
            onClosed();
          }
        }
      }}
      PaperProps={{
        component: "div",
      }}
      maxWidth={"sm"}
      fullWidth
    >
      {children}
    </Dialog>
  );
}

function TimePicker(props: {
  startTime: Date;
  value: Date;
  onChange: (newValue: Date | null) => void;
  showDiff?: boolean;
}) {
  const firstOption = roundToNearestMinutes(props.startTime, {
    nearestTo: 15,
    roundingMethod: "ceil",
  });
  let options: Date[] = [props.startTime];
  if (props.startTime.getTime() !== firstOption.getTime()) {
    options.push(firstOption);
  }
  for (let i = 1; i < 4; i += 1) {
    options.push(addMinutes(firstOption, i * 15));
  }
  for (let i = 2; i < 48; i += 1) {
    options.push(addMinutes(firstOption, i * 30));
  }
  const [open, setOpen] = React.useState(false);
  const [inputRef, setInputRef] = React.useState<null | HTMLInputElement>(null);
  const [paperRef, setPaperRef] = React.useState<null | HTMLDivElement>(null);

  return (
    <>
      <>
        <TimeField
          value={props.value}
          onChange={props.onChange}
          onSelect={() => {
            setOpen(true);
          }}
          onBlur={(ev) => {
            if (paperRef?.contains(ev.relatedTarget)) {
              return;
            }
            setOpen(false);
          }}
          inputRef={setInputRef}
        ></TimeField>
        <Popper
          open={open}
          anchorEl={inputRef}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <Paper sx={{ maxHeight: 6 * 32, overflow: "auto" }} ref={setPaperRef}>
            {options.map((option, index) => {
              let distance = "";
              if (props.showDiff) {
                const d = differenceInMinutes(option, props.startTime);
                if (d >= 60) {
                  distance = `${d / 60} hr`;
                } else {
                  distance = `${d} mins`;
                }
                distance = ` (${distance})`;
              }
              return (
                <MenuItem
                  key={index}
                  value={option.toJSON()}
                  selected={option.getTime() === props.value.getTime()}
                  onClick={() => {
                    props.onChange(option);
                    setOpen(false);
                  }}
                >
                  {format(option, "h:mm a")}
                  {distance}
                </MenuItem>
              );
            })}
          </Paper>
        </Popper>
      </>
    </>
  );
}
