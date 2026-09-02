import React from 'react';
import type { AlgorithmName } from '../core';

interface AlgorithmSelectorProps {
  value: AlgorithmName;
  onChange: (algorithm: AlgorithmName) => void;
}

const OPTIONS: Array<{ value: AlgorithmName; label: string; description: string }> = [
  { value: 'dp', label: 'Dynamic Programming', description: 'Exact, O(n·capacity) time/space' },
  { value: 'branch-and-bound', label: 'Branch & Bound', description: 'Exact, best-first search with pruning' },
  { value: 'greedy', label: 'Greedy', description: 'Heuristic, value/cost ratio, not always optimal' },
];

export function AlgorithmSelector({ value, onChange }: AlgorithmSelectorProps) {
  return (
    <fieldset className="algorithm-selector">
      <legend>Algorithm</legend>
      {OPTIONS.map((option) => (
        <label key={option.value} className="algorithm-option">
          <input
            type="radio"
            name="algorithm"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>
            <strong>{option.label}</strong>
            <span className="algorithm-description">{option.description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
