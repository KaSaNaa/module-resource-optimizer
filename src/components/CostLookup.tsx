import React, { useState } from 'react';
import type { Task } from '../core';
import { findTasksNearCost } from '../core';

interface CostLookupProps {
  tasks: Task[];
}

export function CostLookup({ tasks }: CostLookupProps) {
  const [target, setTarget] = useState('');

  const parsedTarget = Number(target);
  const result = target !== '' && Number.isFinite(parsedTarget) ? findTasksNearCost(tasks, parsedTarget) : null;

  return (
    <div className="cost-lookup">
      <label>
        Find projects near a budget of ($)
        <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 20000" disabled={tasks.length === 0} />
      </label>
      {result && (
        <p className="cost-lookup-result">
          Closest budget: <strong>${result.matchedCost.toLocaleString()}</strong> ({result.tasks.map((task) => task.name).join(', ')})
        </p>
      )}
    </div>
  );
}
