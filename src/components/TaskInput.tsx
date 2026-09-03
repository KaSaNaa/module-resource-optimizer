import React, { useState } from 'react';
import type { Task } from '../core';
import { DependencyInput } from './DependencyInput';

interface TaskInputProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onRemoveTask: (id: string) => void;
}

interface Draft {
  name: string;
  cost: string;
  value: string;
  dependsOn: string[];
}

const EMPTY_DRAFT: Draft = { name: '', cost: '', value: '', dependsOn: [] };

/**
 * The core Task type needs a stable id, but a manager entering projects by
 * name shouldn't have to think about ids — so this adapter derives one from
 * the name (web-layer only; Task/OptimizationRequest in core is unchanged).
 */
function generateProjectId(name: string, existingIds: string[]): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'project';
  if (!existingIds.includes(base)) {
    return base;
  }
  let suffix = 2;
  while (existingIds.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export function TaskInput({ tasks, onAddTask, onRemoveTask }: TaskInputProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const name = draft.name.trim();
    const cost = Number(draft.cost);
    const value = Number(draft.value);

    if (name === '') {
      setFormError('Project name is required.');
      return;
    }
    if (!Number.isFinite(cost) || cost <= 0) {
      setFormError('Budget required must be a positive number.');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setFormError('Expected value / ROI score must be a positive number.');
      return;
    }

    setFormError(null);
    const id = generateProjectId(name, tasks.map((task) => task.id));
    onAddTask({ id, name, cost, value, dependsOn: draft.dependsOn });
    setDraft(EMPTY_DRAFT);
  }

  return (
    <div className="task-input">
      <form onSubmit={handleSubmit} className="task-input-form" noValidate>
        <div className="task-input-row">
          <label>
            Project name
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Website Redesign" />
          </label>
          <label>
            Budget required ($)
            <input type="number" min="1" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })} />
          </label>
          <label>
            Expected value / ROI score
            <input type="number" min="1" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
          </label>
        </div>

        <div className="task-input-dependencies">
          <span className="task-input-label">Must be completed after</span>
          <DependencyInput availableTasks={tasks} selectedIds={draft.dependsOn} onChange={(dependsOn) => setDraft({ ...draft, dependsOn })} />
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <button type="submit">Add project</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-list-item">
            <span>
              <strong>{task.name}</strong> (${task.cost.toLocaleString()} budget, {task.value} ROI points)
              {task.dependsOn.length > 0 && (
                <span className="task-deps">
                  {' '}
                  (must be completed after: {task.dependsOn.map((depId) => tasks.find((t) => t.id === depId)?.name ?? depId).join(', ')})
                </span>
              )}
            </span>
            <button type="button" onClick={() => onRemoveTask(task.id)} aria-label={`Remove ${task.name}`}>
              Remove
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="task-list-empty">No candidate projects added yet.</li>}
      </ul>
    </div>
  );
}
