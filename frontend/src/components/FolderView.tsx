import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import FileRow from './FileRow'
import UploadButton from './UploadButton'
import ShareDialog from './ShareDialog'
import type { FolderContentsResponse } from '../../../type'

export default function FolderView() {
  const [folderId, setFolderId] = useState<number | null>(null)
  const [data, setData] = useState<FolderContentsResponse | null>(null)
  const [shareFile, setShareFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      const res = await apiClient.getFolderContents(folderId)
      setData(res)
    } catch (err) {
      console.error(err)
      setError('Failed to load folder contents.')
      // Ensure data isn't left as null if an empty database triggers a backend error
      setData({ current_folder: null, breadcrumbs: [], subfolders: [], files: [] }) 
    }
  }
  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      // Update this URL if your backend download route is different
      const response = await fetch(`/api/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) throw new Error('Download failed');

      // Convert the response to a binary blob
      const blob = await response.blob();
      
      // Create an invisible link to trigger the browser's download manager
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download file');
    }
  };

  useEffect(() => { load() }, [folderId])

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      
      {/* Header / Breadcrumbs */}
      <div className="flex items-center gap-1 px-4 py-3 border-b text-sm text-gray-500">
        <span
          className="cursor-pointer hover:text-blue-600"
          onClick={() => setFolderId(null)}
        >
          Home
        </span>
        {data?.breadcrumbs.map(b => (
          <span key={b.id} className="flex items-center gap-1">
            <span>/</span>
            <span
              className="cursor-pointer hover:text-blue-600"
              onClick={() => setFolderId(b.id)}
            >
              {b.name}
            </span>
          </span>
        ))}
      </div>

      {/* Conditional Rendering for Contents */}
      {!data ? (
        <p className="p-4 text-center text-gray-400">Loading contents...</p>
      ) : error ? (
        <p className="p-4 text-center text-red-500">{error}</p>
      ) : (
        <>
          {/* Subfolders */}
          {data.subfolders.map(f => (
            <div
              key={f.id}
              onClick={() => setFolderId(f.id)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b cursor-pointer"
            >
              <span className="text-2xl">📁</span>
              <span className="font-medium text-gray-800">{f.name}</span>
            </div>
          ))}

          {/* Files */}
          {data.files.map(f => (
            <FileRow
              key={f.id}
              name={f.name}
              size={f.size}
              onDownload={() => handleDownload(f.id,f.name)}
              onShare={() => setShareFile(f.name)}
            />
          ))}

          {/* Empty State */}
          {data.subfolders.length === 0 && data.files.length === 0 && (
            <p className="text-center text-gray-400 py-10">This folder is empty</p>
          )}
        </>
      )}

      {/* Upload button - NOW ALWAYS RENDERS */}
      <div className="px-4 py-3 border-t">
        <UploadButton folderId={folderId} onUploaded={load} />
      </div>

      {/* Share dialog */}
      {shareFile && (
        <ShareDialog fileName={shareFile} onClose={() => setShareFile(null)} />
      )}
    </div>
  )
}