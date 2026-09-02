import { describe, expect, it } from 'vitest';
import { BinarySearchTree } from './BinarySearchTree';

describe('BinarySearchTree', () => {
  it('finds nothing in an empty tree', () => {
    const tree = new BinarySearchTree<number, string>();
    expect(tree.find(5)).toEqual([]);
    expect(tree.inorder()).toEqual([]);
  });

  it('inserts and finds values by key', () => {
    const tree = new BinarySearchTree<number, string>();
    tree.insert(10, 'task-a');
    tree.insert(5, 'task-b');
    tree.insert(15, 'task-c');

    expect(tree.find(10)).toEqual(['task-a']);
    expect(tree.find(5)).toEqual(['task-b']);
    expect(tree.find(15)).toEqual(['task-c']);
    expect(tree.find(999)).toEqual([]);
  });

  it('collects multiple values sharing the same key', () => {
    const tree = new BinarySearchTree<number, string>();
    tree.insert(10, 'task-a');
    tree.insert(10, 'task-b');
    expect(tree.find(10)).toEqual(['task-a', 'task-b']);
  });

  it('produces sorted keys via inorder traversal', () => {
    const tree = new BinarySearchTree<number, string>();
    [10, 5, 15, 3, 7, 12, 20].forEach((key) => tree.insert(key, `task-${key}`));
    expect(tree.inorder().map((entry) => entry.key)).toEqual([3, 5, 7, 10, 12, 15, 20]);
  });
});
