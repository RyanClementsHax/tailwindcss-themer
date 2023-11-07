import { useState } from 'react'

export interface ThemedItemProps {
  rootId: string
}

export function ThemedItem({ rootId }: ThemedItemProps) {
  const [className, setClassName] = useState('bg-primary')
  const inputId = `themed-item-classes-for-${rootId}`
  return (
    <div className="flex flex-col gap-5 rounded-md bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold">Themed item</span>
        <label htmlFor={inputId} className="text-sm font-medium">
          Classes
        </label>
        <input
          id={inputId}
          spellCheck="false"
          className="input small"
          value={className}
          onChange={e => setClassName(e.target.value)}
        />
      </div>
      {/* Allow text to be seen on backgrounds set by tests*/}
      <div className="text-white">
        <div className={className}>This should be themed</div>
      </div>
    </div>
  )
}
