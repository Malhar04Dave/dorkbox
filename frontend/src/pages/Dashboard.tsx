import SearchBar from '../components/SearchBar'
import FolderView from '../components/FolderView'

interface Props {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: Props) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Dorkbox</h1>
        <SearchBar />
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <FolderView />
      </div>
    </div>
  )
}