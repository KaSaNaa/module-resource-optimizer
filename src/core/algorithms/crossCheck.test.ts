import { describe, expect, it } from 'vitest';
import type { Task } from '../models/Task';
import { knapsackDP } from './knapsackDP';
import { branchAndBound } from './branchAndBound';
import { greedyAllocator } from './greedyAllocator';

function task(id: string, cost: number, value: number): Task {
  return { id, name: id, cost, value, dependsOn: [] };
}

/** Brute-force optimal value via exhaustive subset enumeration, for n small enough to be tractable. */
function bruteForceOptimalValue(tasks: readonly Task[], capacity: number): number {
  let best = 0;
  const n = tasks.length;
  for (let mask = 0; mask < 1 << n; mask += 1) {
    let cost = 0;
    let value = 0;
    for (let i = 0; i < n; i += 1) {
      if (mask & (1 << i)) {
        cost += tasks[i]!.cost;
        value += tasks[i]!.value;
      }
    }
    if (cost <= capacity && value > best) {
      best = value;
    }
  }
  return best;
}

function randomInstance(seed: number, n: number): { tasks: Task[]; capacity: number } {
  // Small deterministic LCG so tests are reproducible without a real RNG dependency.
  let state = seed;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  const tasks: Task[] = [];
  for (let i = 0; i < n; i += 1) {
    const cost = 1 + Math.floor(next() * 15);
    const value = 1 + Math.floor(next() * 20);
    tasks.push(task(`t${i}`, cost, value));
  }
  const capacity = 10 + Math.floor(next() * 30);
  return { tasks, capacity };
}

describe('cross-check: DP, Branch & Bound, Greedy', () => {
  it('DP and Branch & Bound agree exactly on the hand-verifiable instance', () => {
    const tasks = [task('a', 2, 3), task('b', 3, 4), task('c', 4, 5), task('d', 5, 6), task('e', 9, 10)];
    const dp = knapsackDP(tasks, 10);
    const bb = branchAndBound(tasks, 10);
    expect(dp.totalValue).toBe(bb.totalValue);
    expect(dp.totalValue).toBe(13);
  });

  it('Greedy never exceeds the optimal value found by DP', () => {
    const tasks = [task('a', 2, 3), task('b', 3, 4), task('c', 4, 5), task('d', 5, 6), task('e', 9, 10)];
    const dp = knapsackDP(tasks, 10);
    const greedy = greedyAllocator(tasks, 10);
    expect(greedy.totalValue).toBeLessThanOrEqual(dp.totalValue);
  });

  it('DP, Branch & Bound, and brute force all agree across random small instances', () => {
    for (let seed = 1; seed <= 15; seed += 1) {
      const { tasks, capacity } = randomInstance(seed, 8);
      const optimal = bruteForceOptimalValue(tasks, capacity);
      const dp = knapsackDP(tasks, capacity);
      const bb = branchAndBound(tasks, capacity);

      expect(dp.totalValue).toBe(optimal);
      expect(bb.totalValue).toBe(optimal);
    }
  });

  it('Greedy is always <= the DP optimum across random instances', () => {
    for (let seed = 1; seed <= 15; seed += 1) {
      const { tasks, capacity } = randomInstance(seed, 10);
      const dp = knapsackDP(tasks, capacity);
      const greedy = greedyAllocator(tasks, capacity);

      expect(greedy.totalValue).toBeLessThanOrEqual(dp.totalValue);
      expect(greedy.totalCost).toBeLessThanOrEqual(capacity);
    }
  });
});
