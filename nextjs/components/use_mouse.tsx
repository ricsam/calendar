import {
  addMinutes,
  max,
  min,
  roundToNearestMinutes,
  startOfDay,
  startOfHour,
  startOfMinute,
  subMinutes,
} from "date-fns";
import React, { MutableRefObject } from "react";
import { tuple } from "./helpers";
import { CalendarEvent, ScrollContainer } from "./types";
import { ModifiableEvent } from "./week_calendar/types";

/**
 * The dragged event
 */
export type DraggedEvent<T extends { start: Date; end: Date }> = {
  /**
   * The new event that is being dragged (source event with new start/end)
   */
  dragged: { start: Date; end: Date } | undefined;
  /**
   * The event that is dragged
   */
  source: T;
};

export type MouseStatePos = {
  /**
   * absolute mouse x
   */
  x: number;
  /**
   * absolute mouse y
   */
  y: number;
  /**
   * window scroll x
   */
  scrollX: number;
  /**
   * window scroll y
   */
  scrollY: number;
};

/**
 * Mouse state
 */
export type MouseState = {
  /**
   * is mouse left click down or not?
   */
  down: boolean;
  /**
   * current mouse position
   */
  pos: MouseStatePos | undefined;
  /**
   * initial position of the mouse at mouse down
   */
  pos0: MouseStatePos | undefined;

  /**
   * If the mouse, while the left button is down, has moved
   */
  hasDragged: boolean;
};

/**
 * the container holding the events
 */
export type EventContainer = {
  width: number;
  height: number;
  x: number;
  y: number;
};

/**
 * The position of the event being dragged
 */
export type DragPosition<T extends { start: Date; end: Date }> = {
  /**
   * When creating a new event, the type is "new"
   * When dragging an existing event, the type is "existing"
   */
  type: "new" | "existing";

  event: T;
  /**
   * x position of event (in days)
   */
  x: number;
  /**
   * width (in days)
   */
  w: number;
  /**
   * bounding rect x of event (in px)
   */
  elX: number;
  /**
   * bounding rect y of event (in px)
   */
  elY: number;
  /**
   * the column x position (in px)
   */
  colX: number;

  /**
   * If the event is being resized
   */
  resize: "start" | "end" | undefined;
};

