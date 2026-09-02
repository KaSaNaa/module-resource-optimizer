import { describe, expect, it } from 'vitest';
import { binarySearch } from './searching';

describe('binarySearch', () => {
  const numberCompare = (a: number, b: number) => a - b;

  it('returns -1 for an empty array', () => {
    expect(binarySearch([], 5, numberCompare)).toBe(-1);
  });

  it('finds a value present at any position', () => {
    const sorted = [1, 3, 5, 7, 9, 11, 13];
    expect(binarySearch(sorted, 1, numberCompare)).toBe(0);
    expect(binarySearch(sorted, 13, numberCompare)).toBe(6);
    expect(binarySearch(sorted, 7, numberCompare)).toBe(3);
  });

  it('returns -1 for a value not present', () => {
    const sorted = [1, 3, 5, 7, 9];
    expect(binarySearch(sorted, 4, numberCompare)).toBe(-1);
    expect(binarySearch(sorted, 100, numberCompare)).toBe(-1);
    expect(binarySearch(sorted, -1, numberCompare)).toBe(-1);
  });

  it('works with a single-element array', () => {
    expect(binarySearch([42], 42, numberCompare)).toBe(0);
    expect(binarySearch([42], 7, numberCompare)).toBe(-1);
  });
});
