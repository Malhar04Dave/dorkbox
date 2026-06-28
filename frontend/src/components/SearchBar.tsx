import { useState } from 'react'
import { mockApi } from '../api/mockApi'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length === 0) {
      setResults([])
      return
    }
    const res = await mockApi.search(val)
    setResults(res.results)
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search files and folders..."
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-10">
          {results.map((r, i) => (
            <div key={i} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <span className="mr-2">{r.type === 'file' ? '📄' : '📁'}</span>
              {r.name}
              <span className="text-gray-400 ml-2 text-xs">{r.path}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}