export function useMouse<T>(
  target: string,
  effectRefs: React.MutableRefObject<{
    onMoveEvent?: (
      event: ModifiableEvent<T>,
      start: Date,
      end: Date
    ) => void;
    onClickEvent?: (event: ModifiableEvent<T>, nativeEvent: MouseEvent) => void;
    getEvent: (id: string) => ModifiableEvent<T> | undefined;
    setDraggedEvent: React.Dispatch<
      React.SetStateAction<DraggedEvent<ModifiableEvent<T>> | undefined>
    >;
    /**
     * if event has moved return the new start and end time
     */
    calculateNewTime: (
      state: MouseState,
      dragged: DragPosition<ModifiableEvent<T>>,
      container: EventContainer
    ) => { start: Date; end: Date } | undefined;
    createNewEvent?: (
      pos0: MouseStatePos,
      container: DOMRect
    ) => DragPosition<ModifiableEvent<T>> | undefined;
    onCreateEvent?: (start: Date, end: Date) => void;
    eventContainerRef: React.MutableRefObject<HTMLDivElement | null>;
    scrollContainers: ScrollContainer[];
    constrainResize?: (
      orig: { start: Date; end: Date },
      newTime: { start: Date; end: Date },
      resize: "start" | "end"
    ) => { start: Date; end: Date };
  }>,
  workWeek: boolean
) {
  const daysInWeek = workWeek ? 5 : 7;

  React.useEffect(() => {
    /**
     * Mouse state
     */
    const state: MouseState = {
      down: false,
      pos: undefined,
      pos0: undefined,
      hasDragged: false,
    };
    /**
     * Position data regarding the dragged event
     */
    let dragged: undefined | DragPosition<ModifiableEvent<T>> = undefined;

    let container: undefined | EventContainer;

    const getCurrentScroll = (): { scrollX: number; scrollY: number } => {
      return {
        scrollX: effectRefs.current.scrollContainers
          .map(
            (el): number =>
              el?.current?.scrollX ??
              el?.scrollX ??
              el?.current?.scrollLeft ??
              el?.scrollLeft ??
              0
          )
          .reduce((a, b) => a + b, 0),
        scrollY: effectRefs.current.scrollContainers
          .map(
            (el): number =>
              el?.current?.scrollY ??
              el?.scrollY ??
              el?.current?.scrollTop ??
              el?.scrollTop ??
              0
          )
          .reduce((a, b) => a + b, 0),
      };
    };
    const preventDefault = (ev: Event) => {
      ev.preventDefault();
    };
    let rectPositionPollInterlval: Timer;
    const whileDragging = () => {
      window.addEventListener("selectstart", preventDefault);
      rectPositionPollInterlval = setInterval(() => {
        const containerEl = effectRefs.current.eventContainerRef.current;
        if (!containerEl) {
          return;
        }
        const rect = containerEl.getBoundingClientRect();
        container = {
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
        };
      }, 200);
    };
    const cleanupWhileDragging = () => {
      window.removeEventListener("selectstart", preventDefault);
      clearInterval(rectPositionPollInterlval);
    };

    /**
     * Same as the React.state draggedEvent, but outside the context of react state
     * A "live" version, whereas the state version is only updated after react component updates
     */
    let draggedEvent: DraggedEvent<ModifiableEvent<T>> | undefined = undefined;
    const mouseDown = (ev: MouseEvent) => {
      const containerEl = effectRefs.current.eventContainerRef.current;
      if (!containerEl) {
        return;
      }
      if (ev.target instanceof HTMLElement) {
        const clickedEvent = ev.target.dataset.type === target;
        const clickedContainer = ev.target === containerEl;

        const pos0: MouseStatePos = {
          x: ev.clientX,
          y: ev.clientY,
          ...getCurrentScroll(),
        };

        const activateDrag = () => {
          state.down = true;
          state.pos0 = pos0;
          state.pos = pos0;
          state.hasDragged = false;
          const rect = containerEl.getBoundingClientRect();
          container = {
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y,
          };
          whileDragging();
        };

        if (clickedEvent) {
          const ds = ev.target.dataset;
          const data: {
            index: string;
            x: number;
            w: number;
            colX: number;
          } = JSON.parse(ds.calendarEvent!);
          const event = effectRefs.current.getEvent(data.index);

          if (!event) {
            return;
          }

          const rect = ev.target.getBoundingClientRect();
          dragged = {
            type: "existing",
            event,
            x: data.x,
            w: data.w,
            elX: rect.x,
            elY: rect.y,
            colX: data.colX,
            resize:
              ds.dragSource === "resize-event" && ds.resizePos
                ? (ds.resizePos as "start" | "end")
                : undefined,
          };
          activateDrag();
        } else if (clickedContainer) {
          if (!effectRefs.current.onCreateEvent) {
            // can't create new events
            return;
          }
          if (effectRefs.current.createNewEvent && containerEl) {
            const createNewEvent = effectRefs.current.createNewEvent(
              pos0,
              containerEl.getBoundingClientRect()
            );
            if (createNewEvent) {
              dragged = createNewEvent;
              activateDrag();
            }
          }
        }
      }
      update();
    };
    const mouseMove = (ev: MouseEvent) => {
      const mouseMoved =
        state.pos0 &&
        state.pos &&
        (state.pos0.x !== state.pos.x ||
          state.pos0.y !== state.pos.y ||
          state.pos0.scrollX !== state.pos.scrollX ||
          state.pos0.scrollY !== state.pos.scrollY);

      state.pos = {
        x: ev.clientX,
        y: ev.clientY,
        ...getCurrentScroll(),
      };
      if (state.down && mouseMoved && !state.hasDragged) {
        state.hasDragged = true;
      }
      update();
    };
    const mouseUp = (ev: MouseEvent) => {
      const hasDragged = state.hasDragged;

      state.down = false;
      state.pos = undefined;
      state.pos0 = undefined;
      state.hasDragged = false;
      if (draggedEvent) {
        if (draggedEvent.dragged) {
          if (
            effectRefs.current.onMoveEvent ||
            effectRefs.current.onCreateEvent
          ) {
            const newStart = draggedEvent.dragged.start;
            const newEnd = draggedEvent.dragged.end;
            if (dragged?.type === "new") {
              if (effectRefs.current.onCreateEvent) {
                effectRefs.current.onCreateEvent(newStart, newEnd);
              }
            } else {
              if (effectRefs.current.onMoveEvent) {
                effectRefs.current.onMoveEvent(
                  draggedEvent.source,
                  newStart,
                  newEnd
                );
              }
            }
          }
        }
        if (
          effectRefs.current.onClickEvent &&
          !hasDragged &&
          dragged?.type !== "new"
        ) {
          effectRefs.current.onClickEvent(draggedEvent.source, ev);
        }
      }
      draggedEvent = undefined;
      effectRefs.current.setDraggedEvent(undefined);
      cleanupWhileDragging();
    };
    const scroll = () => {
      if (!state.pos) {
        return;
      }
      state.pos = {
        ...state.pos,
        ...getCurrentScroll(),
      };
      update();
    };
    const cancel = () => {
      state.down = false;
      state.pos = undefined;
      state.pos0 = undefined;
      state.hasDragged = false;
      draggedEvent = undefined;
      effectRefs.current.setDraggedEvent(undefined);
      cleanupWhileDragging();
    };
    const clickEsc = (ev: KeyboardEvent) => {
      if (ev.code === "Escape") {
        cancel();
      }
    };
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mousedown", mouseDown);

    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", clickEsc);

    const cbs = effectRefs.current.scrollContainers.map((el) => {
      let addEventListener =
        el?.current?.addEventListener ?? el?.addEventListener;
      let removeEventListener =
        el?.current?.removeEventListener ?? el?.removeEventListener;

      if (el?.current?.addEventListener) {
        addEventListener = el.current.addEventListener.bind(el.current);
      }
      if (el?.current?.removeEventListener) {
        removeEventListener = el.current.removeEventListener.bind(el.current);
      }
      if (!addEventListener || !removeEventListener) {
        if (el?.addEventListener) {
          addEventListener = el.addEventListener.bind(el);
        }
        if (el?.removeEventListener) {
          removeEventListener = el.removeEventListener.bind(el);
        }
      }

      if (!addEventListener || !removeEventListener) {
        return () => {};
      }

      addEventListener("scroll", scroll, { passive: true });
      return () => {
        if (removeEventListener) {
          removeEventListener("scroll", scroll);
        }
      };
    });

    function update() {
      setUpContainerRefListener();

      if (!container) {
        return;
      }

      if (state.pos && state.down && state.pos0 && dragged) {
        const newEventTime = effectRefs.current.calculateNewTime(
          state,
          dragged,
          container
        );

        /**
         * Update the "live" dragged event
         * Only add dragged if the event has moved
         */
        if (!dragged.event.sourceEvent.canEdit) {
          // only allow clicks when canEdit is false
          draggedEvent = {
            source: dragged.event,
            dragged: undefined,
          };
        } else {
          const resize = (
            resize: "start" | "end",
            newEventTime: { start: Date; end: Date },
            dragged: DragPosition<ModifiableEvent<T>>
          ) => {
            const origStart = dragged.event.sourceEvent.start;
            const origEnd = dragged.event.sourceEvent.end;
            const constrainResize = effectRefs.current.constrainResize;
            if (constrainResize) {
              return constrainResize(
                { start: origStart, end: origEnd },
                newEventTime,
                resize
              );
            }
            return resize === "start"
              ? {
                  start: min([newEventTime.start, subMinutes(origEnd, 15)]),
                  end: origEnd,
                }
              : {
                  start: origStart,
                  end: max([newEventTime.end, addMinutes(origStart, 15)]),
                };
          };
          draggedEvent = {
            source: dragged.event,
            dragged:
              newEventTime &&
              (dragged.type === "new" ||
                // can't drag event if onMoveEvent is not defined
                (dragged.type === "existing" && effectRefs.current.onMoveEvent))
                ? dragged.resize
                  ? resize(dragged.resize, newEventTime, dragged)
                  : {
                      start: newEventTime.start,
                      end: newEventTime.end,
                    }
                : undefined,
          };
        }
        effectRefs.current.setDraggedEvent(draggedEvent);
      }
    }

    let hasSetup = false;
    let cleanupContainerListener: undefined | (() => void);
    function setUpContainerRefListener() {
      if (hasSetup) {
        return;
      }
      const containerEl = effectRefs.current.eventContainerRef.current;
      if (!containerEl) {
        return;
      }

      const constructRect = () => {
        const rect = containerEl.getBoundingClientRect();

        container = {
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
        };
      };

      const resizeObserver = new ResizeObserver(() => {
        constructRect();
      });
      resizeObserver.observe(containerEl);

      cleanupContainerListener = () => {
        resizeObserver.disconnect();
      };

      hasSetup = true;
    }

    return () => {
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", clickEsc);

      cleanupWhileDragging();
      if (cleanupContainerListener) {
        cleanupContainerListener();
      }
      cbs.forEach((cb) => {
        cb();
      });
    };
  }, [daysInWeek, effectRefs, target]);
}

