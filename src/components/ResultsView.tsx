import React from 'react';
import type { AlgorithmName, OptimizationResult, Task } from '../core';
import { ALGORITHM_COPY_BY_VALUE } from './algorithmCopy';

interface ResultsViewProps {
  result: OptimizationResult;
  tasks: Task[];
  capacity: number;
  algorithm: AlgorithmName;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

export function ResultsView({ result, tasks, capacity, algorithm }: ResultsViewProps) {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const approvedCount = result.selectedTaskIds.length;
  const rolloutNames = result.executionOrder.map((id) => tasksById.get(id)?.name ?? id);

  return (
    <div className="results-view">
      <p className="decision-summary">
        {approvedCount === 0 ? (
          <>No projects could be approved within a {formatCurrency(capacity)} budget.</>
        ) : (
          <>
            Approved <strong>{approvedCount} of {tasks.length}</strong> projects, using{' '}
            <strong>{formatCurrency(result.totalCost)}</strong> of your {formatCurrency(capacity)} budget, for a total
            expected value of <strong>{result.totalValue} points</strong>.
            {rolloutNames.length > 0 && (
              <>
                {' '}Suggested rollout order: {rolloutNames.join(' → ')}.
              </>
            )}
          </>
        )}
      </p>
      <p className="decision-method">
        Method used: {ALGORITHM_COPY_BY_VALUE[algorithm].label} <span className="technical-name">({ALGORITHM_COPY_BY_VALUE[algorithm].technicalName})</span>
      </p>

      <h4>Supporting detail</h4>

      <div className="results-summary">
        <div className="results-stat">
          <span className="results-stat-label">Expected value delivered</span>
          <span className="results-stat-value">{result.totalValue}</span>
        </div>
        <div className="results-stat">
          <span className="results-stat-label">Budget used</span>
          <span className="results-stat-value">{formatCurrency(result.totalCost)}</span>
        </div>
        <div className="results-stat">
          <span className="results-stat-label">Computation time</span>
          <span className="results-stat-value">{result.stats.runtimeMs.toFixed(3)} ms</span>
        </div>
        <div className="results-stat">
          <span className="results-stat-label">Combinations evaluated</span>
          <span className="results-stat-value">{result.stats.operationsCount}</span>
        </div>
      </div>

      {result.executionOrder.length > 0 && (
        <ol className="execution-order">
          {result.executionOrder.map((id) => {
            const task = tasksById.get(id);
            return (
              <li key={id}>
                {task ? task.name : id}
                {task && (
                  <span className="task-deps"> ({formatCurrency(task.cost)} budget, {task.value} ROI points)</span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
