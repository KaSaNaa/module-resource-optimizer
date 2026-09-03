import React from 'react';
import type { AlgorithmName } from '../core';
import { ALGORITHM_COPY } from './algorithmCopy';

interface AlgorithmSelectorProps {
  value: AlgorithmName;
  onChange: (algorithm: AlgorithmName) => void;
}

export function AlgorithmSelector({ value, onChange }: AlgorithmSelectorProps) {
  return (
    <fieldset className="algorithm-selector">
      <legend>How should we pick?</legend>
      {ALGORITHM_COPY.map((option) => (
        <label key={option.value} className="algorithm-option">
          <input
            type="radio"
            name="algorithm"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>
            <strong>
              {option.label} <span className="technical-name">({option.technicalName})</span>
            </strong>
            <span className="algorithm-description">{option.description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
