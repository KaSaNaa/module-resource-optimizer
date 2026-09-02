import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { knapsackDP } from '../algorithms/knapsackDP';
import { branchAndBound } from '../algorithms/branchAndBound';
import { greedyAllocator } from '../algorithms/greedyAllocator';
import type { Task } from '../models/Task';

interface BenchmarkRecord {
  algorithm: 'dp' | 'branch-and-bound' | 'greedy';
  n: number;
  capacity: number;
  runtimeMs: number;
  operationsCount: number;
  totalValue: number;
  skipped?: boolean;
  skipReason?: string;
}

const SIZES = [10, 50, 100, 500, 1000, 5000];
// capacity scales sub-linearly with n so DP's n*capacity blow-up shows up honestly at larger n.
const CAPACITY_FOR_SIZE = (n: number): number => Math.round(n * 2.5);
// DP is pseudo-polynomial: skip it once n * capacity crosses this threshold to keep the run practical.
const DP_FEASIBILITY_LIMIT = 2_000_000;

function makeRandomInstance(seed: number, n: number): Task[] {
  let state = seed;
  const next = (): number => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  const tasks: Task[] = [];
  for (let i = 0; i < n; i += 1) {
    const cost = 1 + Math.floor(next() * 20);
    const value = 1 + Math.floor(next() * 30);
    // Roughly a third of tasks depend on an earlier one, keeping the graph acyclic by construction.
    const dependsOn = i > 0 && next() < 0.3 ? [`t${Math.floor(next() * i)}`] : [];
    tasks.push({ id: `t${i}`, name: `Task ${i}`, cost, value, dependsOn });
  }
  return tasks;
}

function runOne(
  algorithm: BenchmarkRecord['algorithm'],
  tasks: Task[],
  capacity: number,
): { runtimeMs: number; operationsCount: number; totalValue: number } {
  const start = performance.now();
  const solution =
    algorithm === 'dp' ? knapsackDP(tasks, capacity) : algorithm === 'branch-and-bound' ? branchAndBound(tasks, capacity) : greedyAllocator(tasks, capacity);
  const runtimeMs = performance.now() - start;
  return { runtimeMs, operationsCount: solution.operationsCount, totalValue: solution.totalValue };
}

function runBenchmarks(): BenchmarkRecord[] {
  const records: BenchmarkRecord[] = [];

  for (const n of SIZES) {
    const capacity = CAPACITY_FOR_SIZE(n);
    const tasks = makeRandomInstance(n, n);

    const dpFeasible = n * capacity <= DP_FEASIBILITY_LIMIT;
    if (dpFeasible) {
      const { runtimeMs, operationsCount, totalValue } = runOne('dp', tasks, capacity);
      records.push({ algorithm: 'dp', n, capacity, runtimeMs, operationsCount, totalValue });
    } else {
      records.push({
        algorithm: 'dp',
        n,
        capacity,
        runtimeMs: NaN,
        operationsCount: NaN,
        totalValue: NaN,
        skipped: true,
        skipReason: `n * capacity = ${n * capacity} exceeds practical DP table size (${DP_FEASIBILITY_LIMIT})`,
      });
    }

    const bb = runOne('branch-and-bound', tasks, capacity);
    records.push({ algorithm: 'branch-and-bound', n, capacity, ...bb });

    const greedy = runOne('greedy', tasks, capacity);
    records.push({ algorithm: 'greedy', n, capacity, ...greedy });
  }

  return records;
}

function main(): void {
  const results = runBenchmarks();

  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(here, '..', '..', '..');
  const reportDir = resolve(repoRoot, 'docs', 'report');
  const publicDir = resolve(repoRoot, 'public');

  mkdirSync(reportDir, { recursive: true });

  const json = JSON.stringify(results, null, 2);
  writeFileSync(resolve(reportDir, 'benchmark-results.json'), json);
  writeFileSync(resolve(publicDir, 'benchmark-results.json'), json);

  console.log(`Wrote ${results.length} benchmark records to docs/report/benchmark-results.json and public/benchmark-results.json`);
}

main();
