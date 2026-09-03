import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BenchmarkChart } from './BenchmarkChart';

const sampleRecords = [
  { algorithm: 'dp', n: 10, capacity: 25, runtimeMs: 0.1, operationsCount: 100, totalValue: 50 },
  { algorithm: 'branch-and-bound', n: 10, capacity: 25, runtimeMs: 0.2, operationsCount: 10, totalValue: 50 },
  { algorithm: 'greedy', n: 10, capacity: 25, runtimeMs: 0.05, operationsCount: 5, totalValue: 48 },
  {
    algorithm: 'dp',
    n: 5000,
    capacity: 12500,
    runtimeMs: null,
    operationsCount: null,
    totalValue: null,
    skipped: true,
    skipReason: 'too large',
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BenchmarkChart', () => {
  it('shows a loading state before data arrives', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<BenchmarkChart />);
    expect(screen.getByText(/loading benchmark results/i)).toBeInTheDocument();
  });

  it('renders a plain-language note about the skipped method once data loads, with the technical name in brackets', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => sampleRecords }),
    );
    render(<BenchmarkChart />);
    expect(await screen.findByText(/One method .* was left out for portfolios of 5000 projects/)).toBeInTheDocument();
    expect(screen.getByText(/\(Dynamic Programming\)/)).toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    render(<BenchmarkChart />);
    expect(await screen.findByText(/could not load benchmark results/i)).toBeInTheDocument();
  });
});
