import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Task } from '../core';
import { TaskInput } from './TaskInput';

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, name: string, cost: string, value: string) {
  await user.type(screen.getByLabelText('Project name'), name);
  await user.type(screen.getByLabelText('Budget required ($)'), cost);
  await user.type(screen.getByLabelText('Expected value / ROI score'), value);
  await user.click(screen.getByRole('button', { name: /add project/i }));
}

describe('TaskInput', () => {
  it('shows an empty-state message when there are no projects', () => {
    render(<TaskInput tasks={[]} onAddTask={vi.fn()} onRemoveTask={vi.fn()} />);
    expect(screen.getByText(/no candidate projects added yet/i)).toBeInTheDocument();
  });

  it('calls onAddTask with an auto-generated id derived from the project name', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    render(<TaskInput tasks={[]} onAddTask={onAddTask} onRemoveTask={vi.fn()} />);

    await fillAndSubmit(user, 'Website Redesign', '2', '5');

    expect(onAddTask).toHaveBeenCalledWith({ id: 'website-redesign', name: 'Website Redesign', cost: 2, value: 5, dependsOn: [] });
  });

  it('disambiguates auto-generated ids when two projects share a name', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    const existing: Task[] = [{ id: 'website-redesign', name: 'Website Redesign', cost: 2, value: 5, dependsOn: [] }];
    render(<TaskInput tasks={existing} onAddTask={onAddTask} onRemoveTask={vi.fn()} />);

    await fillAndSubmit(user, 'Website Redesign', '3', '4');

    expect(onAddTask).toHaveBeenCalledWith({ id: 'website-redesign-2', name: 'Website Redesign', cost: 3, value: 4, dependsOn: [] });
  });

  it('rejects a non-positive budget without calling onAddTask', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    render(<TaskInput tasks={[]} onAddTask={onAddTask} onRemoveTask={vi.fn()} />);

    await fillAndSubmit(user, 'A', '0', '5');

    expect(onAddTask).not.toHaveBeenCalled();
    expect(screen.getByText(/budget required must be a positive number/i)).toBeInTheDocument();
  });

  it('rejects a blank project name without calling onAddTask', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    render(<TaskInput tasks={[]} onAddTask={onAddTask} onRemoveTask={vi.fn()} />);

    await user.type(screen.getByLabelText('Budget required ($)'), '5');
    await user.type(screen.getByLabelText('Expected value / ROI score'), '5');
    await user.click(screen.getByRole('button', { name: /add project/i }));

    expect(onAddTask).not.toHaveBeenCalled();
    expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
  });

  it('renders existing projects with budget/ROI and removes one on click', async () => {
    const user = userEvent.setup();
    const onRemoveTask = vi.fn();
    const existing: Task[] = [{ id: 'website-redesign', name: 'Website Redesign', cost: 2, value: 5, dependsOn: [] }];
    render(<TaskInput tasks={existing} onAddTask={vi.fn()} onRemoveTask={onRemoveTask} />);

    expect(screen.getByRole('listitem')).toHaveTextContent('Website Redesign');
    expect(screen.getByRole('listitem')).toHaveTextContent('$2 budget, 5 ROI points');
    await user.click(screen.getByRole('button', { name: /remove website redesign/i }));
    expect(onRemoveTask).toHaveBeenCalledWith('website-redesign');
  });

  it('shows dependency names, not ids, for a project with a prerequisite', () => {
    const existing: Task[] = [
      { id: 'a', name: 'Foundation Work', cost: 2, value: 5, dependsOn: [] },
      { id: 'b', name: 'Follow-up Project', cost: 3, value: 4, dependsOn: ['a'] },
    ];
    render(<TaskInput tasks={existing} onAddTask={vi.fn()} onRemoveTask={vi.fn()} />);

    expect(screen.getByText(/must be completed after: Foundation Work/)).toBeInTheDocument();
  });
});
