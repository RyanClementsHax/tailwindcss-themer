import { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const preventPurgingOfThemesThatAreSetInTests = ['darkTheme']

function App() {
  const [theme, setTheme] = useState('')
  return (
    <div className={theme}>
      <div className="mx-auto w-[50ch] pt-16">
        <header>
          <h1 className="text-primary-500 text-3xl font-bold">
            Mainitainers ❤️ integration tests
          </h1>
          <div className="mt-8">
            <label
              htmlFor="theme"
              className="text-sm font-medium leading-6 text-gray-900"
            >
              Theme
            </label>
            <input
              type="text"
              id="theme"
              className="mt-2 block w-48 rounded-md rounded-md border-0 px-7 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              placeholder="theme"
              value={theme}
              onChange={e => setTheme(e.target.value)}
            />
          </div>
        </header>
      </div>
    </div>
  )
}

export default App
