/**
 * @typedef {import('../../type').FileVersion} FileVersion
 * @typedef {import('../../type').BlobRecord} BlobRecord
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');


// Path to the physical storage directory
const STORAGE_DIR = path.join(__dirname, '../../storage/blobs');

// Database Connection
// In a real production environment, load these from process.env
const pool = require('./db/pool');

/**
 * Generates a SHA-256 hash for content-addressable storage.
 * @param {Buffer} buffer - The raw file bytes
 * @returns {string} The hex representation of the hash
 */
function generateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Core upload and deduplication logic.
 * @param {Buffer} fileBuffer - The actual file data in memory
 * @param {string} originalName - Used for versioning/metadata (ignored for physical storage)
 * @param {number} fileId - The logical file ID from the main files table
 * @param {number} userId - The owner ID
 * @returns {Promise<FileVersion>} The newly created version record
 */
async function handleFileUpload(fileBuffer, originalName, fileId, userId) {
    const hash = generateHash(fileBuffer);
    const filePath = path.join(STORAGE_DIR, hash);

    // 1. Check if hash exists in 'blobs' table
    const blobCheck = await pool.query('SELECT * FROM blobs WHERE hash = $1', [hash]);
    
    if (blobCheck.rows.length === 0) {
        // IF NO: Write buffer to disk
        
        // Failsafe: Ensure the directory exists before writing
        if (!fs.existsSync(STORAGE_DIR)) {
            fs.mkdirSync(STORAGE_DIR, { recursive: true });
        }
        
        await fs.promises.writeFile(filePath, fileBuffer);
        
        // Insert into real 'blobs' table
        await pool.query(
            'INSERT INTO blobs (hash, storage_path, size, ref_count) VALUES ($1, $2, $3, $4)', 
            [hash, filePath, fileBuffer.length, 1]
        );
        console.log(`[Storage] New physical blob written: ${hash}`);
    } else {
        // IF YES: Increment ref_count (Deduplication)
        await pool.query(
            'UPDATE blobs SET ref_count = ref_count + 1 WHERE hash = $1', 
            [hash]
        );
        console.log(`[Storage] Deduplicated! Ref count incremented for: ${hash}`);
    }

    // 2. Insert new row into 'file_versions'
    // Let Postgres calculate the next version number dynamically
    const existingVersions = await pool.query(
        'SELECT COUNT(*) FROM file_versions WHERE file_id = $1', 
        [fileId]
    );
    const nextVersionNumber = parseInt(existingVersions.rows[0].count) + 1;

    // Use RETURNING * so Postgres hands back the newly created row immediately
    const versionInsert = await pool.query(
        `INSERT INTO file_versions (file_id, hash, version_number) 
         VALUES ($1, $2, $3) RETURNING *`,
        [fileId, hash, nextVersionNumber]
    );

    return versionInsert.rows[0];
}

/**
 * Retrieves a file from disk for downloading.
 * @param {string} hash - The SHA-256 hash of the blob
 * @returns {Promise<fs.ReadStream>} A readable stream of the file
 */
async function getFileBuffer(hash) {
    const filePath = path.join(STORAGE_DIR, hash);

    // 1. Verify the blob exists in our Postgres database
    const blobCheck = await pool.query('SELECT * FROM blobs WHERE hash = $1', [hash]);
    
    if (blobCheck.rows.length === 0) {
        throw new Error(`Blob ${hash} not found in database.`);
    }

    // 2. Verify the physical file actually exists on the disk
    if (!fs.existsSync(filePath)) {
        throw new Error(`Critical error: Blob ${hash} missing from physical storage.`);
    }

    console.log(`[Storage] Streaming file: ${hash}`);
    
    // 3. Return a readable stream for Express to pipe to the user
    return fs.createReadStream(filePath);
}

/**
 * Restores a file to a previous version by appending a new version record 
 * that points to the historical hash.
 * @param {number} fileId - The logical file ID being restored
 * @param {number} versionNumber - The specific version number to rollback to
 * @returns {Promise<FileVersion>} The newly created version record
 */
async function restoreVersion(fileId, versionNumber) {
    // 1. Find the historical hash the user wants to restore
    const targetQuery = await pool.query(
        'SELECT hash FROM file_versions WHERE file_id = $1 AND version_number = $2',
        [fileId, versionNumber]
    );

    if (targetQuery.rows.length === 0) {
        throw new Error(`Version ${versionNumber} for file ${fileId} not found.`);
    }

    const restoredHash = targetQuery.rows[0].hash;

    // 2. Figure out the next available version number
    const countQuery = await pool.query(
        'SELECT COUNT(*) FROM file_versions WHERE file_id = $1',
        [fileId]
    );
    const nextVersionNumber = parseInt(countQuery.rows[0].count) + 1;

    // 3. Create a new version record pointing to that old hash
    const versionInsert = await pool.query(
        `INSERT INTO file_versions (file_id, hash, version_number) 
         VALUES ($1, $2, $3) RETURNING *`,
        [fileId, restoredHash, nextVersionNumber]
    );

    console.log(`[Storage] File ${fileId} restored to version ${versionNumber}. Logged as new version ${nextVersionNumber}.`);

    // 4. Return the new version data back to the routes
    return versionInsert.rows[0];
}

module.exports = { handleFileUpload, getFileBuffer, restoreVersion };
