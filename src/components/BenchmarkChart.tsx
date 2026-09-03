import React, { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ALGORITHM_COPY_BY_VALUE } from './algorithmCopy';

interface BenchmarkRecord {
  algorithm: 'dp' | 'branch-and-bound' | 'greedy';
  n: number;
  capacity: number;
  runtimeMs: number | null;
  operationsCount: number | null;
  totalValue: number | null;
  skipped?: boolean;
  skipReason?: string;
}

interface ChartRow {
  n: number;
  dp: number | null;
  'branch-and-bound': number | null;
  greedy: number | null;
}

const ALGORITHM_COLORS: Record<BenchmarkRecord['algorithm'], string> = {
  dp: '#2c3e50',
  'branch-and-bound': '#3498db',
  greedy: '#27ae60',
};

function toChartRows(records: BenchmarkRecord[]): ChartRow[] {
  const byN = new Map<number, ChartRow>();
  for (const record of records) {
    const row = byN.get(record.n) ?? { n: record.n, dp: null, 'branch-and-bound': null, greedy: null };
    row[record.algorithm] = record.skipped ? null : record.runtimeMs;
    byN.set(record.n, row);
  }
  return Array.from(byN.values()).sort((a, b) => a.n - b.n);
}

export function BenchmarkChart() {
  const [records, setRecords] = useState<BenchmarkRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/benchmark-results.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load benchmark results (${response.status})`);
        }
        return response.json() as Promise<BenchmarkRecord[]>;
      })
      .then((data) => {
        if (!cancelled) {
          setRecords(data);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="benchmark-error">Could not load benchmark results: {error}. Run `npm run benchmark` first.</p>;
  }
  if (!records) {
    return <p>Loading benchmark results...</p>;
  }

  const chartRows = toChartRows(records);
  const skippedNotes = records.filter((r) => r.skipped);

  return (
    <div className="benchmark-chart">
      <ResponsiveContainer width="100%" height={430}>
        <LineChart data={chartRows} margin={{ top: 8, right: 24, bottom: 28, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="n" label={{ value: 'Number of candidate projects (n)', position: 'bottom', offset: 0 }} />
          <YAxis label={{ value: 'Time taken (ms)', angle: -90, position: 'insideLeft', offset: -4 }} />
          <Tooltip />
          <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 24, lineHeight: '1.8rem' }} />
          {(['dp', 'branch-and-bound', 'greedy'] as const).map((algorithm) => (
            <Line
              key={algorithm}
              type="monotone"
              dataKey={algorithm}
              name={`${ALGORITHM_COPY_BY_VALUE[algorithm].shortLabel} (${ALGORITHM_COPY_BY_VALUE[algorithm].technicalName})`}
              stroke={ALGORITHM_COLORS[algorithm]}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {skippedNotes.length > 0 && (
        <p className="benchmark-note">
          One method ({ALGORITHM_COPY_BY_VALUE.dp.technicalName}) was left out for portfolios of{' '}
          {skippedNotes.map((r) => r.n).join(' and ')} projects: it's only fast for a small number of projects, and at that size,
          checking every affordable combination exactly needs too much memory to stay practical.
        </p>
      )}
    </div>
  );
}
