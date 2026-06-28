interface Props {
  name: string
  size: number
  onDownload: () => void
  onShare: () => void
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileRow({ name, size, onDownload, onShare }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📄</span>
        <div>
          <p className="font-medium text-gray-800">{name}</p>
          <p className="text-xs text-gray-400">{formatSize(size)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDownload}
          className="text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Download
        </button>
        <button
          onClick={onShare}
          className="text-sm px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
        >
          Share
        </button>
      </div>
    </div>
  )
}