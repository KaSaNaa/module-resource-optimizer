import type { Task } from '../models/Task';
import { mergeSort } from './sorting';
import type { KnapsackSolution } from './types';

export type { KnapsackSolution };

function valuePerCost(task: Task): number {
  return task.cost === 0 ? Infinity : task.value / task.cost;
}

/**
 * Heuristic/approximation solver: sort by value/cost ratio descending
 * (merge sort, O(n log n)), then greedily take tasks while they fit.
 *
 * This is optimal for the fractional-knapsack relaxation but NOT guaranteed
 * optimal for 0/1 knapsack — a single high-ratio item that doesn't fit can
 * cause it to miss a better combination that DP/Branch & Bound would find.
 */
export function greedyAllocator(tasks: readonly Task[], capacity: number): KnapsackSolution {
  let operationsCount = 0;

  if (tasks.length === 0 || capacity <= 0) {
    return { selectedTaskIds: [], totalValue: 0, totalCost: 0, operationsCount };
  }

  const sortedTasks = mergeSort(tasks, (a, b) => valuePerCost(b) - valuePerCost(a));

  const selectedTaskIds: string[] = [];
  let totalValue = 0;
  let totalCost = 0;

  for (const task of sortedTasks) {
    operationsCount += 1;
    if (totalCost + task.cost <= capacity) {
      selectedTaskIds.push(task.id);
      totalCost += task.cost;
      totalValue += task.value;
    }
  }

  return { selectedTaskIds, totalValue, totalCost, operationsCount };
}
