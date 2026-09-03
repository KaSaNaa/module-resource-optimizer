import React from 'react';
import type { Task } from '../core';

interface DependencyInputProps {
  availableTasks: Task[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function DependencyInput({ availableTasks, selectedIds, onChange }: DependencyInputProps) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selected) => selected !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  if (availableTasks.length === 0) {
    return <p className="dependency-input-empty">No other projects added yet.</p>;
  }

  return (
    <div className="dependency-input" role="group" aria-label="Must be completed after">
      {availableTasks.map((task) => (
        <label key={task.id} className="dependency-checkbox">
          <input type="checkbox" checked={selectedIds.includes(task.id)} onChange={() => toggle(task.id)} />
          {task.name || task.id}
        </label>
      ))}
    </div>
  );
}
