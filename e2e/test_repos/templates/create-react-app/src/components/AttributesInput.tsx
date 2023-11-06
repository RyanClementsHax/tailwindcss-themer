export interface AttributesInputProps {
  nodeId: string
  attributesInput: string
  setAttributesInput: (input: string) => void
  parsedAttributes: Record<string, string>
}

export function AttributesInput({
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
          className="w-32 rounded-md border-0 px-4 py-3 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus-visible:outline-none"
          value={attributesInput}
          onChange={e => setAttributesInput(e.target.value)}
        />
        <pre className="w-full rounded-md bg-indigo-50 px-4 py-3">
          <code>{JSON.stringify(parsedAttributes, null, 2)}</code>
        </pre>
      </div>
    </div>
  )
}
