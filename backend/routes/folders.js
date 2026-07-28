const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth'); // Importing the guard!

// 1. Create a Folder (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const userId = req.user.id; // Extracted by your auth middleware

    const newFolder = await pool.query(
      'INSERT INTO folders (name, parent_id, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, parent_id, userId]
    );

    res.status(201).json(newFolder.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    // Optional: filter by user if your app requires users to only see their own files
    // const userId = req.user.id; 

    // Get root subfolders (where parent_id is null)
    const subfolders = await pool.query(
      'SELECT * FROM folders WHERE parent_id IS NULL' 
    );
    
    // Get root files (where folder_id is null)
    const files = await pool.query(
      'SELECT * FROM files WHERE folder_id IS NULL'
    );

    // Return the exact structure the frontend expects for the root folder
    res.json({
      current_folder: null,
      breadcrumbs: [],
      subfolders: subfolders.rows,
      files: files.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch root folder' });
  }
});

// 2. Get Folder Contents (Protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const folderId = req.params.id;

    // Get folder details
    const folder = await pool.query('SELECT * FROM folders WHERE id = $1', [folderId]);
    // Get subfolders
    const subfolders = await pool.query('SELECT * FROM folders WHERE parent_id = $1', [folderId]);
    // Get files in this folder
    const files = await pool.query('SELECT * FROM files WHERE folder_id = $1', [folderId]);

    res.json({
      current_folder: folder.rows[0],
      breadcrumbs: [folder.rows[0]], // For a full breadcrumb trail, you would need a recursive SQL query here later
      subfolders: subfolders.rows,
      files: files.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch folder' });
  }
});

module.exports = router;