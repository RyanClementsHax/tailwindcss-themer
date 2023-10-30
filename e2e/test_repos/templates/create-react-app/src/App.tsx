import { useMemo, useRef, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const preventPurgingOfClassesAndCSSRulesThatAreSetInTests = [
  'darkTheme',
  'dark-mode',
  '[data-theme="dark"]'
]

function App() {
  return (
    <div>
      <header className="mx-auto flex w-[75ch] flex-col px-5 pt-16">
        <h1 className="text-center text-3xl font-bold">
          Mainitainers ❤️ integration tests
        </h1>
        <main className="mt-8 flex flex-col">
          <ThemeNode />
        </main>
      </header>
    </div>
  )
}

function ThemeNode() {
  const [attributesInput, setAttributesInput] = useState('{}')
  const lastValidAttributesRef = useRef({})
  const parsedAttributes = useMemo(() => {
    // Allows for devs working on the template to manually type in json
    // without blowing up the app
    try {
      const parsedAttributes = JSON.parse(attributesInput) as Record<
        string,
        string
      >
      lastValidAttributesRef.current = parsedAttributes
      return lastValidAttributesRef.current
    } catch {
      return lastValidAttributesRef.current
    }
  }, [attributesInput])
  return (
    <section className="flex flex-col gap-5 rounded-md border border-gray-200 px-8 py-5 text-gray-900 shadow-md">
      {/* TODO: refactor this input into its own component*/}
      <div className="flex flex-col gap-2">
        <label htmlFor="theme" className="font-medium">
          Attributes
        </label>
        <div className="flex items-start gap-5">
          <input
            id="theme"
            spellCheck="false"
            className="w-32 rounded-md rounded-md border-0 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus-visible:outline-none"
            placeholder="theme"
            value={attributesInput}
            onChange={e => setAttributesInput(e.target.value)}
          />
          <pre className="w-full rounded-md bg-gray-100 px-3 py-2">
            <code>{JSON.stringify(parsedAttributes, null, 2)}</code>
          </pre>
        </div>
      </div>
      <hr />
      <ThemedContent attributes={parsedAttributes} />
    </section>
  )
}

interface ThemedContentProps {
  attributes: Record<string, string>
}

function ThemedContent({ attributes }: ThemedContentProps) {
  return (
    <div className="flex flex-col gap-2">
      Themed content
      <div className="rounded-md border border-gray-200 p-5">
        <div {...attributes}>
          <div className="bg-primary h-10 w-10 rounded-md"></div>
        </div>
      </div>
    </div>
  )
}

export default App
