// 1. Load environment variables at the VERY top
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// 2. Initialize the app immediately after importing express
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Global Middleware (Always set up app before using middleware)
app.use(cors());
app.use(express.json());

// 4. Import routes and services
const authRoutes = require('./routes/auth');
const folderRoutes = require('./routes/folders');
const fileRoutes = require('./routes/files');
const searchRoutes = require('./routes/search'); // Import your search routes
const trie = require('./services/search');
const pool = require('./db/pool');

// 5. Mount Routes (Now 'app' is defined and safe to use)
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes); 

// 6. Initialize Trie with existing DB data
async function initSearchIndex() {
    try {
        // ONLY fetch files that are NOT deleted
        const { rows } = await pool.query('SELECT id, name FROM files WHERE is_deleted = FALSE');
        rows.forEach(file => {
            trie.insert(file.name, { id: file.id, type: 'file', name: file.name });
        });
        console.log('[Search] Index initialized with active files.');
    } catch (err) {
        console.error('[Search] Failed to initialize index:', err);
    }
}
initSearchIndex();

// 7. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Dorkbox server running on port ${PORT}`);
});