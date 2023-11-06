import { useState } from 'react'
import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import c from 'classnames'

export interface ThemedItemFormProps {
  nodeId: string
  onAddThemedItem: () => void
}

export type NodeType = 'Node' | 'Item'

// Force exhaustion
const nodeTypes = Object.keys({
  Node: true,
  Item: true
} satisfies Record<NodeType, boolean>) as NodeType[]

export function ThemedItemForm({
  nodeId,
  onAddThemedItem
}: ThemedItemFormProps) {
  // TODO: refactor to one state
  const [className, setClassName] = useState('')
  const [nodeType, setNodeType] = useState<NodeType>('Node')
  return (
    <form
      className="flex items-end gap-5"
      onSubmit={e => {
        e.preventDefault()
        onAddThemedItem()
        setClassName('')
        setNodeType('Node')
      }}
    >
      <Listbox value={nodeType} onChange={setNodeType}>
        {({ open }) => (
          <div className="flex flex-col gap-2">
            <Listbox.Label className="text-sm font-medium">
              Node type
            </Listbox.Label>
            <div className="relative">
              <Listbox.Button className="relative w-24 rounded-md border-0 py-3 pl-4 pr-6 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus-visible:outline-none">
                <span className="flex items-center">
                  <span className="block truncate">{nodeType}</span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-slate-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              {open && (
                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {nodeTypes.map(type => (
                    <Listbox.Option
                      key={type}
                      className={({ active }) =>
                        c(
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-900',
                          'relative cursor-default select-none py-2 pl-3 pr-9'
                        )
                      }
                      value={type}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            <span
                              className={c(
                                selected ? 'font-semibold' : 'font-normal',
                                'ml-1'
                              )}
                            >
                              {type}
                            </span>
                          </div>
                          {selected && (
                            <span
                              className={c(
                                active ? 'text-white' : 'text-indigo-600',
                                'absolute inset-y-0 right-0 flex items-center pr-4'
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              )}
            </div>
          </div>
        )}
      </Listbox>
      {nodeType === 'Item' && (
        <div className="flex w-full flex-col gap-2">
          <label
            htmlFor="themed-item-classes-input"
            className="text-sm font-medium"
          >
            className
          </label>
          <input
            id="themed-item-classes-input"
            spellCheck="false"
            className="w-full rounded-md border-0 px-4 py-3 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus-visible:outline-none"
            value={className}
            onChange={e => setClassName(e.target.value)}
          />
        </div>
      )}
      <button
        type="submit"
        className="whitespace-nowrap rounded-md border-0 px-4 py-3 shadow-md ring-1 ring-inset ring-slate-300 hover:ring-2 hover:ring-inset hover:ring-indigo-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus-visible:outline-none active:bg-indigo-300"
      >
        Add to node {nodeId}
      </button>
    </form>
  )
}
