export type Comparator<T> = (a: T, b: T) => number;

export class MaxHeap<T> {
  private items: T[] = [];
  private readonly compare: Comparator<T>;

  constructor(compare: Comparator<T>) {
    this.compare = compare;
  }

  size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  insert(value: T): void {
    this.items.push(value);
    this.bubbleUp(this.items.length - 1);
  }

  extractMax(): T | undefined {
    if (this.items.length === 0) {
      return undefined;
    }
    const max = this.items[0]!;
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return max;
  }

  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.items[current]!, this.items[parent]!) <= 0) {
        break;
      }
      this.swap(current, parent);
      current = parent;
    }
  }

  private bubbleDown(index: number): void {
    let current = index;
    const length = this.items.length;
    for (;;) {
      const left = current * 2 + 1;
      const right = current * 2 + 2;
      let largest = current;

      if (left < length && this.compare(this.items[left]!, this.items[largest]!) > 0) {
        largest = left;
      }
      if (right < length && this.compare(this.items[right]!, this.items[largest]!) > 0) {
        largest = right;
      }
      if (largest === current) {
        break;
      }
      this.swap(current, largest);
      current = largest;
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.items[i]!;
    this.items[i] = this.items[j]!;
    this.items[j] = tmp;
  }
}
