export class Queue<T> {
  private items: T[] = [];
  private head = 0;

  enqueue(value: T): void {
    this.items.push(value);
  }

  dequeue(): T | undefined {
    if (this.head >= this.items.length) {
      return undefined;
    }
    const value = this.items[this.head];
    this.items[this.head] = undefined as unknown as T;
    this.head += 1;
    if (this.head > 64 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return value;
  }

  isEmpty(): boolean {
    return this.head >= this.items.length;
  }
}
