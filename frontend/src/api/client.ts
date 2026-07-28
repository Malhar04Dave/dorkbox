import type {
  AuthResponse, FolderContentsResponse,
  UploadResponse, SearchResponse, ShareResponse
} from '../../../type'  // adjust path

// Helper function to attach the JWT token to every request
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const apiClient = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  getFolderContents: async (folderId: number | null): Promise<FolderContentsResponse> => {
    // If folderId is null, fetch the root folder. Otherwise, fetch the specific folder.
    // Adjust this endpoint structure if your backend routes differ.
    const endpoint = folderId === null ? '/api/folders' : `/api/folders/${folderId}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch folder contents');
    }
    return data;
  },

  search: async (query: string): Promise<SearchResponse> => {
    // Passes the query parameter to your backend's search route
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Search failed');
    }
    return data;
  },

  upload: async (file: File, folderId: number | null): Promise<UploadResponse> => {
    // File uploads require FormData instead of a standard JSON body
    const formData = new FormData();
    formData.append('file', file);
    
    if (folderId !== null) {
      formData.append('folder_id', folderId.toString());
    }

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      // Note: Do NOT set 'Content-Type' manually here. 
      // The browser automatically sets it to 'multipart/form-data' with the correct boundary when using FormData.
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  }
}
