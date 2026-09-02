import { describe, expect, it } from 'vitest';
import { mergeSort } from './sorting';

describe('mergeSort', () => {
  it('handles empty and single-element arrays', () => {
    expect(mergeSort<number>([], (a, b) => a - b)).toEqual([]);
    expect(mergeSort([5], (a, b) => a - b)).toEqual([5]);
  });

  it('sorts numbers ascending', () => {
    expect(mergeSort([5, 3, 8, 1, 9, 2], (a, b) => a - b)).toEqual([1, 2, 3, 5, 8, 9]);
  });

  it('sorts descending when the comparator is inverted', () => {
    expect(mergeSort([5, 3, 8, 1], (a, b) => b - a)).toEqual([8, 5, 3, 1]);
  });

  it('is stable: equal elements keep their original relative order', () => {
    type Item = { key: number; originalIndex: number };
    const input: Item[] = [
      { key: 1, originalIndex: 0 },
      { key: 2, originalIndex: 1 },
      { key: 1, originalIndex: 2 },
      { key: 2, originalIndex: 3 },
      { key: 1, originalIndex: 4 },
    ];
    const sorted = mergeSort(input, (a, b) => a.key - b.key);
    const keyOneOrder = sorted.filter((item) => item.key === 1).map((item) => item.originalIndex);
    const keyTwoOrder = sorted.filter((item) => item.key === 2).map((item) => item.originalIndex);
    expect(keyOneOrder).toEqual([0, 2, 4]);
    expect(keyTwoOrder).toEqual([1, 3]);
  });

  it('does not mutate the input array', () => {
    const input = [3, 1, 2];
    const result = mergeSort(input, (a, b) => a - b);
    expect(input).toEqual([3, 1, 2]);
    expect(result).toEqual([1, 2, 3]);
  });
});
