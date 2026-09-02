import type { Task } from '../models/Task';
import type { KnapsackSolution } from './types';

export type { KnapsackSolution };

/**
 * Classic 0/1 knapsack via dynamic programming. Dependency order is ignored
 * here; the caller applies the topological order to the result afterward.
 *
 * Time: O(n * capacity), Space: O(n * capacity) — pseudo-polynomial, since
 * `capacity` is a numeric magnitude, not an input size. This blows up for
 * large capacities even with few tasks, and must be avoided in that regime
 * in favor of Branch & Bound or Greedy.
 */
export function knapsackDP(tasks: readonly Task[], capacity: number): KnapsackSolution {
  const n = tasks.length;
  let operationsCount = 0;

  if (n === 0 || capacity <= 0) {
    return { selectedTaskIds: [], totalValue: 0, totalCost: 0, operationsCount };
  }

  const table: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(capacity + 1).fill(0));

  for (let i = 1; i <= n; i += 1) {
    const task = tasks[i - 1]!;
    for (let c = 0; c <= capacity; c += 1) {
      operationsCount += 1;
      const withoutTask = table[i - 1]![c]!;
      if (task.cost > c) {
        table[i]![c] = withoutTask;
      } else {
        const withTask = table[i - 1]![c - task.cost]! + task.value;
        table[i]![c] = Math.max(withoutTask, withTask);
      }
    }
  }

  const selectedTaskIds: string[] = [];
  let remainingCapacity = capacity;
  for (let i = n; i > 0; i -= 1) {
    const task = tasks[i - 1]!;
    if (table[i]![remainingCapacity] !== table[i - 1]![remainingCapacity]) {
      selectedTaskIds.push(task.id);
      remainingCapacity -= task.cost;
    }
  }
  selectedTaskIds.reverse();

  const totalValue = table[n]![capacity]!;
  const totalCost = selectedTaskIds.reduce((sum, id) => {
    const task = tasks.find((t) => t.id === id)!;
    return sum + task.cost;
  }, 0);

  return { selectedTaskIds, totalValue, totalCost, operationsCount };
}
