import { MaxHeap } from '../data-structures/MaxHeap';
import type { Task } from '../models/Task';
import { mergeSort } from './sorting';
import type { KnapsackSolution } from './types';

export type { KnapsackSolution };

interface BBNode {
  level: number;
  cost: number;
  value: number;
  bound: number;
  included: boolean[];
}

function valuePerCost(task: Task): number {
  return task.cost === 0 ? Infinity : task.value / task.cost;
}

/**
 * Fractional-knapsack upper bound for everything from `level` onward,
 * assuming `sortedTasks` is sorted descending by value/cost ratio.
 */
function computeBound(level: number, cost: number, value: number, sortedTasks: readonly Task[], capacity: number): number {
  let bound = value;
  let totalCost = cost;
  let i = level;

  while (i < sortedTasks.length && totalCost + sortedTasks[i]!.cost <= capacity) {
    totalCost += sortedTasks[i]!.cost;
    bound += sortedTasks[i]!.value;
    i += 1;
  }

  if (i < sortedTasks.length) {
    const remainingCapacity = capacity - totalCost;
    const task = sortedTasks[i]!;
    if (task.cost > 0) {
      bound += valuePerCost(task) * remainingCapacity;
    }
  }

  return bound;
}

/**
 * Exact solver via best-first Branch & Bound. Nodes are ordered by a
 * fractional-knapsack upper bound in a MaxHeap so the most promising
 * branches are explored first; a branch is pruned whenever its bound can no
 * longer beat the best solution found so far.
 *
 * Worst case is exponential (O(2^n)), same as brute force, but the bound
 * typically prunes most of the search space in practice.
 */
export function branchAndBound(tasks: readonly Task[], capacity: number): KnapsackSolution {
  let operationsCount = 0;

  if (tasks.length === 0 || capacity <= 0) {
    return { selectedTaskIds: [], totalValue: 0, totalCost: 0, operationsCount };
  }

  const sortedTasks = mergeSort(tasks, (a, b) => valuePerCost(b) - valuePerCost(a));
  const n = sortedTasks.length;

  const heap = new MaxHeap<BBNode>((a, b) => a.bound - b.bound);
  const rootBound = computeBound(0, 0, 0, sortedTasks, capacity);
  heap.insert({ level: 0, cost: 0, value: 0, bound: rootBound, included: [] });

  let bestValue = 0;
  let bestCost = 0;
  let bestIncluded: boolean[] = [];

  while (heap.size() > 0) {
    const node = heap.extractMax()!;
    operationsCount += 1;

    if (node.bound <= bestValue || node.level === n) {
      continue;
    }

    const item = sortedTasks[node.level]!;

    if (node.cost + item.cost <= capacity) {
      const includedCost = node.cost + item.cost;
      const includedValue = node.value + item.value;
      const includedPath = [...node.included, true];

      if (includedValue > bestValue) {
        bestValue = includedValue;
        bestCost = includedCost;
        bestIncluded = includedPath;
      }

      const includedBound = computeBound(node.level + 1, includedCost, includedValue, sortedTasks, capacity);
      if (includedBound > bestValue) {
        heap.insert({ level: node.level + 1, cost: includedCost, value: includedValue, bound: includedBound, included: includedPath });
      }
    }

    const excludedPath = [...node.included, false];
    const excludedBound = computeBound(node.level + 1, node.cost, node.value, sortedTasks, capacity);
    if (excludedBound > bestValue) {
      heap.insert({ level: node.level + 1, cost: node.cost, value: node.value, bound: excludedBound, included: excludedPath });
    }
  }

  const selectedTaskIds = bestIncluded
    .map((included, index) => (included ? sortedTasks[index]!.id : null))
    .filter((id): id is string => id !== null);

  return { selectedTaskIds, totalValue: bestValue, totalCost: bestCost, operationsCount };
}
