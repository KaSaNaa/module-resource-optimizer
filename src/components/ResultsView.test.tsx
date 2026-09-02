import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { OptimizationResult, Task } from '../core';
import { ResultsView } from './ResultsView';

const tasks: Task[] = [
  { id: 'a', name: 'Task A', cost: 2, value: 3, dependsOn: [] },
  { id: 'b', name: 'Task B', cost: 3, value: 4, dependsOn: ['a'] },
];

describe('ResultsView', () => {
  it('renders summary stats and execution order', () => {
    const result: OptimizationResult = {
      selectedTaskIds: ['a', 'b'],
      executionOrder: ['a', 'b'],
      totalValue: 7,
      totalCost: 5,
      algorithmUsed: 'Dynamic Programming',
      stats: { operationsCount: 42, runtimeMs: 1.234 },
    };

    render(<ResultsView result={result} tasks={tasks} />);

    expect(screen.getByText(/Dynamic Programming/)).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(/Task A \(a\)/)).toBeInTheDocument();
    expect(screen.getByText(/Task B \(b\)/)).toBeInTheDocument();
  });

  it('shows an empty-state message when nothing was selected', () => {
    const result: OptimizationResult = {
      selectedTaskIds: [],
      executionOrder: [],
      totalValue: 0,
      totalCost: 0,
      algorithmUsed: 'Greedy (Heuristic)',
      stats: { operationsCount: 0, runtimeMs: 0 },
    };

    render(<ResultsView result={result} tasks={tasks} />);

    expect(screen.getByText(/no tasks were selected/i)).toBeInTheDocument();
  });
});
