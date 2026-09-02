import { describe, expect, it } from 'vitest';
import type { Task } from '../models/Task';
import { buildCostIndex, findTasksNearCost } from './costIndex';

function task(id: string, cost: number, value: number): Task {
  return { id, name: id, cost, value, dependsOn: [] };
}

describe('buildCostIndex', () => {
  it('groups tasks that share a cost', () => {
    const tasks = [task('a', 5, 1), task('b', 5, 2), task('c', 10, 3)];
    const index = buildCostIndex(tasks);
    expect(index.find(5).map((t) => t.id).sort()).toEqual(['a', 'b']);
    expect(index.find(10).map((t) => t.id)).toEqual(['c']);
    expect(index.find(999)).toEqual([]);
  });
});

describe('findTasksNearCost', () => {
  it('returns null for an empty task list', () => {
    expect(findTasksNearCost([], 5)).toBeNull();
  });

  it('returns an exact match when available', () => {
    const tasks = [task('a', 5, 1), task('b', 10, 2)];
    const result = findTasksNearCost(tasks, 10);
    expect(result?.matchedCost).toBe(10);
    expect(result?.tasks.map((t) => t.id)).toEqual(['b']);
  });

  it('falls back to the nearest distinct cost when no exact match exists', () => {
    const tasks = [task('a', 5, 1), task('b', 20, 2)];
    const result = findTasksNearCost(tasks, 8);
    expect(result?.matchedCost).toBe(5);
    expect(result?.tasks.map((t) => t.id)).toEqual(['a']);
  });

  it('breaks nearest-cost ties toward the lower cost', () => {
    const tasks = [task('a', 5, 1), task('b', 15, 2)];
    const result = findTasksNearCost(tasks, 10);
    expect(result?.matchedCost).toBe(5);
  });
});
