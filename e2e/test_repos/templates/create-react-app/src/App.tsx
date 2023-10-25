import { useMemo, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const preventPurgingOfThemesThatAreSetInTests = [
  'darkTheme',
  'dark-mode',
  '[data-theme="dark"]'
]

function App() {
  const [attributes, setAttributes] = useState('{}')
  const parsedAttributes = useMemo(
    () => JSON.parse(attributes) as Record<string, string>,
    [attributes]
  )
  return (
    <div {...parsedAttributes}>
      <header className="flex w-[75ch] flex-col px-5 pt-16">
        <h1 className="text-primary text-3xl font-bold">
          Mainitainers ❤️ integration tests
        </h1>
        <div className="mt-8 flex gap-2">
          <div className="flex w-full flex-col gap-1.5">
            <label htmlFor="theme" className="font-mediumtext-gray-900 text-sm">
              Attributes
            </label>
            <textarea
              id="theme"
              spellCheck="false"
              className="h-64 w-full rounded-md rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              placeholder="theme"
              value={attributes}
              onChange={e => setAttributes(e.target.value)}
            />
          </div>
          <div className="flex w-full flex-col gap-1.5">
            <p className="text-sm font-medium text-gray-900">
              Formatted attributes
            </p>
            <pre>
              <code>{JSON.stringify(parsedAttributes, null, 2)}</code>
            </pre>
          </div>
        </div>
      </header>
    </div>
  )
}

export default App
