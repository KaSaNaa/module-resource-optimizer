class BSTNode<K, V> {
  key: K;
  values: V[];
  left: BSTNode<K, V> | null = null;
  right: BSTNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.values = [value];
  }
}

export class BinarySearchTree<K, V> {
  private root: BSTNode<K, V> | null = null;

  insert(key: K, value: V): void {
    if (this.root === null) {
      this.root = new BSTNode(key, value);
      return;
    }

    let current = this.root;
    for (;;) {
      if (key === current.key) {
        current.values.push(value);
        return;
      }
      if (key < current.key) {
        if (current.left === null) {
          current.left = new BSTNode(key, value);
          return;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = new BSTNode(key, value);
          return;
        }
        current = current.right;
      }
    }
  }

  find(key: K): V[] {
    let current = this.root;
    while (current !== null) {
      if (key === current.key) {
        return current.values;
      }
      current = key < current.key ? current.left : current.right;
    }
    return [];
  }

  inorder(): Array<{ key: K; values: V[] }> {
    const result: Array<{ key: K; values: V[] }> = [];
    const visit = (node: BSTNode<K, V> | null): void => {
      if (node === null) {
        return;
      }
      visit(node.left);
      result.push({ key: node.key, values: node.values });
      visit(node.right);
    };
    visit(this.root);
    return result;
  }
}
