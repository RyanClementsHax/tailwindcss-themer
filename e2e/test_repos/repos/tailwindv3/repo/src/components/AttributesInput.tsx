export interface AttributesInputProps {
  rootId: string
  attributesInput: string
  setAttributesInput: (input: string) => void
  parsedAttributes: Record<string, string>
}

export function AttributesInput({
  rootId,
  attributesInput,
  setAttributesInput,
  parsedAttributes
}: AttributesInputProps) {
  const inputId = `attributes-for-root-${rootId}`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        Attributes
      </label>
      <div className="flex items-start gap-5">
        <input
          id={inputId}
          spellCheck="false"
          className="input w-32"
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
