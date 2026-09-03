import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { OptimizationResult, Task } from '../core';
import { ResultsView } from './ResultsView';

const tasks: Task[] = [
  { id: 'a', name: 'Project A', cost: 2000, value: 3, dependsOn: [] },
  { id: 'b', name: 'Project B', cost: 3000, value: 4, dependsOn: ['a'] },
];

describe('ResultsView', () => {
  it('reads as a decision summary, not a raw data table', () => {
    const result: OptimizationResult = {
      selectedTaskIds: ['a', 'b'],
      executionOrder: ['a', 'b'],
      totalValue: 7,
      totalCost: 5000,
      algorithmUsed: 'Dynamic Programming',
      stats: { operationsCount: 42, runtimeMs: 1.234 },
    };

    render(<ResultsView result={result} tasks={tasks} capacity={10000} algorithm="dp" />);

    expect(screen.getByText(/Approved/)).toHaveTextContent('Approved 2 of 2 projects, using $5,000 of your $10,000 budget, for a total expected value of 7 points.');
    expect(screen.getByText(/Suggested rollout order: Project A → Project B/)).toBeInTheDocument();
    expect(screen.getByText(/Method used: Best for a small number of projects/)).toBeInTheDocument();
    expect(screen.getByText('(Dynamic Programming)')).toBeInTheDocument();
  });

  it('still shows the underlying numbers as supporting detail', () => {
    const result: OptimizationResult = {
      selectedTaskIds: ['a'],
      executionOrder: ['a'],
      totalValue: 3,
      totalCost: 2000,
      algorithmUsed: 'Dynamic Programming',
      stats: { operationsCount: 42, runtimeMs: 1.234 },
    };

    render(<ResultsView result={result} tasks={tasks} capacity={10000} algorithm="dp" />);

    expect(screen.getByText('Supporting detail')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('1.234 ms')).toBeInTheDocument();
  });

  it('shows a plain-language message when nothing could be approved', () => {
    const result: OptimizationResult = {
      selectedTaskIds: [],
      executionOrder: [],
      totalValue: 0,
      totalCost: 0,
      algorithmUsed: 'Greedy (Heuristic)',
      stats: { operationsCount: 0, runtimeMs: 0 },
    };

    render(<ResultsView result={result} tasks={tasks} capacity={500} algorithm="greedy" />);

    expect(screen.getByText(/no projects could be approved within a \$500 budget/i)).toBeInTheDocument();
  });
});
