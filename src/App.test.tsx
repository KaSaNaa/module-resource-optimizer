import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

async function addProject(user: ReturnType<typeof userEvent.setup>, name: string, cost: string, value: string) {
  await user.type(screen.getByLabelText('Project name'), name);
  await user.type(screen.getByLabelText('Budget required ($)'), cost);
  await user.type(screen.getByLabelText('Expected value / ROI score'), value);
  await user.click(screen.getByRole('button', { name: /add project/i }));
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

  it('runs the optimizer end-to-end after adding projects and shows a decision summary', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addProject(user, 'Setup', '2', '5');
    await addProject(user, 'Build', '3', '8');

    await user.click(screen.getByRole('button', { name: /get recommendation/i }));

    expect(await screen.findByText(/Approved/)).toBeInTheDocument();
    expect(screen.getByText(/Suggested rollout order: Setup → Build/)).toBeInTheDocument();
  });

  it('shows a validation error instead of a decision when the budget is invalid', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addProject(user, 'Setup', '2', '5');

    const capacityInput = screen.getByLabelText(/total available budget/i);
    await user.clear(capacityInput);
    await user.type(capacityInput, '0');

    await user.click(screen.getByRole('button', { name: /get recommendation/i }));

    expect(await screen.findByText(/capacity must be a positive number/i)).toBeInTheDocument();
    expect(screen.queryByText(/Approved/)).not.toBeInTheDocument();
  });

  it('disables Get recommendation until at least one project exists', async () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /get recommendation/i })).toBeDisabled();
    // Let the BenchmarkChart's fetch settle so it doesn't resolve after this test tears down.
    await waitForElementToBeRemoved(() => screen.queryByText(/loading benchmark results/i));
  });

  it('loading the example scenario pre-fills projects and budget, ready to run', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /load example scenario/i }));

    expect(screen.getAllByText('Customer Portal Upgrade').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Data Warehouse Migration').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/total available budget/i)).toHaveValue(70000);
    expect(screen.getByRole('button', { name: /get recommendation/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /get recommendation/i }));
    expect(await screen.findByText(/Approved/)).toBeInTheDocument();
  });
});
