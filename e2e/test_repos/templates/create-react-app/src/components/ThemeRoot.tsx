import { useMemo, useRef, useState } from 'react'
import { AttributesInput } from './AttributesInput'
import { ThemedItem } from './ThemedItem'

export interface ThemeRootProps {
  rootId: string
}

export function ThemeRoot({ rootId }: ThemeRootProps) {
  const [parsedAttributes, attributesInput, setAttributesInput] =
    useParsedAttributes()
  const [numThemeRoots, setNumThemeRoots] = useState(0)
  return (
    <section
      data-testid={`theme-root-${rootId}`}
      className="flex w-full flex-col gap-5 rounded-md bg-white px-8 py-5 shadow-md"
    >
      <h2 className="text-2xl font-bold">Theme root {rootId}</h2>
      <AttributesInput
        rootId={rootId}
        attributesInput={attributesInput}
        setAttributesInput={setAttributesInput}
        parsedAttributes={parsedAttributes}
      />
      <hr />
      <ThemedContent
        attributes={parsedAttributes}
        rootId={rootId}
        numThemeRoots={numThemeRoots}
      />
      <button
        type="submit"
        className="button self-start whitespace-nowrap ring-1 ring-slate-300"
        onClick={() => setNumThemeRoots(num => num + 1)}
      >
        Add theme root to {rootId}
      </button>
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

interface ThemedContentProps {
  rootId: string
  numThemeRoots: number
  attributes: Record<string, string>
}

function ThemedContent({
  attributes,
  numThemeRoots,
  rootId
}: ThemedContentProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      Themed content
      <div className="rounded-md bg-indigo-50 p-5">
        <div {...attributes}>
          <div className="flex flex-col items-start gap-5">
            <ThemedItem rootId={rootId} />
            {Array.from({ length: numThemeRoots }, (_, i) => {
              const childRootId = `${rootId}.${i + 1}`
              return <ThemeRoot key={childRootId} rootId={childRootId} />
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
