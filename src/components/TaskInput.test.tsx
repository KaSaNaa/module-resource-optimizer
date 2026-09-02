import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Task } from '../core';
import { TaskInput } from './TaskInput';

function fillAndSubmit(id: string, name: string, cost: string, value: string) {
  return async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText('Id'), id);
    await user.type(screen.getByLabelText('Name'), name);
    await user.type(screen.getByLabelText('Cost'), cost);
    await user.type(screen.getByLabelText('Value'), value);
    await user.click(screen.getByRole('button', { name: /add task/i }));
  };
}

describe('TaskInput', () => {
  it('shows an empty-state message when there are no tasks', () => {
    render(<TaskInput tasks={[]} onAddTask={vi.fn()} onRemoveTask={vi.fn()} />);
    expect(screen.getByText(/no tasks added yet/i)).toBeInTheDocument();
  });

  it('calls onAddTask with a well-formed task on submit', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    render(<TaskInput tasks={[]} onAddTask={onAddTask} onRemoveTask={vi.fn()} />);

    await fillAndSubmit('setup', 'Setup', '2', '5')(user);

    expect(onAddTask).toHaveBeenCalledWith({ id: 'setup', name: 'Setup', cost: 2, value: 5, dependsOn: [] });
  });

  it('rejects a duplicate task id without calling onAddTask', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    const existing: Task[] = [{ id: 'setup', name: 'Setup', cost: 2, value: 5, dependsOn: [] }];
    render(<TaskInput tasks={existing} onAddTask={onAddTask} onRemoveTask={vi.fn()} />);

    await fillAndSubmit('setup', 'Duplicate', '1', '1')(user);

    expect(onAddTask).not.toHaveBeenCalled();
    expect(screen.getByText(/already in use/i)).toBeInTheDocument();
  });

  it('rejects a non-positive cost without calling onAddTask', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    render(<TaskInput tasks={[]} onAddTask={onAddTask} onRemoveTask={vi.fn()} />);

    await fillAndSubmit('a', 'A', '0', '5')(user);

    expect(onAddTask).not.toHaveBeenCalled();
    expect(screen.getByText(/cost must be a positive number/i)).toBeInTheDocument();
  });

  it('renders existing tasks and removes one on click', async () => {
    const user = userEvent.setup();
    const onRemoveTask = vi.fn();
    const existing: Task[] = [{ id: 'setup', name: 'Setup', cost: 2, value: 5, dependsOn: [] }];
    render(<TaskInput tasks={existing} onAddTask={vi.fn()} onRemoveTask={onRemoveTask} />);

    expect(screen.getByRole('listitem')).toHaveTextContent(/Setup/);
    await user.click(screen.getByRole('button', { name: /remove setup/i }));
    expect(onRemoveTask).toHaveBeenCalledWith('setup');
  });
});
