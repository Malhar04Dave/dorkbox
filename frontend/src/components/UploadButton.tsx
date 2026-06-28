import { useRef, useState } from 'react'
import { mockApi } from '../api/mockApi'

interface Props {
  folderId: number | null
  onUploaded: () => void
}

export default function UploadButton({ folderId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await mockApi.upload(file, folderId)
      onUploaded()
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : '+ Upload'}
      </button>
    </>
  )
}