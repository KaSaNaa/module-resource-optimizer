import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Task } from '../core';
import { CostLookup } from './CostLookup';

const tasks: Task[] = [
  { id: 'a', name: 'Project A', cost: 5, value: 3, dependsOn: [] },
  { id: 'b', name: 'Project B', cost: 20, value: 4, dependsOn: [] },
];

describe('CostLookup', () => {
  it('shows nothing before a target budget is entered', () => {
    render(<CostLookup tasks={tasks} />);
    expect(screen.queryByText(/closest budget/i)).not.toBeInTheDocument();
  });

  it('finds the nearest project by budget as the user types', async () => {
    const user = userEvent.setup();
    render(<CostLookup tasks={tasks} />);

    await user.type(screen.getByLabelText(/find projects near a budget of/i), '8');

    expect(screen.getByText(/closest budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Project A/)).toBeInTheDocument();
  });

  it('disables the input when there are no projects', () => {
    render(<CostLookup tasks={[]} />);
    expect(screen.getByLabelText(/find projects near a budget of/i)).toBeDisabled();
  });
});
