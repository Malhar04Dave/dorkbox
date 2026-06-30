# dorkbox

dorkbox is a full-stack, highly optimized cloud storage platform. It allows users to securely upload, manage, and search within a nested folder hierarchy. 

The system features a custom-built **Content-Addressable Storage (CAS)** engine for zero-cost file deduplication, a **Trie-backed** search service, **versioning** to maintain history of updates and a custom **LRU Cache** for rapid metadata retrieval.

## 🚀 Core Features
- **Authentication & Security:** Secure user registration and login using JWT.
- **Nested Folder System:** Complete folder hierarchy with recursive size calculations, moves, and deletions.
- **Smart Deduplication:** Content-Addressable Storage uses SHA-256 hashing to ensure duplicate files uploaded by any user only consume a single physical slot on disk.
- **File Versioning:** Uploading a file with the same name tracks a new version while preserving historical hashes, enabling one-click rollbacks.
- **Lightning Search:** Trie-based prefix tree allows for instant, search-as-you-type file discovery.
- **Access Control:** Share read-only access to specific files or folders with other registered users.


## 🛠️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Malhar04Dave/dorkbox.git](https://github.com/Malhar04Dave/dorkbox.git)
   cd dorkbox

2. Start the PostgreSQL Database:
   ```bash
   docker-compose up -d


3. Initialize the Database:
   Run the schema file against your local Postgres instance.
   ```bash
   psql -U postgres -d dropbox_clone -f schema.sql


4. Start the Backend:
   ```bash
   cd backend
   npm install
   npm run dev


5. Start the Frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
