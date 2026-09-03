import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlgorithmSelector } from './AlgorithmSelector';

describe('AlgorithmSelector', () => {
  it('marks the current value as checked', () => {
    render(<AlgorithmSelector value="branch-and-bound" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /best for a large budget/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /best for a small number of projects/i })).not.toBeChecked();
  });

  it('calls onChange with the selected algorithm', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AlgorithmSelector value="dp" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: /fast recommendation/i }));

    expect(onChange).toHaveBeenCalledWith('greedy');
  });

  it('explains each option in plain language with no Big-O notation', () => {
    render(<AlgorithmSelector value="dp" onChange={vi.fn()} />);
    const bodyText = document.body.textContent ?? '';
    expect(bodyText).not.toMatch(/O\(/);
    expect(screen.getByText(/skips options that can't possibly win/i)).toBeInTheDocument();
  });

  it('gives each option a distinct plain-language label with the technical name in brackets', () => {
    render(<AlgorithmSelector value="dp" onChange={vi.fn()} />);
    expect(screen.getByText('(Dynamic Programming)')).toBeInTheDocument();
    expect(screen.getByText('(Branch & Bound)')).toBeInTheDocument();
    expect(screen.getByText('(Greedy)')).toBeInTheDocument();
  });
});
