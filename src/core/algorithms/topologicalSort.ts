import { Graph } from '../data-structures/Graph';
import { Queue } from '../data-structures/Queue';
import { Stack } from '../data-structures/Stack';

export interface CycleDetectionResult {
  hasCycle: boolean;
  cyclePath: string[];
}

/**
 * DFS-based cycle detection using an explicit Stack (three-color marking:
 * unvisited / in-progress / done). O(V + E) time, O(V) space.
 */
export function detectCycle(graph: Graph<string>): CycleDetectionResult {
  const IN_PROGRESS = 1;
  const DONE = 2;
  const state = new Map<string, typeof IN_PROGRESS | typeof DONE>();

  for (const start of graph.nodes()) {
    if (state.get(start) === DONE) {
      continue;
    }

    const stack = new Stack<{ node: string; neighborIndex: number }>();
    const path: string[] = [];
    stack.push({ node: start, neighborIndex: 0 });
    state.set(start, IN_PROGRESS);
    path.push(start);

    while (!stack.isEmpty()) {
      const frame = stack.peek()!;
      const neighbors = graph.neighbors(frame.node);

      if (frame.neighborIndex < neighbors.length) {
        const neighbor = neighbors[frame.neighborIndex]!;
        frame.neighborIndex += 1;

        const neighborState = state.get(neighbor);
        if (neighborState === IN_PROGRESS) {
          const cycleStart = path.indexOf(neighbor);
          return { hasCycle: true, cyclePath: path.slice(cycleStart).concat(neighbor) };
        }
        if (neighborState !== DONE) {
          state.set(neighbor, IN_PROGRESS);
          path.push(neighbor);
          stack.push({ node: neighbor, neighborIndex: 0 });
        }
      } else {
        stack.pop();
        path.pop();
        state.set(frame.node, DONE);
      }
    }
  }

  return { hasCycle: false, cyclePath: [] };
}

/**
 * Kahn's algorithm (BFS-based) using a Queue. O(V + E) time, O(V) space.
 * Assumes the graph is acyclic; run detectCycle first.
 */
export function kahnTopologicalSort(graph: Graph<string>): string[] {
  const inDegree = new Map<string, number>();
  for (const node of graph.nodes()) {
    inDegree.set(node, 0);
  }
  for (const node of graph.nodes()) {
    for (const neighbor of graph.neighbors(node)) {
      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1);
    }
  }

  const queue = new Queue<string>();
  for (const [node, degree] of inDegree) {
    if (degree === 0) {
      queue.enqueue(node);
    }
  }

  const order: string[] = [];
  while (!queue.isEmpty()) {
    const node = queue.dequeue()!;
    order.push(node);
    for (const neighbor of graph.neighbors(node)) {
      const remaining = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, remaining);
      if (remaining === 0) {
        queue.enqueue(neighbor);
      }
    }
  }

  return order;
}
