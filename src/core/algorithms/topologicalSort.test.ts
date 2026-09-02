import { describe, expect, it } from 'vitest';
import { Graph } from '../data-structures/Graph';
import { detectCycle, kahnTopologicalSort } from './topologicalSort';

function precedesAll(order: string[], before: string, afters: string[]): boolean {
  const beforeIndex = order.indexOf(before);
  return afters.every((after) => order.indexOf(after) > beforeIndex);
}

describe('detectCycle', () => {
  it('reports no cycle for an empty graph', () => {
    const graph = new Graph<string>();
    expect(detectCycle(graph)).toEqual({ hasCycle: false, cyclePath: [] });
  });

  it('reports no cycle for a DAG', () => {
    const graph = new Graph<string>();
    graph.addEdge('a', 'b');
    graph.addEdge('a', 'c');
    graph.addEdge('b', 'd');
    graph.addEdge('c', 'd');
    expect(detectCycle(graph).hasCycle).toBe(false);
  });

  it('detects a direct cycle', () => {
    const graph = new Graph<string>();
    graph.addEdge('a', 'b');
    graph.addEdge('b', 'a');
    const result = detectCycle(graph);
    expect(result.hasCycle).toBe(true);
    expect(result.cyclePath).toContain('a');
    expect(result.cyclePath).toContain('b');
  });

  it('detects an indirect cycle among several nodes', () => {
    const graph = new Graph<string>();
    graph.addEdge('a', 'b');
    graph.addEdge('b', 'c');
    graph.addEdge('c', 'a');
    expect(detectCycle(graph).hasCycle).toBe(true);
  });

  it('detects a self-loop', () => {
    const graph = new Graph<string>();
    graph.addEdge('a', 'a');
    expect(detectCycle(graph).hasCycle).toBe(true);
  });
});

describe('kahnTopologicalSort', () => {
  it('returns an empty order for an empty graph', () => {
    const graph = new Graph<string>();
    expect(kahnTopologicalSort(graph)).toEqual([]);
  });

  it('orders independent nodes with no edges', () => {
    const graph = new Graph<string>();
    graph.addNode('a');
    graph.addNode('b');
    const order = kahnTopologicalSort(graph);
    expect(order.sort()).toEqual(['a', 'b']);
  });

  it('produces a valid order respecting all edges (diamond dependency)', () => {
    const graph = new Graph<string>();
    graph.addEdge('a', 'b');
    graph.addEdge('a', 'c');
    graph.addEdge('b', 'd');
    graph.addEdge('c', 'd');

    const order = kahnTopologicalSort(graph);
    expect(order).toHaveLength(4);
    expect(precedesAll(order, 'a', ['b', 'c', 'd'])).toBe(true);
    expect(precedesAll(order, 'b', ['d'])).toBe(true);
    expect(precedesAll(order, 'c', ['d'])).toBe(true);
  });

  it('produces a partial order when a cycle is present (documented limitation)', () => {
    const graph = new Graph<string>();
    graph.addEdge('a', 'b');
    graph.addEdge('b', 'a');
    const order = kahnTopologicalSort(graph);
    expect(order.length).toBeLessThan(2);
  });
});
