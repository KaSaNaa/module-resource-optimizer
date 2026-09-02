import { describe, expect, it } from 'vitest';
import type { Task } from '../models/Task';
import { branchAndBound } from './branchAndBound';

function task(id: string, cost: number, value: number): Task {
  return { id, name: id, cost, value, dependsOn: [] };
}

describe('branchAndBound', () => {
  it('returns nothing for an empty task list', () => {
    const result = branchAndBound([], 10);
    expect(result).toEqual({ selectedTaskIds: [], totalValue: 0, totalCost: 0, operationsCount: 0 });
  });

  it('returns nothing for zero capacity', () => {
    const tasks = [task('a', 5, 10)];
    const result = branchAndBound(tasks, 0);
    expect(result.selectedTaskIds).toEqual([]);
  });

  it('rejects a single task larger than capacity', () => {
    const tasks = [task('a', 20, 100)];
    const result = branchAndBound(tasks, 5);
    expect(result.selectedTaskIds).toEqual([]);
    expect(result.totalValue).toBe(0);
  });

  it('solves the same hand-verifiable 5-task instance optimally as DP', () => {
    const tasks = [task('a', 2, 3), task('b', 3, 4), task('c', 4, 5), task('d', 5, 6), task('e', 9, 10)];
    const result = branchAndBound(tasks, 10);
    expect(result.totalValue).toBe(13);
    expect(result.totalCost).toBeLessThanOrEqual(10);
    expect(new Set(result.selectedTaskIds)).toEqual(new Set(['a', 'b', 'd']));
  });

  it('reports a "no valid selection" case when every task exceeds capacity', () => {
    const tasks = [task('a', 50, 100), task('b', 60, 200)];
    const result = branchAndBound(tasks, 10);
    expect(result.selectedTaskIds).toEqual([]);
    expect(result.totalValue).toBe(0);
  });

  it('expands at least one node when a feasible solution exists', () => {
    const tasks = [task('a', 1, 5), task('b', 1, 5)];
    const result = branchAndBound(tasks, 2);
    expect(result.operationsCount).toBeGreaterThan(0);
    expect(result.totalValue).toBe(10);
  });
});
