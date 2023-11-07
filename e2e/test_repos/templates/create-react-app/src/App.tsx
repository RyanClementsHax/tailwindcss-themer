import { useState } from 'react'
import { ThemeRoot } from './components/ThemeRoot'

export default function App() {
  const [numThemeRoots, setNumThemeRoots] = useState(0)
  return (
    <div className="mx-auto flex flex-col px-5 py-16 font-mono text-slate-900">
      <header>
        <h1 className="mb-5 text-center text-4xl font-black">
          Mainitainers &lt;3 integration tests
        </h1>
      </header>
      <main className="mx-auto mt-8 flex w-[75ch] flex-col items-center gap-8">
        {Array.from({ length: numThemeRoots }, (_, i) => {
          const rootId = (i + 1).toString()
          return <ThemeRoot key={rootId} rootId={rootId} />
        })}
        <button
          className="button bg-white"
          onClick={() => setNumThemeRoots(num => num + 1)}
        >
          Add theme root
        </button>
      </main>
    </div>
  )
}