export type SnapFn = (start: Date, end: Date) => { start: Date; end: Date };

export function useDragableEvents<T>(
  events: CalendarEvent<T>[],
  snapEvent?: SnapFn
) {
  const [draggedEvent, setDraggedEvent] = React.useState<
    DraggedEvent<ModifiableEvent<T>> | undefined
  >(undefined);

  const allEvents = React.useMemo(() => {
    /**
     * All events, store reference to the source event and add modifiable start and end times (modified when dragged)
     */
    const allEvents: ModifiableEvent<T>[] = events.map((sourceEvent) => ({
      sourceEvent,
      start: sourceEvent.start,
      end: sourceEvent.end,
    }));

    /**
     * Replace an existing event with the dragged event
     */
    if (draggedEvent?.dragged) {
      const newDragged = {
        ...draggedEvent.source,
        ...draggedEvent.dragged,
      };

      if (snapEvent) {
        const snap = snapEvent(newDragged.start, newDragged.end);
        newDragged.start = snap.start;
        newDragged.end = snap.end;
      }

      const index = allEvents.findIndex(
        (ev) => ev.sourceEvent === draggedEvent.source.sourceEvent
      );
      if (index !== -1) {
        // it is a new event
        allEvents.splice(index, 1, newDragged);
      } else {
        // we are moving an existing event
        allEvents.push(newDragged);
      }
    }
    return allEvents;
  }, [events, draggedEvent, snapEvent]);
  return [allEvents, draggedEvent, setDraggedEvent] as const;
}

