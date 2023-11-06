import { useMemo, useRef, useState } from 'react'
import { ThemedItemForm } from './ThemedItemForm'
import { AttributesInput } from './AttributesInput'

export interface ThemeNodeProps {
  nodeId: string
}

export function ThemeNode({ nodeId }: ThemeNodeProps) {
  const [parsedAttributes, attributesInput, setAttributesInput] =
    useParsedAttributes()
  const [numThemeNodes, setNumThemeNodes] = useState(0)
  return (
    <section
      data-testid={`theme-node-${nodeId}`}
      className="flex w-full flex-col gap-5 rounded-md bg-white px-8 py-5 shadow-md"
    >
      <h2 className="text-2xl font-bold">Theme node {nodeId}</h2>
      <AttributesInput
        nodeId={nodeId}
        attributesInput={attributesInput}
        setAttributesInput={setAttributesInput}
        parsedAttributes={parsedAttributes}
      />
      <hr />
      <ThemedContent
        attributes={parsedAttributes}
        nodeId={nodeId}
        numThemeNodes={numThemeNodes}
      />
      <ThemedItemForm
        nodeId={nodeId}
        onAddThemedItem={() => {
          setNumThemeNodes(num => num + 1)
        }}
      />
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
  nodeId: string
  numThemeNodes: number
  attributes: Record<string, string>
}

function ThemedContent({
  attributes,
  numThemeNodes,
  nodeId
}: ThemedContentProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      Themed content
      <div className="rounded-md bg-indigo-50 p-5">
        <div {...attributes}>
          <div className="flex flex-col gap-5">
            <div className="bg-primary h-10 w-10 rounded-md"></div>
            {Array.from({ length: numThemeNodes }, (_, i) => {
              const childNodeId = `${nodeId}.${i + 1}`
              return <ThemeNode key={childNodeId} nodeId={childNodeId} />
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
