import { describe, expect, it } from 'vitest';
import type { Task } from '../models/Task';
import { optimize, OptimizationValidationError } from './ResourceOptimizerService';

function task(id: string, cost: number, value: number, dependsOn: string[] = []): Task {
  return { id, name: id, cost, value, dependsOn };
}

describe('optimize', () => {
  it('rejects an empty task list', () => {
    expect(() => optimize({ tasks: [], capacity: 10, algorithm: 'dp' })).toThrow(OptimizationValidationError);
  });

  it('rejects zero or negative capacity', () => {
    const tasks = [task('a', 1, 1)];
    expect(() => optimize({ tasks, capacity: 0, algorithm: 'dp' })).toThrow(OptimizationValidationError);
    expect(() => optimize({ tasks, capacity: -5, algorithm: 'dp' })).toThrow(OptimizationValidationError);
  });

  it('rejects an unknown algorithm', () => {
    const tasks = [task('a', 1, 1)];
    expect(() => optimize({ tasks, capacity: 10, algorithm: 'bogus' as never })).toThrow(OptimizationValidationError);
  });

  it('rejects a dependsOn reference to an unknown task', () => {
    const tasks = [task('a', 1, 1, ['missing'])];
    expect(() => optimize({ tasks, capacity: 10, algorithm: 'dp' })).toThrow(OptimizationValidationError);
  });

  it('rejects a cyclic dependency graph', () => {
    const tasks = [task('a', 1, 1, ['b']), task('b', 1, 1, ['a'])];
    expect(() => optimize({ tasks, capacity: 10, algorithm: 'dp' })).toThrow(/cycle/i);
  });

  it('produces a "no valid selection" result when nothing fits', () => {
    const tasks = [task('a', 100, 50)];
    const result = optimize({ tasks, capacity: 5, algorithm: 'dp' });
    expect(result.selectedTaskIds).toEqual([]);
    expect(result.executionOrder).toEqual([]);
    expect(result.totalValue).toBe(0);
  });

  it('produces an execution order consistent with dependencies for all three algorithms', () => {
    const tasks = [
      task('setup', 1, 5),
      task('build', 2, 8, ['setup']),
      task('test', 2, 6, ['build']),
      task('deploy', 3, 9, ['test']),
    ];

    for (const algorithm of ['dp', 'branch-and-bound', 'greedy'] as const) {
      const result = optimize({ tasks, capacity: 8, algorithm });
      const order = result.executionOrder;

      if (order.includes('deploy')) {
        expect(order.indexOf('test')).toBeLessThan(order.indexOf('deploy'));
      }
      if (order.includes('test')) {
        expect(order.indexOf('build')).toBeLessThan(order.indexOf('test'));
      }
      if (order.includes('build')) {
        expect(order.indexOf('setup')).toBeLessThan(order.indexOf('build'));
      }
      expect(result.algorithmUsed).toBeTruthy();
      expect(result.stats.runtimeMs).toBeGreaterThanOrEqual(0);
      expect(result.stats.operationsCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('DP and Branch & Bound agree on total value for the same request', () => {
    const tasks = [task('a', 2, 3), task('b', 3, 4), task('c', 4, 5), task('d', 5, 6), task('e', 9, 10)];
    const dpResult = optimize({ tasks, capacity: 10, algorithm: 'dp' });
    const bbResult = optimize({ tasks, capacity: 10, algorithm: 'branch-and-bound' });
    expect(dpResult.totalValue).toBe(bbResult.totalValue);
    expect(dpResult.totalValue).toBe(13);
  });
});
