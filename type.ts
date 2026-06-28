export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  owner_id: number;
  created_at: string;
}

export interface BlobRecord {
  hash: string;
  storage_path: string;
  size: number;
  ref_count: number;
  created_at: string;
}

export interface FileRecord {
  id: number;
  name: string;
  folder_id: number | null;
  owner_id: number;
  current_hash: string;
  created_at: string;
  updated_at: string;
}

export interface FileVersion {
  id: number;
  file_id: number;
  hash: string;
  version_number: number;
  created_at: string;
}

export interface Share {
  id: string;
  file_id: number;
  owner_id: number;
  shared_with_id: number | null;
  permission: 'view' | 'edit';
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface FolderContentsResponse {
  current_folder: Folder | null;
  breadcrumbs: Folder[];
  subfolders: Folder[];
  files: Array<FileRecord & { size: number }>; 
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file: FileRecord;
  version: FileVersion;
}

export interface SearchResponse {
  results: Array<{
    id: number;
    type: 'file' | 'folder';
    name: string;
    path: string;
  }>;
}

export interface ShareResponse {
  share_url: string; 
  share_record: Share;
}