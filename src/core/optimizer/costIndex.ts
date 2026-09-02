import { BinarySearchTree } from '../data-structures/BinarySearchTree';
import { mergeSort } from '../algorithms/sorting';
import { binarySearch } from '../algorithms/searching';
import type { Task } from '../models/Task';

/** Indexes tasks by cost in a BST for O(log n) average lookup of "tasks costing exactly X". */
export function buildCostIndex(tasks: readonly Task[]): BinarySearchTree<number, Task> {
  const index = new BinarySearchTree<number, Task>();
  for (const task of tasks) {
    index.insert(task.cost, task);
  }
  return index;
}

/**
 * Answers "which tasks cost around X": an exact BST match if one exists,
 * otherwise the nearest distinct cost found via binary search over the
 * sorted list of distinct costs present in `tasks`.
 */
export function findTasksNearCost(tasks: readonly Task[], targetCost: number): { matchedCost: number; tasks: Task[] } | null {
  if (tasks.length === 0) {
    return null;
  }

  const index = buildCostIndex(tasks);
  const exact = index.find(targetCost);
  if (exact.length > 0) {
    return { matchedCost: targetCost, tasks: exact };
  }

  const distinctCosts = mergeSort(Array.from(new Set(tasks.map((task) => task.cost))), (a, b) => a - b);
  const exactIndex = binarySearch(distinctCosts, targetCost, (a, b) => a - b);
  if (exactIndex !== -1) {
    const matchedCost = distinctCosts[exactIndex]!;
    return { matchedCost, tasks: index.find(matchedCost) };
  }

  let nearest = distinctCosts[0]!;
  for (const cost of distinctCosts) {
    if (Math.abs(cost - targetCost) < Math.abs(nearest - targetCost)) {
      nearest = cost;
    }
  }

  return { matchedCost: nearest, tasks: index.find(nearest) };
}
