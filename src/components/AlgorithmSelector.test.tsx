import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlgorithmSelector } from './AlgorithmSelector';

describe('AlgorithmSelector', () => {
  it('marks the current value as checked', () => {
    render(<AlgorithmSelector value="branch-and-bound" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /branch & bound/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /dynamic programming/i })).not.toBeChecked();
  });

  it('calls onChange with the selected algorithm', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AlgorithmSelector value="dp" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: /greedy/i }));

    expect(onChange).toHaveBeenCalledWith('greedy');
  });
});
