import type {
  AuthResponse, FolderContentsResponse,
  UploadResponse, SearchResponse, ShareResponse
} from '../../../type'  // adjust path

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const mockApi = {
  login: async (email: string, _password: string): Promise<AuthResponse> => {
    await delay()
    return {
      token: 'mock-jwt-token',
      user: { id: 1, email, created_at: new Date().toISOString() }
    }
  },

  getFolderContents: async (folderId: number | null): Promise<FolderContentsResponse> => {
  await delay()

  if (folderId === null) {
    // Root
    return {
      current_folder: null,
      breadcrumbs: [],
      subfolders: [
        { id: 2, name: 'Photos', parent_id: null, owner_id: 1, created_at: '' },
        { id: 3, name: 'Work', parent_id: null, owner_id: 1, created_at: '' },
      ],
      files: [
        { id: 1, name: 'resume.pdf', folder_id: null, owner_id: 1, current_hash: 'abc123', created_at: '', updated_at: '', size: 204800 },
      ]
    }
  }

  if (folderId === 2) {
    // Photos folder
    return {
      current_folder: { id: 2, name: 'Photos', parent_id: null, owner_id: 1, created_at: '' },
      breadcrumbs: [{ id: 2, name: 'Photos', parent_id: null, owner_id: 1, created_at: '' }],
      subfolders: [],
      files: [
        { id: 10, name: 'vacation.jpg', folder_id: 2, owner_id: 1, current_hash: 'def456', created_at: '', updated_at: '', size: 3145728 },
      ]
    }
  }

  if (folderId === 3) {
    // Work folder
    return {
      current_folder: { id: 3, name: 'Work', parent_id: null, owner_id: 1, created_at: '' },
      breadcrumbs: [{ id: 3, name: 'Work', parent_id: null, owner_id: 1, created_at: '' }],
      subfolders: [
        { id: 4, name: 'Projects', parent_id: 3, owner_id: 1, created_at: '' },
      ],
      files: [
        { id: 11, name: 'report.docx', folder_id: 3, owner_id: 1, current_hash: 'ghi789', created_at: '', updated_at: '', size: 512000 },
      ]
    }
  }

  // Default for any other folder
  return {
    current_folder: { id: folderId, name: 'Folder', parent_id: null, owner_id: 1, created_at: '' },
    breadcrumbs: [],
    subfolders: [],
    files: []
  }
},

  search: async (query: string): Promise<SearchResponse> => {
    await delay(100)
    return {
      results: query ? [
        { id: 1, type: 'file', name: 'resume.pdf', path: '/resume.pdf' }
      ] : []
    }
  },

  upload: async (_file: File, _folderId: number | null): Promise<UploadResponse> => {
    await delay(800)
    return {
      success: true,
      message: 'Uploaded successfully',
      file: { id: 99, name: 'newfile.txt', folder_id: null, owner_id: 1, current_hash: 'xyz', created_at: '', updated_at: '' },
      version: { id: 1, file_id: 99, hash: 'xyz', version_number: 1, created_at: '' }
    }
  }
}