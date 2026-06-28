// src/services/storage.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../../storage/blobs');

//This is mock DB. need to replace it after schema.sql
const mockBlocksDb = new Map(); //Key: hash, Value: {size,ref_count }
const mockVersionsDb = [];

/**
 * Core upload and dedup logic.
 * @param {Buffer} fileBuffer - The actual file data in memory
 * @param {string} originalName - Used for versioning/metadata
 * @param {number} fileId - The logical file ID (if updating an existing file)
 * @param {number} userId - The owner
 */
async function handleFileUpload(fileBuffer, originalName, fileId, userId) {
    // 1. Generate SHA-256 hash of fileBuffer
    const hash = generateHash(fileBuffer);
    const filePath = path.joins(STORAGE_DIR, hash);
    
    // 2. Check if hash exists in 'blobs' table
    let blobRecord = mockBlobsDb.get(hash);

    if(!blobRecord) {
	// 3. IF NO: Write buffer to disk at STORAGE_DIR/<hash>, insert into 'blobs' (ref_count = 1)
	if(!fs.existsSync(STORAGE_DIR)) {
	    fs.mkdirSync(STORAGE_DIR, {recrusive: true});
	}

	await fs.promises.writeFile(filePath,fileBuffer);

	blobRecord = { size: fileBuffer.length, ref_count: 1};
	mockBlobsDb.set(hash,blobRecord);

	console.log(`[Storage] New blob written to disk: ${hash}`);
    } else {
	// 4. IF YES: Increment ref_count in 'blobs'
	blobRecord.ref_count += 1;
	mockBlobsDb.set(hash,blobRecord);

	console.log(`Deduplicated. New ref count for ${hash} is now ${blobRecord.ref_count}`);
    }

    // 5. Insert new row into 'file_versions'
    const existingVersions = mockVersionsDb.filter(v => v.file_id === fileId);
    const nextVersionNumber = existingVersions.length + 1;

    const newVersion = {
	id: mockVersionsDb.length + 1,
	file_id: fileId,
	hash: hash,
	version_number: nextVersionNumber,
	created_at: new Date().toISOString()
    };

    mockVersionsDb.push(newVersion);
    // 6. Return the new version data
    return newVersion;
}

async function getFileBuffer(hash) {
    // Read file from STORAGE_DIR/<hash> and return stream/buffer
    const filePath = path.join(STORAGE_DIR, hash);

    if(!mockBlobsDb.has(hash)) {
	throw new Error(`Blob not found`);
    }

    if(!fs.existsSync(filePath)) {
	throw new Error(`Blob missing from storage`);
    }

    console.log(`[Storage] streaming file: ${hash}`);

    return fs.createReadStream(filePath);
}

async function restoreVersion(fileId, versionNumber) {
    // Look up the specific hash for this version in 'file_versions'
    // Update the main 'files' table to point to this older hash
    const targetVersion = mockVersionsDb.find(
        v => v.file_id === fileId && v.version_number === versionNumber
    );

    if (!targetVersion) {
        throw new Error(`Version ${versionNumber} for file ${fileId} not found.`);
    }

    const restoredHash = targetVersion.hash;

    // 2. Figure out the next available version number
    const existingVersions = mockVersionsDb.filter(v => v.file_id === fileId);
    const nextVersionNumber = existingVersions.length + 1;

    // 3. Create a new version record pointing to that old hash
    const newVersion = {
        id: mockVersionsDb.length + 1, // Auto-increment mock
        file_id: fileId,
        hash: restoredHash,
        version_number: nextVersionNumber,
        created_at: new Date().toISOString()
    };

    mockVersionsDb.push(newVersion);

    console.log(`[Storage] File ${fileId} restored to version ${versionNumber}. Logged as new version ${nextVersionNumber}.`);

    // 4. Return the new version data to Person A's route
    return newVersion;
}

function generateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}


module.exports = { handleFileUpload, getFileBuffer, restoreVersion };
