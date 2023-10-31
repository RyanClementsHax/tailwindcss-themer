import { useMemo, useRef, useState } from 'react'

// TODO: see if this can be automated
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const preventPurgingOfClassesAndCSSRulesThatAreSetInTests = [
  'darkTheme',
  'dark-mode',
  '[data-theme="dark"]',
  'themeOne',
  'themeTwo'
]

function App() {
  const [numThemeNodes, setNumThemeNodes] = useState(0)
  return (
    <div className="mx-auto flex flex-col px-5 py-16 font-mono text-gray-900">
      <header>
        <h1 className="mb-5 text-center text-4xl font-black">
          Mainitainers ❤️ integration tests
        </h1>
      </header>
      <main className="mx-auto mt-8 flex w-[75ch] flex-col items-center gap-8">
        {Array.from({ length: numThemeNodes }, (_, i) => {
          const nodeId = i + 1
          return <ThemeNode key={nodeId} nodeId={nodeId} />
        })}
        <button
          className="rounded-md border-0 bg-white px-4 py-3 shadow-md ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus-visible:outline-none"
          onClick={() => setNumThemeNodes(num => num + 1)}
        >
          Add theme node
        </button>
      </main>
    </div>
  )
}

interface ThemeNodeProps {
  nodeId: number
}

function ThemeNode({ nodeId }: ThemeNodeProps) {
  const [parsedAttributes, attributesInput, setAttributesInput] =
    useParsedAttributes()
  return (
    <section
      data-testid={`theme-node-${nodeId}`}
      className="flex w-full flex-col gap-5 rounded-md border border-gray-200 bg-white px-8 py-5 shadow-md"
    >
      <h2 className="text-2xl font-bold">Theme node {nodeId}</h2>
      <AttributesInput
        nodeId={nodeId}
        attributesInput={attributesInput}
        setAttributesInput={setAttributesInput}
        parsedAttributes={parsedAttributes}
      />
      <hr />
      <ThemedContent attributes={parsedAttributes} />
    </section>
  )
}

const useParsedAttributes = (): [
  Record<string, string>,
  string,
  (input: string) => void
] => {
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
  return [parsedAttributes, attributesInput, setAttributesInput]
}

interface AttributesInputProps {
  nodeId: number
  attributesInput: string
  setAttributesInput: (input: string) => void
  parsedAttributes: Record<string, string>
}

function AttributesInput({
  nodeId,
  attributesInput,
  setAttributesInput,
  parsedAttributes
}: AttributesInputProps) {
  const inputId = `attributes-for-node-${nodeId}`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        Attributes
      </label>
      <div className="flex items-start gap-5">
        <input
          id={inputId}
          spellCheck="false"
          className="w-32 rounded-md border-0 px-4 py-3 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus-visible:outline-none"
          value={attributesInput}
          onChange={e => setAttributesInput(e.target.value)}
        />
        <pre className="w-full rounded-md bg-gray-100 px-4 py-3">
          <code>{JSON.stringify(parsedAttributes, null, 2)}</code>
        </pre>
      </div>
    </div>
  )
}

interface ThemedContentProps {
  attributes: Record<string, string>
}

function ThemedContent({ attributes }: ThemedContentProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
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
