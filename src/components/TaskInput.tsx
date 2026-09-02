import React, { useState } from 'react';
import type { Task } from '../core';
import { DependencyInput } from './DependencyInput';

interface TaskInputProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onRemoveTask: (id: string) => void;
}

interface Draft {
  id: string;
  name: string;
  cost: string;
  value: string;
  dependsOn: string[];
}

const EMPTY_DRAFT: Draft = { id: '', name: '', cost: '', value: '', dependsOn: [] };

export function TaskInput({ tasks, onAddTask, onRemoveTask }: TaskInputProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const id = draft.id.trim();
    const cost = Number(draft.cost);
    const value = Number(draft.value);

    if (id === '') {
      setFormError('Task id is required.');
      return;
    }
    if (tasks.some((task) => task.id === id)) {
      setFormError(`Task id "${id}" is already in use.`);
      return;
    }
    if (!Number.isFinite(cost) || cost <= 0) {
      setFormError('Cost must be a positive number.');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setFormError('Value must be a positive number.');
      return;
    }

    setFormError(null);
    onAddTask({ id, name: draft.name.trim() || id, cost, value, dependsOn: draft.dependsOn });
    setDraft(EMPTY_DRAFT);
  }

  return (
    <div className="task-input">
      <form onSubmit={handleSubmit} className="task-input-form" noValidate>
        <div className="task-input-row">
          <label>
            Id
            <input value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} placeholder="e.g. build" />
          </label>
          <label>
            Name
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Build artifact" />
          </label>
          <label>
            Cost
            <input type="number" min="1" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })} />
          </label>
          <label>
            Value
            <input type="number" min="1" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
          </label>
        </div>

        <div className="task-input-dependencies">
          <span className="task-input-label">Depends on</span>
          <DependencyInput availableTasks={tasks} selectedIds={draft.dependsOn} onChange={(dependsOn) => setDraft({ ...draft, dependsOn })} />
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <button type="submit">Add task</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-list-item">
            <span>
              <strong>{task.name}</strong> ({task.id}) — cost {task.cost}, value {task.value}
              {task.dependsOn.length > 0 && <span className="task-deps"> depends on: {task.dependsOn.join(', ')}</span>}
            </span>
            <button type="button" onClick={() => onRemoveTask(task.id)} aria-label={`Remove ${task.id}`}>
              Remove
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="task-list-empty">No tasks added yet.</li>}
      </ul>
    </div>
  );
}
