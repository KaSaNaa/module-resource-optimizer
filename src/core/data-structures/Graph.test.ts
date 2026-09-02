import { describe, expect, it } from 'vitest';
import { Graph } from './Graph';

describe('Graph', () => {
  it('starts with no nodes', () => {
    const graph = new Graph<string>();
    expect(graph.nodes()).toEqual([]);
  });

  it('registers nodes added standalone or via edges', () => {
    const graph = new Graph<string>();
    graph.addNode('a');
    graph.addEdge('b', 'c');
    expect(graph.nodes().sort()).toEqual(['a', 'b', 'c']);
  });

  it('tracks directed adjacency', () => {
    const graph = new Graph<string>();
    graph.addEdge('a', 'b');
    graph.addEdge('a', 'c');
    graph.addEdge('b', 'c');

    expect(graph.neighbors('a').sort()).toEqual(['b', 'c']);
    expect(graph.neighbors('b')).toEqual(['c']);
    expect(graph.neighbors('c')).toEqual([]);
    expect(graph.neighbors('does-not-exist')).toEqual([]);
  });
});
