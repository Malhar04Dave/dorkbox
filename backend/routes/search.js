const express = require('express');
const router = express.Router();
const trie = require('../services/search');
const auth = require('../middleware/auth');

// GET /api/search?q=prefix
router.get('/', auth, (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });
    
    const results = trie.search(q);
    res.json(results);
});

module.exports = router;