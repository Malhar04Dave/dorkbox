const express = require('express');
const multer = require('multer');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const StorageService = require('../services/storage'); // Person B's module

const upload = multer({ storage: multer.memoryStorage() });
const storageService = new StorageService(pool);

// Upload a file (Protected)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { folder_id } = req.body;
    const fileBuffer = req.file.buffer;
    const userId = req.user.id;

    // 1. Process via Storage Service (Hashing & Dedup)
    const { hash } = await storageService.processUpload(fileBuffer);

    // 2. Insert record into files table
    const newFile = await pool.query(
      'INSERT INTO files (name, folder_id, owner_id, current_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.file.originalname, folder_id, userId, hash]
    );

    res.status(201).json(newFile.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;