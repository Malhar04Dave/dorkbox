class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.map = new Map();
    // Sentinel head and tail (dummy nodes)
    this.head = new Node(null, null);
    this.tail = new Node(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _insertAtFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return null;
    const node = this.map.get(key);
    this._remove(node);
    this._insertAtFront(node);
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    }
    const node = new Node(key, value);
    this._insertAtFront(node);
    this.map.set(key, node);
    if (this.map.size > this.capacity) {
      // Evict LRU (tail.prev)
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }

  invalidate(key) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
      this.map.delete(key);
    }
  }
}

module.exports = new LRUCache(100);