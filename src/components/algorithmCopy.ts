import type { AlgorithmName } from '../core';

export interface AlgorithmCopy {
  value: AlgorithmName;
  /** What's actually useful/different about this option, in plain language. */
  label: string;
  /** A shorter version of `label`, for tight spaces like a chart legend. */
  shortLabel: string;
  /** The underlying algorithm name, shown in brackets next to the plain-language label. */
  technicalName: string;
  description: string;
}

export const ALGORITHM_COPY: AlgorithmCopy[] = [
  {
    value: 'dp',
    label: 'Best for a small number of projects',
    shortLabel: 'Small portfolios',
    technicalName: 'Dynamic Programming',
    description:
      "Checks every affordable combination to find the true best one. Quick when you're comparing a handful of projects, but can slow down if your budget number is very large.",
  },
  {
    value: 'branch-and-bound',
    label: 'Best for a large budget',
    shortLabel: 'Large budgets',
    technicalName: 'Branch & Bound',
    description: "Also finds the true best combination, but skips options that can't possibly win, so it stays fast even with a large budget.",
  },
  {
    value: 'greedy',
    label: 'Fast recommendation, not guaranteed to be perfect',
    shortLabel: 'Fast pick',
    technicalName: 'Greedy',
    description: 'Approves the highest ROI-per-dollar projects first. Instant results, but it can occasionally miss a slightly better combination.',
  },
];

export const ALGORITHM_COPY_BY_VALUE: Record<AlgorithmName, AlgorithmCopy> = Object.fromEntries(
  ALGORITHM_COPY.map((copy) => [copy.value, copy]),
) as Record<AlgorithmName, AlgorithmCopy>;
