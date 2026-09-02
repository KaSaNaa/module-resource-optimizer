import { Graph } from '../data-structures/Graph';
import { LinkedList } from '../data-structures/LinkedList';
import { detectCycle, kahnTopologicalSort } from '../algorithms/topologicalSort';
import { knapsackDP } from '../algorithms/knapsackDP';
import { branchAndBound } from '../algorithms/branchAndBound';
import { greedyAllocator } from '../algorithms/greedyAllocator';
import type { KnapsackSolution } from '../algorithms/types';
import type { OptimizationRequest, OptimizationResult, Task } from '../models/Task';

export class OptimizationValidationError extends Error {}

const ALGORITHM_LABELS: Record<OptimizationRequest['algorithm'], string> = {
  dp: 'Dynamic Programming',
  'branch-and-bound': 'Branch & Bound',
  greedy: 'Greedy (Heuristic)',
};

function validateRequest(request: OptimizationRequest): void {
  if (!Array.isArray(request.tasks) || request.tasks.length === 0) {
    throw new OptimizationValidationError('tasks must be a non-empty array');
  }
  if (!Number.isFinite(request.capacity) || request.capacity <= 0) {
    throw new OptimizationValidationError('capacity must be a positive number');
  }
  if (!['dp', 'branch-and-bound', 'greedy'].includes(request.algorithm)) {
    throw new OptimizationValidationError('algorithm must be one of: dp, branch-and-bound, greedy');
  }

  const knownIds = new Set(request.tasks.map((task) => task.id));
  for (const task of request.tasks) {
    for (const dependencyId of task.dependsOn) {
      if (!knownIds.has(dependencyId)) {
        throw new OptimizationValidationError(`task "${task.id}" depends on unknown task "${dependencyId}"`);
      }
    }
  }
}

function buildDependencyGraph(tasks: readonly Task[]): Graph<string> {
  const graph = new Graph<string>();
  for (const task of tasks) {
    graph.addNode(task.id);
    for (const dependencyId of task.dependsOn) {
      graph.addEdge(dependencyId, task.id);
    }
  }
  return graph;
}

function runAlgorithm(algorithm: OptimizationRequest['algorithm'], tasks: readonly Task[], capacity: number): KnapsackSolution {
  switch (algorithm) {
    case 'dp':
      return knapsackDP(tasks, capacity);
    case 'branch-and-bound':
      return branchAndBound(tasks, capacity);
    case 'greedy':
      return greedyAllocator(tasks, capacity);
    default: {
      const exhaustiveCheck: never = algorithm;
      throw new OptimizationValidationError(`unsupported algorithm: ${exhaustiveCheck as string}`);
    }
  }
}

/**
 * Orchestrates the full optimize pipeline: validate -> build dependency
 * graph -> detect cycles -> topologically order tasks -> run the selected
 * algorithm -> reduce the topological order to the selected tasks so the
 * final execution order still respects dependencies.
 */
export function optimize(request: OptimizationRequest): OptimizationResult {
  const startTime = performance.now();

  validateRequest(request);

  const graph = buildDependencyGraph(request.tasks);

  const cycleResult = detectCycle(graph);
  if (cycleResult.hasCycle) {
    throw new OptimizationValidationError(`dependency graph contains a cycle: ${cycleResult.cyclePath.join(' -> ')}`);
  }

  const topologicalOrder = kahnTopologicalSort(graph);

  const orderedTasks = new LinkedList<Task>();
  const tasksById = new Map(request.tasks.map((task) => [task.id, task]));
  for (const id of topologicalOrder) {
    const task = tasksById.get(id);
    if (task) {
      orderedTasks.pushBack(task);
    }
  }

  const solution = runAlgorithm(request.algorithm, orderedTasks.toArray(), request.capacity);

  const selectedSet = new Set(solution.selectedTaskIds);
  const executionOrder = topologicalOrder.filter((id) => selectedSet.has(id));

  const runtimeMs = performance.now() - startTime;

  return {
    selectedTaskIds: solution.selectedTaskIds,
    executionOrder,
    totalValue: solution.totalValue,
    totalCost: solution.totalCost,
    algorithmUsed: ALGORITHM_LABELS[request.algorithm],
    stats: {
      operationsCount: solution.operationsCount,
      runtimeMs,
    },
  };
}
