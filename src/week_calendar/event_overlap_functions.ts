import {
  startOfDay,
  addDays,
  endOfDay,
  areIntervalsOverlapping,
  min,
  addMinutes,
} from "date-fns";
import { ModifiableEvent } from "./types";

export function getAllDayOverlaps<T>(
  startOfWeek: Date,
  daysInWeek: number,
  events: ModifiableEvent<T>[],
) {
  const overlaps: { [key: string]: (ModifiableEvent<T> | undefined)[] } = {};
  const eventYSlots = new WeakMap<ModifiableEvent<T>, number>();
  for (let i = 0; i < daysInWeek; i++) {
    const eventsOnThisDay = events.filter((event) => {
      const dayStart = startOfDay(addDays(startOfDay(startOfWeek), i));
      const dayEnd = endOfDay(addDays(startOfDay(startOfWeek), i));
      return areIntervalsOverlapping(
        { start: dayStart, end: dayEnd },
        { start: event.start, end: event.end },
      );
    });

    /**
     * The y-position slots
     */
    const slots: (ModifiableEvent<T> | undefined)[] = [];

    let maxSlot: number | undefined = undefined;

    eventsOnThisDay.forEach((event) => {
      // check if the event has already been assigned a slot
      const ySlot = eventYSlots.get(event);
      if (typeof ySlot === "number") {
        // assign the event to the slot, so it is in the same y position as in the other day
        slots[ySlot] = event;

        if (maxSlot === undefined) {
          maxSlot = ySlot;
        }
        if (ySlot > maxSlot) {
          maxSlot = ySlot;
        }
      }
    });

    // populate the array
    if (maxSlot !== undefined) {
      for (let i = 0; i <= maxSlot; i += 1) {
        if (!slots[i]) {
          slots[i] = undefined;
        }
      }
    }

    eventsOnThisDay.forEach((event) => {
      if (slots.includes(event)) {
        return;
      }
      // check each posible slot
      for (let i = 0; i < eventsOnThisDay.length; i += 1) {
        if (!slots[i]) {
          slots[i] = event;
          break;
        }
      }
    });

    slots.forEach((event, i) => {
      // assign slots
      if (event) {
        eventYSlots.set(event, i);
      }
    });

    overlaps[i] = slots;
  }
  return overlaps;
}

export type Graph = number[][];
export type Component = number[];
export type Clique = number[];

// Helper function to perform Depth-First Search (DFS)
const dfs = (
  graph: Graph,
  node: number,
  visited: boolean[],
  component: Component,
) => {
  visited[node] = true;
  component.push(node);

  for (let neighbor of graph[node]) {
    if (!visited[neighbor]) {
      dfs(graph, neighbor, visited, component);
    }
  }
};

// Function to find all connected components
export const findConnectedComponents = (graph: Graph): Component[] => {
  const visited: boolean[] = [];

  for (let i = 0; i < graph.length; i++) {
    visited[i] = false;
  }

  const components: Component[] = [];

  for (let node in graph) {
    const index = parseInt(node);
    if (!visited[index]) {
      const component: Component = [];
      dfs(graph, index, visited, component);
      components.push(component);
    }
  }

  return components;
};

// Helper function to check if a set of nodes form a clique
const isClique = (graph: Graph, nodes: number[]): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (!graph[nodes[i]].includes(nodes[j])) {
        return false;
      }
    }
  }
  return true;
};

export const findAllCliques = (
  graph: Graph,
  component: Component,
): Clique[] => {
  const cliques: Clique[] = [];

  // Brute-force approach to find all cliques
  // Generate all possible subsets and check if they form a clique
  const generateSubsets = (set: number[]): number[][] => {
    const subsets: number[][] = [[]];

    for (let el of set) {
      const newSubsets = subsets.map((subset) => subset.concat(el));
      subsets.push(...newSubsets);
    }

    return subsets;
  };

  const subsets = generateSubsets(component);

  for (let subset of subsets) {
    if (isClique(graph, subset)) {
      cliques.push(subset);
    }
  }

  return cliques;
};

export function findEventOverlaps<T>(events: ModifiableEvent<T>[]) {
  /**
   * For each event, which other events is it overlapping with?
   * Overlaps is a graph where each event is a node and each edge is an overlap between two events
   */
  const overlaps: Graph = [];
  events.forEach((event, index) => {
    if (!overlaps[index]) {
      overlaps[index] = [];
    }
    events.forEach((otherEvent, otherIndex) => {
      if (event === otherEvent) {
        return;
      }
      if (!overlaps[otherIndex]) {
        overlaps[otherIndex] = [];
      }
      if (
        areIntervalsOverlapping(
          {
            start: event.start,
            end: event.end,
            // todo - to make the events only not overlap at the start of events (in the week calendar context)
            // end: min([event.end, addMinutes(event.start, 60)]),
          },
          {
            start: otherEvent.start,
            end: otherEvent.end,
            // end: min([otherEvent.end, addMinutes(otherEvent.start, 60)]),
          },
        )
      ) {
        if (!overlaps[index].includes(otherIndex)) {
          overlaps[index].push(otherIndex);
        }
        if (!overlaps[otherIndex].includes(index)) {
          overlaps[otherIndex].push(index);
        }
      }
    });
  });
  return overlaps;
}
