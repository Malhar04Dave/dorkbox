import { useEffect, useState } from 'react'
import { mockApi } from '../api/mockApi'
import FileRow from './FileRow'
import UploadButton from './UploadButton'
import ShareDialog from './ShareDialog'
import type { FolderContentsResponse } from '../../../type'

export default function FolderView() {
  const [folderId, setFolderId] = useState<number | null>(null)
  const [data, setData] = useState<FolderContentsResponse | null>(null)
  const [shareFile, setShareFile] = useState<string | null>(null)

  const load = async () => {
    const res = await mockApi.getFolderContents(folderId)
    setData(res)
  }

  useEffect(() => { load() }, [folderId])

  if (!data) return <p className="p-4 text-gray-400">Loading...</p>

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 px-4 py-3 border-b text-sm text-gray-500">
        <span
          className="cursor-pointer hover:text-blue-600"
          onClick={() => setFolderId(null)}
        >
          Home
        </span>
        {data.breadcrumbs.map(b => (
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
          onDownload={() => alert(`Downloading ${f.name}`)}
          onShare={() => setShareFile(f.name)}
        />
      ))}

      {data.subfolders.length === 0 && data.files.length === 0 && (
        <p className="text-center text-gray-400 py-10">This folder is empty</p>
      )}

      {/* Upload button */}
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