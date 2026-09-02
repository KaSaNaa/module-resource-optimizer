export interface Task {
  id: string;
  name: string;
  cost: number;
  value: number;
  dependsOn: string[];
}

export type AlgorithmName = 'dp' | 'branch-and-bound' | 'greedy';

export interface OptimizationRequest {
  tasks: Task[];
  capacity: number;
  algorithm: AlgorithmName;
}

export interface OptimizationStats {
  operationsCount: number;
  runtimeMs: number;
}

export interface OptimizationResult {
  selectedTaskIds: string[];
  executionOrder: string[];
  totalValue: number;
  totalCost: number;
  algorithmUsed: string;
  stats: OptimizationStats;
}
