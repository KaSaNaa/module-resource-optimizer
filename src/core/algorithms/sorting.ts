export type Comparator<T> = (a: T, b: T) => number;

/**
 * Stable merge sort, O(n log n) time, O(n) space.
 * Stability matters here: callers sort tasks by value/cost ratio and rely on
 * ties breaking in original input order for deterministic results.
 */
export function mergeSort<T>(input: readonly T[], compare: Comparator<T>): T[] {
  if (input.length <= 1) {
    return input.slice();
  }

  const middle = Math.floor(input.length / 2);
  const left = mergeSort(input.slice(0, middle), compare);
  const right = mergeSort(input.slice(middle), compare);
  return merge(left, right, compare);
}

function merge<T>(left: T[], right: T[], compare: Comparator<T>): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compare(left[i]!, right[j]!) <= 0) {
      result.push(left[i]!);
      i += 1;
    } else {
      result.push(right[j]!);
      j += 1;
    }
  }

  while (i < left.length) {
    result.push(left[i]!);
    i += 1;
  }
  while (j < right.length) {
    result.push(right[j]!);
    j += 1;
  }

  return result;
}