/**
 * when dragging an event on the x axis, dayDiff how many days the event has moved
 * @returns
 */
export function dayDiff<T>(
  pos: MouseStatePos,
  pos0: MouseStatePos,
  dragged: DragPosition<ModifiableEvent<T>>,
  daysInWeek: number,
  container: EventContainer
) {
  let rawDelta = pos.x + -pos0.x + pos.scrollX - pos0.scrollX;

  /**
   * offset the rawDelta to be relative to 120 * x
   */
  const offset =
    (pos0.x - dragged.elX + xUnitToPx(dragged.colX, daysInWeek, container)) %
    xUnitToPx(120, daysInWeek, container);

  rawDelta += offset;

  const minDiff = -dragged.x - dragged.w + 1;
  // each event is 120px wide, so we can calculate how many days we have moved
  const delta = Math.min(
    Math.max(
      Math.floor(rawDelta / xUnitToPx(120, daysInWeek, container)),
      minDiff
    ),
    daysInWeek - dragged.x - 1
  );
  return delta;
}

/**
 * the x unit in number of 120px wide days
 * @returns
 */
export function xUnitToPx(
  width: number,
  daysInWeek: number,
  container: EventContainer
) {
  return container.width * (width / (120 * daysInWeek));
}

/**
 * the y unit in number of 120px high days
 * @returns
 */
export function yUnitToPx(
  height: number,
  weeksInMonth: number,
  container: EventContainer
) {
  return container.height * (height / (120 * weeksInMonth));
}

export function useEffectRefs<T>(
  getEvent: (id: string) => ModifiableEvent<T> | undefined,
  setDraggedEvent: React.Dispatch<
    React.SetStateAction<DraggedEvent<ModifiableEvent<T>> | undefined>
  >,
  calculateNewTime: (
    state: MouseState,
    dragged: DragPosition<ModifiableEvent<T>>,
    container: EventContainer
  ) => { start: Date; end: Date } | undefined,
  calendarProps: {
    onMoveEvent?: (
      event: CalendarEvent<T>,
      newStart: Date,
      newEnd: Date
    ) => void;
    onClickEvent?: (event: CalendarEvent<T>, nativeEvent: MouseEvent) => void;
    onCreateEvent?: (start: Date, end: Date) => void;
    scrollContainers: ScrollContainer[];
  },
  createNewEvent?: (
    pos0: MouseStatePos,
    container: DOMRect
  ) => DragPosition<ModifiableEvent<T>> | undefined,
  constrainResize?: (
    orig: { start: Date; end: Date },
    newTime: { start: Date; end: Date },
    resize: "start" | "end"
  ) => { start: Date; end: Date }
) {
  const ome = calendarProps.onMoveEvent;
  const onMoveEvent = ome
    ? (event: ModifiableEvent<T>, start: Date, end: Date) => {
        ome(event.sourceEvent, start, end);
      }
    : undefined;
  const oev = calendarProps.onClickEvent;
  const onClickEvent = oev
    ? (event: ModifiableEvent<T>, nativeEvent: MouseEvent) => {
        oev(event.sourceEvent, nativeEvent);
      }
    : undefined;
  const onCreateEvent = calendarProps.onCreateEvent;

  const eventContainerRef = React.useRef<HTMLDivElement | null>(null);

  const effectRefs = React.useRef({
    onMoveEvent,
    getEvent,
    onClickEvent,
    onCreateEvent,
    setDraggedEvent,
    calculateNewTime,
    eventContainerRef,
    createNewEvent,
    scrollContainers: calendarProps.scrollContainers,
    constrainResize,
  });

  effectRefs.current = {
    onMoveEvent,
    getEvent,
    onCreateEvent,
    onClickEvent,
    setDraggedEvent,
    calculateNewTime,
    eventContainerRef,
    createNewEvent,
    scrollContainers: calendarProps.scrollContainers,
    constrainResize
  };

  return tuple(effectRefs, eventContainerRef);
}
