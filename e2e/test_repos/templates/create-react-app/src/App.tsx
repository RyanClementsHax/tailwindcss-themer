import { useState } from 'react'

function App() {
  const [theme, setTheme] = useState('')
  return (
    <div className={theme}>
      <header>
        <h1 className="text-primary-500 text-3xl font-bold underline">
          Mainitainers ❤️ integration tests
        </h1>
        <select
          className="border border-gray-800 text-gray-800"
          value={theme}
          onChange={({ target: { value } }) => setTheme(value)}
        >
          <option value="">default</option>
          <option>dark</option>
        </select>
      </header>
    </div>
  )
}

export default App
