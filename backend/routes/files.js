const express = require('express');
const multer = require('multer');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const { handleFileUpload, getFileBuffer } = require('../services/storage');
const lru = require('../services/cache'); // Import your cache instance;

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const folder_id = req.body.folder_id || null;
    const fileBuffer = req.file.buffer;
    const userId = req.user.id;

    // 1. Handle physical storage
    const { hash } = await handleFileUpload(fileBuffer);

    // 2. The "Upsert" Algorithm: 
    // If name exists in this folder, update the current_hash. 
    // Otherwise, insert a new record.
    const fileResult = await pool.query(
      `INSERT INTO files (name, folder_id, owner_id, current_hash) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (owner_id, folder_id, name) 
       DO UPDATE SET current_hash = EXCLUDED.current_hash, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.file.originalname, folder_id, userId, hash]
    );

    const savedFile = fileResult.rows[0];

    // 3. Dynamic Versioning Algorithm:
    // Automatically find the current highest version number and add 1.
    await pool.query(
      `INSERT INTO file_versions (file_id, hash, version_number) 
       VALUES ($1, $2, (SELECT COALESCE(MAX(version_number), 0) + 1 
                        FROM file_versions WHERE file_id = $1))`,
      [savedFile.id, hash]
    );

    res.status(201).json(savedFile);
  } catch (err) {
    console.error('Upload Error:', err);
    if (err.code === '23503') {
        return res.status(400).json({ error: 'The specified folder does not exist.' });
    }
    res.status(500).json({ error: 'Upload failed' });
  }
});



router.get('/download/:id', auth, async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  try {
    // 1. Check if metadata is in cache
    const cachedFile = lru.get(fileId);
    let file;

    if (cachedFile) {
      console.log(`[Cache Hit] Serving metadata for file ID: ${fileId}`);
      file = cachedFile;
    } else {
      console.log(`[Cache Miss] Fetching metadata for file ID: ${fileId}`);
      const result = await pool.query(
        'SELECT * FROM files WHERE id = $1 AND owner_id = $2', 
        [fileId, userId]
      );
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
      
      file = result.rows[0];
      // 2. Store in cache for future requests
      lru.put(fileId, file);
    }

    // 3. Get the stream (Note: Physical file streaming isn't usually cached in RAM 
    // to avoid memory overflow; we only cache the metadata)
    const stream = await getFileBuffer(file.current_hash);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    stream.pipe(res);

  } catch (err) {
    console.error('Download Error:', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

router.get('/:id/history', auth, async (req, res) => {
  try {
    const history = await pool.query(
      'SELECT version_number, hash, created_at FROM file_versions WHERE file_id = $1 ORDER BY version_number DESC',
      [req.params.id]
    );
    res.json(history.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    // 1. Get the name before we mark it deleted (for Trie cleanup)
    const fileResult = await pool.query('SELECT name FROM files WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
    if (fileResult.rows.length === 0) return res.status(404).json({ error: 'File not found' });

    // 2. Mark as deleted in DB
    await pool.query('UPDATE files SET is_deleted = TRUE WHERE id = $1', [req.params.id]);

    // 3. Sync Memory Layers
    lru.invalidate(req.params.id); // Remove from Cache
    trie.delete(fileResult.rows[0].name, req.params.id, 'file'); // Remove from Trie

    res.json({ message: 'File moved to trash' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;