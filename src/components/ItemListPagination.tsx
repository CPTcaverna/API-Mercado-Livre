type ItemListPaginationProps = {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function ItemListPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  disabled = false,
}: ItemListPaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="border-t border-slate-100 px-6 py-4">
      <p className="mb-3 text-center text-sm text-slate-600 sm:text-left">
        Exibindo {from}–{to} de {total} anúncio{total === 1 ? '' : 's'}
      </p>
      <div
        className="flex gap-1 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Páginas da lista"
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          const active = p === page
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onPageChange(p)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60'
              }`}
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}
