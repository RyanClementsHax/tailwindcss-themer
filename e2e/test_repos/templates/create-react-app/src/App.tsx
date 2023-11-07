import { useState } from 'react'
import { ThemeNode } from './components/ThemeNode'

function App() {
  const [numThemeNodes, setNumThemeNodes] = useState(0)
  return (
    <div className="mx-auto flex flex-col px-5 py-16 font-mono text-slate-900">
      <header>
        <h1 className="mb-5 text-center text-4xl font-black">
          Mainitainers &lt;3 integration tests
        </h1>
      </header>
      <main className="mx-auto mt-8 flex w-[75ch] flex-col items-center gap-8">
        {Array.from({ length: numThemeNodes }, (_, i) => {
          const nodeId = (i + 1).toString()
          return <ThemeNode key={nodeId} nodeId={nodeId} />
        })}
        <button
          className="button bg-white"
          onClick={() => setNumThemeNodes(num => num + 1)}
        >
          Add theme node
        </button>
      </main>
    </div>
  )
}

export default App
