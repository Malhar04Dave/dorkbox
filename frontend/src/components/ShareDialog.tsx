interface Props {
  fileName: string
  onClose: () => void
}

export default function ShareDialog({ fileName, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-1">Share "{fileName}"</h2>
        <p className="text-sm text-gray-500 mb-4">Choose permission level</p>

        <div className="flex flex-col gap-2 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="permission" value="view" defaultChecked />
            <span className="text-sm">View only</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="permission" value="edit" />
            <span className="text-sm">Can edit</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  )
}