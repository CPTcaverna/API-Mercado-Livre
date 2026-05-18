import type { ReactNode } from 'react'

export function FieldLabel({
  children,
  hint,
}: {
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="mb-1">
      <p className="text-sm font-medium text-blue-950">{children}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
