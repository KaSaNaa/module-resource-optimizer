export class Graph<T> {
  private adjacency = new Map<T, T[]>();

  addNode(node: T): void {
    if (!this.adjacency.has(node)) {
      this.adjacency.set(node, []);
    }
  }

  addEdge(from: T, to: T): void {
    this.addNode(from);
    this.addNode(to);
    this.adjacency.get(from)!.push(to);
  }

  neighbors(node: T): T[] {
    return this.adjacency.get(node) ?? [];
  }

  nodes(): T[] {
    return Array.from(this.adjacency.keys());
  }
}
