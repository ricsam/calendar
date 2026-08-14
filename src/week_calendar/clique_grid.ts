import {
  Clique,
  Component,
  Graph,
  findAllCliques,
  findConnectedComponents,
  findEventOverlaps,
} from "./event_overlap_functions";
import { ModifiableEvent } from "./types";

export function getPositions<T>(events: ModifiableEvent<T>[]) {
  /**
   * Overlaps is a graph where each event is a node and each edge is an overlap between two events
   * For each event, which other events is it overlapping with?
   */
  const overlaps = findEventOverlaps(events);

  /**
   * Each component is an array of event indexes that are connected (like an island in a graph)
   */
  const components = findConnectedComponents(overlaps);

  /**
   * The clique of a graph is a subset of nodes where each node is connected to every other node, i.e. where each event overlaps with every other event
   * Each event can be part of many cliques, but this represents the largest clique for an event, so the max over
   */
  let maxCliques: Clique[] = [];

  /**
   * An improved lookup table for the number of columns for a given event
   */
  let numCols: Record<
    /**
     * Event index
     */
    number,
    /**
     * Number of columns
     */
    number
  > = {};

  const allCliques = findCliques(overlaps);
  // create the numCols and find the maxCliques
  components.forEach((component, index) => {
    // const cliques1 = findAllCliques(overlaps, component);
    const cliques2 = allCliques.filter((clique) =>
      clique.some((node) => component.includes(node)),
    );
    const cliques = cliques2;

    const maxCliqueSizeForComponent = cliques.reduce((max, clique) => {
      return clique.length > max ? clique.length : max;
    }, 0);

    component.forEach((index) => {
      numCols[index] = maxCliqueSizeForComponent;

      const cliquesForEvent = cliques.filter((clique) =>
        clique.includes(index),
      );
      const maxCliqueForEvent = cliquesForEvent.reduce((max, clique) => {
        return clique.length > max.length ? clique : max;
      }, []);
      // console.log("Max Clique for Event", index, maxClique);

      maxCliqueForEvent.sort(sortEvent);
      if (
        !maxCliques
          .map((clique) => clique.join(""))
          .includes(maxCliqueForEvent.join(""))
      ) {
        maxCliques.push(maxCliqueForEvent);
      }
    });
  });

  /**
   * Our sorting algo for the events
   * sort by start time and the by end time
   */
  function sortEvent(a: number, b: number) {
    const startTimeSort = events[a].start.getTime() - events[b].start.getTime();
    if (startTimeSort === 0) {
      return events[a].end.getTime() - events[b].end.getTime();
    }
    return startTimeSort;
  }

  maxCliques.sort((a, b) => {
    if (a.length === 0 || b.length === 0) {
      return 0;
    }
    return sortEvent(a[0], b[0]);
  });

  /**
   * Which row should the event be placed in?
   * This is a lookup table for the vertical position of an event
   * ... vertical as in which y position should the event be placed in
   *
   * But observe this algo works for horizontal positions as well, this is just modelled on the timline view. But it also used for the week calendar where each day is has columns and "horozintalPositions"
   *
   */
  const verticalPositions: Record<
    /**
     * event index
     */
    number,
    /**
     * vertical position
     */
    number
  > = {};

  // construct the vertical positions
  maxCliques.forEach((clique) => {
    const novelPositions = clique.filter(
      (evIndex) => typeof verticalPositions[evIndex] === "undefined",
    );
    const fixedPositions = clique.filter(
      (evIndex) => typeof verticalPositions[evIndex] !== "undefined",
    );

    const verPos: (null | number)[] = [...clique].map(() => null);

    // pin fixed positions
    fixedPositions.forEach((evIndex) => {
      verPos[verticalPositions[evIndex]] = evIndex;
    });

    // add novel positions
    novelPositions.forEach((evIndex) => {
      const nextPos = verPos.findIndex((pos) => pos === null);
      verPos[nextPos] = evIndex;
    });

    verPos.forEach((evIndex, horizontalPos) => {
      if (evIndex === null) {
        return;
      }
      if (typeof verticalPositions[evIndex] === "undefined") {
        // is novel
        verticalPositions[evIndex] = horizontalPos;
      }
    });
  });

  return [verticalPositions, numCols] as const;
}

function findCliques(graph: Graph): Clique[] {
  const cliques: Clique[] = [];
  const allNodes = graph.map((_, index) => index);
  bronKerboschTomita(graph, [], allNodes, [], cliques);
  return cliques;
}

// https://www.geeksforgeeks.org/find-the-number-of-cliques-in-a-graph/
// Hybrid algorithm of Bron-Kerbosch and Tomita
function bronKerboschTomita(
  graph: Graph,
  r: Component,
  p: Component,
  x: Component,
  cliques: Clique[],
) {
  if (p.length === 0 && x.length === 0) {
    cliques.push([...r]);
    return;
  }

  // Choosing a pivot to minimize the size of P
  const pivot = choosePivot(graph, p, x);
  const pWithoutPivotNeighbors = p.filter((v) => !graph[pivot].includes(v));

  for (const v of pWithoutPivotNeighbors) {
    const neighbors = graph[v];
    bronKerboschTomita(
      graph,
      [...r, v],
      p.filter((w) => neighbors.includes(w)),
      x.filter((w) => neighbors.includes(w)),
      cliques,
    );
    p = p.filter((w) => w !== v);
    x.push(v);
  }
}

function choosePivot(graph: Graph, p: Component, x: Component): number {
  let pivot = p[0] || x[0]; // default pivot
  let maxDegree = -1;
  for (const v of [...p, ...x]) {
    const degree = graph[v].length;
    if (degree > maxDegree) {
      maxDegree = degree;
      pivot = v;
    }
  }
  return pivot;
}
