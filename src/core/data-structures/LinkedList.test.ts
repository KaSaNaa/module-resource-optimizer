import { describe, expect, it } from 'vitest';
import { LinkedList } from './LinkedList';

describe('LinkedList', () => {
  it('starts empty', () => {
    const list = new LinkedList<number>();
    expect(list.size()).toBe(0);
    expect(list.toArray()).toEqual([]);
  });

  it('preserves insertion order via pushBack', () => {
    const list = new LinkedList<string>();
    list.pushBack('a');
    list.pushBack('b');
    list.pushBack('c');
    expect(list.toArray()).toEqual(['a', 'b', 'c']);
    expect(list.size()).toBe(3);
  });

  it('handles a single element', () => {
    const list = new LinkedList<number>();
    list.pushBack(42);
    expect(list.toArray()).toEqual([42]);
    expect(list.size()).toBe(1);
  });
});
