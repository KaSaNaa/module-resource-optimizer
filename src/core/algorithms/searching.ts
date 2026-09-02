import type { Comparator } from './sorting';

/**
 * Binary search over an array sorted ascending per `compare`.
 * O(log n) time, O(1) space. Returns the index of a match, or -1.
 */
export function binarySearch<T>(sortedArray: readonly T[], target: T, compare: Comparator<T>): number {
  let low = 0;
  let high = sortedArray.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const comparison = compare(sortedArray[mid]!, target);

    if (comparison === 0) {
      return mid;
    }
    if (comparison < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}
