import React from 'react';
import type { OptimizationResult, Task } from '../core';

interface ResultsViewProps {
  result: OptimizationResult;
  tasks: Task[];
}

export function ResultsView({ result, tasks }: ResultsViewProps) {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));

  return (
    <div className="results-view">
      <h3>Result — {result.algorithmUsed}</h3>

      <div className="results-summary">
        <div className="results-stat">
          <span className="results-stat-label">Total value</span>
          <span className="results-stat-value">{result.totalValue}</span>
        </div>
        <div className="results-stat">
          <span className="results-stat-label">Total cost</span>
          <span className="results-stat-value">{result.totalCost}</span>
        </div>
        <div className="results-stat">
          <span className="results-stat-label">Runtime</span>
          <span className="results-stat-value">{result.stats.runtimeMs.toFixed(3)} ms</span>
        </div>
        <div className="results-stat">
          <span className="results-stat-label">Operations</span>
          <span className="results-stat-value">{result.stats.operationsCount}</span>
        </div>
      </div>

      <h4>Execution order</h4>
      {result.executionOrder.length === 0 ? (
        <p className="results-empty">No tasks were selected within the given capacity.</p>
      ) : (
        <ol className="execution-order">
          {result.executionOrder.map((id) => {
            const task = tasksById.get(id);
            return (
              <li key={id}>
                {task ? `${task.name} (${task.id})` : id}
                {task && <span className="task-deps"> — cost {task.cost}, value {task.value}</span>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
