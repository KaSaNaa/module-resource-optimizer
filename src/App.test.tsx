import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

async function addTask(user: ReturnType<typeof userEvent.setup>, id: string, name: string, cost: string, value: string) {
  await user.type(screen.getByLabelText('Id'), id);
  await user.type(screen.getByLabelText('Name'), name);
  await user.type(screen.getByLabelText('Cost'), cost);
  await user.type(screen.getByLabelText('Value'), value);
  await user.click(screen.getByRole('button', { name: /add task/i }));
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('runs the optimizer end-to-end after adding tasks and shows results', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTask(user, 'setup', 'Setup', '2', '5');
    await addTask(user, 'build', 'Build', '3', '8');

    await user.click(screen.getByRole('button', { name: /run optimization/i }));

    expect(await screen.findByText(/Result —/)).toBeInTheDocument();
    expect(screen.getByText(/Setup \(setup\)/)).toBeInTheDocument();
    expect(screen.getByText(/Build \(build\)/)).toBeInTheDocument();
  });

  it('shows a validation error instead of results when capacity is invalid', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTask(user, 'setup', 'Setup', '2', '5');

    const capacityInput = screen.getByLabelText(/resource capacity/i);
    await user.clear(capacityInput);
    await user.type(capacityInput, '0');

    await user.click(screen.getByRole('button', { name: /run optimization/i }));

    expect(await screen.findByText(/capacity must be a positive number/i)).toBeInTheDocument();
    expect(screen.queryByText(/Result —/)).not.toBeInTheDocument();
  });

  it('disables Run optimization until at least one task exists', async () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /run optimization/i })).toBeDisabled();
    // Let the BenchmarkChart's fetch settle so it doesn't resolve after this test tears down.
    await waitForElementToBeRemoved(() => screen.queryByText(/loading benchmark results/i));
  });
});
