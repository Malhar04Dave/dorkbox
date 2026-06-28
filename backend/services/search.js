class TrieNode {
  constructor() {
    this.children = {};
    this.results = []; // stores { id, type, name, path } at terminal
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(name, meta) {
    // meta = { id, type, name, path }
    let node = this.root;
    for (const ch of name.toLowerCase()) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    // Avoid duplicates
    if (!node.results.find(r => r.id === meta.id && r.type === meta.type)) {
      node.results.push(meta);
    }
  }

  _collect(node, results) {
    if (node.results.length) results.push(...node.results);
    for (const child of Object.values(node.children)) {
      this._collect(child, results);
    }
  }

  search(prefix) {
    let node = this.root;
    for (const ch of prefix.toLowerCase()) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    const results = [];
    this._collect(node, results);
    return results;
  }

  delete(name, id, type) {
    let node = this.root;
    for (const ch of name.toLowerCase()) {
      if (!node.children[ch]) return;
      node = node.children[ch];
    }
    node.results = node.results.filter(r => !(r.id === id && r.type === type));
  }
}

module.exports = new Trie();