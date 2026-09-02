import { describe, expect, it } from 'vitest';
import { Queue } from './Queue';

describe('Queue', () => {
  it('starts empty', () => {
    const queue = new Queue<number>();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.dequeue()).toBeUndefined();
  });

  it('dequeues in FIFO order', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.dequeue()).toBe(3);
    expect(queue.isEmpty()).toBe(true);
  });

  it('supports interleaved enqueue/dequeue across the internal compaction threshold', () => {
    const queue = new Queue<number>();
    const dequeued: number[] = [];
    for (let i = 0; i < 200; i += 1) {
      queue.enqueue(i);
      if (i % 2 === 0) {
        const value = queue.dequeue();
        if (value !== undefined) {
          dequeued.push(value);
        }
      }
    }
    while (!queue.isEmpty()) {
      const value = queue.dequeue();
      if (value !== undefined) {
        dequeued.push(value);
      }
    }
    expect(dequeued).toEqual(Array.from({ length: 200 }, (_, i) => i));
  });
});
