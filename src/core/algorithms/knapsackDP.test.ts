import { describe, expect, it } from 'vitest';
import type { Task } from '../models/Task';
import { knapsackDP } from './knapsackDP';

function task(id: string, cost: number, value: number): Task {
  return { id, name: id, cost, value, dependsOn: [] };
}

describe('knapsackDP', () => {
  it('returns nothing for an empty task list', () => {
    const result = knapsackDP([], 10);
    expect(result).toEqual({ selectedTaskIds: [], totalValue: 0, totalCost: 0, operationsCount: 0 });
  });

  it('returns nothing for zero capacity', () => {
    const tasks = [task('a', 5, 10)];
    const result = knapsackDP(tasks, 0);
    expect(result.selectedTaskIds).toEqual([]);
    expect(result.totalValue).toBe(0);
  });

  it('rejects a single task larger than capacity', () => {
    const tasks = [task('a', 20, 100)];
    const result = knapsackDP(tasks, 5);
    expect(result.selectedTaskIds).toEqual([]);
    expect(result.totalValue).toBe(0);
  });

  it('solves a hand-verifiable 5-task instance optimally', () => {
    // Classic textbook instance: capacity 10.
    // id  cost value
    // a   2    3
    // b   3    4
    // c   4    5
    // d   5    6
    // e   9    10
    // Best combination by hand: b+c+? -> b(3)+c(4)=7 cost, value 9, +a(2)=9 cost value 12 fits (cost 9 <= 10)
    // a+b+c = cost 9, value 12. Adding d would exceed capacity (9+5=14).
    // a+b+d = cost 10, value 13. This is optimal.
    const tasks = [task('a', 2, 3), task('b', 3, 4), task('c', 4, 5), task('d', 5, 6), task('e', 9, 10)];
    const result = knapsackDP(tasks, 10);
    expect(result.totalValue).toBe(13);
    expect(result.totalCost).toBeLessThanOrEqual(10);
    expect(new Set(result.selectedTaskIds)).toEqual(new Set(['a', 'b', 'd']));
  });

  it('reports a "no valid selection" case when every task exceeds capacity', () => {
    const tasks = [task('a', 50, 100), task('b', 60, 200)];
    const result = knapsackDP(tasks, 10);
    expect(result.selectedTaskIds).toEqual([]);
    expect(result.totalValue).toBe(0);
    expect(result.totalCost).toBe(0);
  });

  it('selects everything when capacity is generous', () => {
    const tasks = [task('a', 1, 5), task('b', 1, 5), task('c', 1, 5)];
    const result = knapsackDP(tasks, 100);
    expect(new Set(result.selectedTaskIds)).toEqual(new Set(['a', 'b', 'c']));
    expect(result.totalValue).toBe(15);
  });
});
