import { describe, expect, it } from 'vitest';
import type { Task } from '../models/Task';
import { greedyAllocator } from './greedyAllocator';

function task(id: string, cost: number, value: number): Task {
  return { id, name: id, cost, value, dependsOn: [] };
}

describe('greedyAllocator', () => {
  it('returns nothing for an empty task list', () => {
    const result = greedyAllocator([], 10);
    expect(result).toEqual({ selectedTaskIds: [], totalValue: 0, totalCost: 0, operationsCount: 0 });
  });

  it('returns nothing for zero capacity', () => {
    const tasks = [task('a', 5, 10)];
    const result = greedyAllocator(tasks, 0);
    expect(result.selectedTaskIds).toEqual([]);
  });

  it('rejects a single task larger than capacity', () => {
    const tasks = [task('a', 20, 100)];
    const result = greedyAllocator(tasks, 5);
    expect(result.selectedTaskIds).toEqual([]);
  });

  it('is not guaranteed optimal on the hand-verifiable instance (documented shortfall)', () => {
    // Same instance as the DP/B&B test: optimal is a+b+d = value 13.
    // Ratios: a=1.5, b=1.33, c=1.25, d=1.2, e=1.11 -> greedy order a,b,c,d,e.
    // Greedy takes a(2) -> b(+3=5) -> c(+4=9) -> d needs 5 more (9+5=14>10, skip) -> e needs 9 (skip).
    // Greedy result: a+b+c = value 12, which is < the optimal 13.
    const tasks = [task('a', 2, 3), task('b', 3, 4), task('c', 4, 5), task('d', 5, 6), task('e', 9, 10)];
    const result = greedyAllocator(tasks, 10);
    expect(new Set(result.selectedTaskIds)).toEqual(new Set(['a', 'b', 'c']));
    expect(result.totalValue).toBe(12);
    expect(result.totalValue).toBeLessThan(13);
  });

  it('matches optimal when ratios align cleanly with capacity', () => {
    const tasks = [task('a', 1, 5), task('b', 1, 5), task('c', 1, 5)];
    const result = greedyAllocator(tasks, 100);
    expect(new Set(result.selectedTaskIds)).toEqual(new Set(['a', 'b', 'c']));
    expect(result.totalValue).toBe(15);
  });

  it('reports a "no valid selection" case when every task exceeds capacity', () => {
    const tasks = [task('a', 50, 100), task('b', 60, 200)];
    const result = greedyAllocator(tasks, 10);
    expect(result.selectedTaskIds).toEqual([]);
    expect(result.totalValue).toBe(0);
  });
});
