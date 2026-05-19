import { useEffect, useState } from 'react'
import type { ItemListFilters as Filters } from '../types/item-filters'
import {
  DEFAULT_ITEM_LIST_FILTERS,
  hasActiveModalFilters,
} from '../types/item-filters'
import Button from './Button'
import Input from './Input'
import { Modal } from './Modal'

const selectClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/40'

type ModalFilters = Pick<Filters, 'visibility' | 'status' | 'stock' | 'sort'>

type ItemListFiltersBarProps = {
  search: string
  onSearchChange: (q: string) => void
  appliedFilters: Filters
  onApplyFilters: (modalFilters: ModalFilters) => void
  resultCount: number
  loading?: boolean
}

function modalFiltersFrom(filters: Filters): ModalFilters {
  return {
    visibility: filters.visibility,
    status: filters.status,
    stock: filters.stock,
    sort: filters.sort,
  }
}

type ItemFiltersModalProps = {
  open: boolean
  initial: ModalFilters
  onClose: () => void
  onApply: (filters: ModalFilters) => void
}

function ItemFiltersModal({ open, initial, onClose, onApply }: ItemFiltersModalProps) {
  const [draft, setDraft] = useState<ModalFilters>(initial)

  useEffect(() => {
    if (open) setDraft(initial)
  }, [open, initial])

  function patch(partial: Partial<ModalFilters>) {
    setDraft((prev) => ({ ...prev, ...partial }))
  }

  function handleApply() {
    onApply(draft)
    onClose()
  }

  function handleClear() {
    const cleared = modalFiltersFrom(DEFAULT_ITEM_LIST_FILTERS)
    setDraft(cleared)
    onApply(cleared)
    onClose()
  }

  return (
    <Modal open={open} title="Filtrar anúncios" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="filter-visibility" className="text-sm font-medium text-blue-950">
            No painel
          </label>
          <select
            id="filter-visibility"
            value={draft.visibility}
            onChange={(e) =>
              patch({ visibility: e.target.value as Filters['visibility'] })
            }
            className={selectClass}
          >
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="all">Todos</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-status" className="text-sm font-medium text-blue-950">
            Status no ML
          </label>
          <select
            id="filter-status"
            value={draft.status}
            onChange={(e) => patch({ status: e.target.value as Filters['status'] })}
            className={selectClass}
          >
            <option value="all">Todos</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="closed">Encerrado</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-stock" className="text-sm font-medium text-blue-950">
            Estoque
          </label>
          <select
            id="filter-stock"
            value={draft.stock}
            onChange={(e) => patch({ stock: e.target.value as Filters['stock'] })}
            className={selectClass}
          >
            <option value="all">Todos</option>
            <option value="in">Com estoque</option>
            <option value="out">Sem estoque</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-sort" className="text-sm font-medium text-blue-950">
            Ordenar por
          </label>
          <select
            id="filter-sort"
            value={draft.sort}
            onChange={(e) => patch({ sort: e.target.value as Filters['sort'] })}
            className={selectClass}
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="price_asc">Preço: menor → maior</option>
            <option value="price_desc">Preço: maior → menor</option>
            <option value="title_asc">Título A → Z</option>
            <option value="title_desc">Título Z → A</option>
          </select>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-slate-600 hover:text-blue-900 hover:underline"
          >
            Limpar filtros
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <Button type="button" title="Aplicar" onClick={handleApply} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function ItemListFiltersBar({
  search,
  onSearchChange,
  appliedFilters,
  onApplyFilters,
  resultCount,
  loading = false,
}: ItemListFiltersBarProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const filtersActive = hasActiveModalFilters(appliedFilters)

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-slate-50 px-6 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-xl">
          <label htmlFor="item-search" className="text-sm font-medium text-blue-950">
            Buscar
          </label>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <Input
                id="item-search"
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Título ou ID (MLB…)"
              />
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={`relative shrink-0 self-end rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                filtersActive
                  ? 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Filtros
              {filtersActive && (
                <span
                  className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-600"
                  aria-hidden
                />
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          {loading ? 'Carregando…' : `${resultCount} anúncio${resultCount === 1 ? '' : 's'}`}
        </p>
      </div>

      <ItemFiltersModal
        open={modalOpen}
        initial={modalFiltersFrom(appliedFilters)}
        onClose={() => setModalOpen(false)}
        onApply={onApplyFilters}
      />
    </>
  )
}
