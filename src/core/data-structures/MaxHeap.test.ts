import { describe, expect, it } from 'vitest';
import { MaxHeap } from './MaxHeap';

describe('MaxHeap', () => {
  it('starts empty', () => {
    const heap = new MaxHeap<number>((a, b) => a - b);
    expect(heap.size()).toBe(0);
    expect(heap.peek()).toBeUndefined();
    expect(heap.extractMax()).toBeUndefined();
  });

  it('extracts values in descending order for numbers', () => {
    const heap = new MaxHeap<number>((a, b) => a - b);
    [5, 1, 9, 3, 7, 2, 8].forEach((value) => heap.insert(value));
    expect(heap.size()).toBe(7);

    const extracted: number[] = [];
    while (heap.size() > 0) {
      const max = heap.extractMax();
      if (max !== undefined) {
        extracted.push(max);
      }
    }
    expect(extracted).toEqual([9, 8, 7, 5, 3, 2, 1]);
  });

  it('respects a custom comparator on objects', () => {
    type Node = { bound: number };
    const heap = new MaxHeap<Node>((a, b) => a.bound - b.bound);
    heap.insert({ bound: 10 });
    heap.insert({ bound: 50 });
    heap.insert({ bound: 30 });

    expect(heap.peek()?.bound).toBe(50);
    expect(heap.extractMax()?.bound).toBe(50);
    expect(heap.extractMax()?.bound).toBe(30);
    expect(heap.extractMax()?.bound).toBe(10);
  });
});
