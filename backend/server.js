const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes will be mounted here
// ... existing imports ...
const fileRoutes = require('./routes/files');
app.use('/api/files', fileRoutes);
const folderRoutes = require('./routes/folders');
app.use('/api/folders', folderRoutes);
// ...
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Dorkbox server running on port ${PORT}`);
});