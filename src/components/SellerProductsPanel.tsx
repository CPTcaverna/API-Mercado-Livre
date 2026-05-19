import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import { formatBrl } from '../lib/format'
import Input from './Input'
import {
  deactivateItem,
  deleteInactiveItem,
  fetchItems,
  importItemsFromMercadoLivre,
  reactivateItem,
} from '../lib/items-api'
import type { Item } from '../types/item'
import { ItemFormModal } from './ItemFormModal'
import { ProductDetailModal } from './ProductDetailModal'

type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; item: Item }

export function SellerProductsPanel() {
  const [items, setItems] = useState<Item[]>([])
  const [includeInactive, setIncludeInactive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ type: 'closed' })
  const [viewItemId, setViewItemId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchItems(includeInactive, debouncedSearch)
      setItems(list)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Não foi possível carregar anúncios.',
      )
    } finally {
      setLoading(false)
    }
  }, [includeInactive, debouncedSearch])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDeactivate(item: Item) {
    if (!confirm(`Inativar "${item.title}" no Mercado Livre?`)) return
    setActionId(item.id)
    try {
      await deactivateItem(item.id)
      setViewItemId(null)
      await load()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Falha ao inativar.')
    } finally {
      setActionId(null)
    }
  }

  async function handleReactivate(item: Item) {
    setActionId(item.id)
    try {
      await reactivateItem(item.id)
      setViewItemId(null)
      await load()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Falha ao reativar.')
    } finally {
      setActionId(null)
    }
  }

  async function handleImportFromMl() {
    if (
      !confirm(
        'Importar todos os anúncios da sua conta Mercado Livre?\n\nAnúncios já no painel serão atualizados; novos serão adicionados (sem duplicar).',
      )
    ) {
      return
    }
    setImporting(true)
    setError(null)
    try {
      const result = await importItemsFromMercadoLivre()
      await load()
      alert(
        `Importação concluída.\n\nNovos: ${result.created}\nAtualizados: ${result.updated}\nFalhas: ${result.failed}\nTotal no ML: ${result.totalOnMercadoLivre}`,
      )
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : 'Falha ao importar anúncios.'
      setError(msg)
      alert(msg)
    } finally {
      setImporting(false)
    }
  }

  async function handleDelete(item: Item) {
    if (
      !confirm(
        `Excluir "${item.title}"?\n\nO anúncio será encerrado no Mercado Livre (se ainda não estiver) e removido do seu painel.`,
      )
    ) {
      return
    }
    setActionId(item.id)
    try {
      await deleteInactiveItem(item.id)
      setViewItemId(null)
      await load()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Falha ao excluir.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">Meus anúncios</h2>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie publicações no Mercado Livre como vendedor.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={importing}
            onClick={() => void handleImportFromMl()}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {importing ? 'Importando…' : 'Importar do ML'}
          </button>
          <button
            type="button"
            onClick={() => setModal({ type: 'create' })}
            className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/20 hover:bg-blue-800"
          >
            + Novo produto
          </button>
        </div>
      </div>

      <div className="space-y-3 border-b border-slate-50 px-6 py-3">
        <div className="max-w-md">
          <label htmlFor="item-search" className="sr-only">
            Buscar anúncios
          </label>
          <Input
            id="item-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou ID (MLB…)"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-slate-300"
            />
            Mostrar inativos
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm font-medium text-blue-900 hover:underline"
          >
            Atualizar lista
          </button>
        </div>
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="p-8 text-center text-sm text-slate-500">Carregando anúncios…</p>
      ) : items.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">
          {debouncedSearch
            ? `Nenhum anúncio encontrado para "${debouncedSearch}".`
            : 'Nenhum anúncio ainda. Clique em "Novo produto" para publicar.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Produto</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className={!item.active ? 'bg-slate-50/80' : undefined}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="h-12 w-12 rounded-lg border border-slate-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          ML
                        </div>
                      )}
                      <div>
                        <button
                          type="button"
                          onClick={() => setViewItemId(item.id)}
                          className="text-left font-medium text-blue-950 hover:text-blue-700 hover:underline"
                        >
                          {item.title}
                        </button>
                        <p className="text-xs text-slate-500">{item.mlItemId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{formatBrl(item.price)}</td>
                  <td className="px-4 py-4 text-slate-700">{item.availableQty}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.active
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.active ? item.status : 'inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {item.active ? (
                        <>
                          <button
                            type="button"
                            disabled={actionId === item.id}
                            onClick={() => setModal({ type: 'edit', item })}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            disabled={actionId === item.id}
                            onClick={() => void handleDeactivate(item)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Inativar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={actionId === item.id}
                            onClick={() => void handleReactivate(item)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                          >
                            Reativar
                          </button>
                          <button
                            type="button"
                            disabled={actionId === item.id}
                            onClick={() => void handleDelete(item)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ItemFormModal
        open={modal.type === 'create'}
        mode="create"
        onClose={() => setModal({ type: 'closed' })}
        onSuccess={() => void load()}
      />
      <ItemFormModal
        open={modal.type === 'edit'}
        mode="edit"
        item={modal.type === 'edit' ? modal.item : null}
        onClose={() => setModal({ type: 'closed' })}
        onSuccess={() => void load()}
      />

      <ProductDetailModal
        open={viewItemId !== null}
        itemId={viewItemId}
        onClose={() => setViewItemId(null)}
        onEdit={(item) => {
          setViewItemId(null)
          setModal({ type: 'edit', item })
        }}
        onDeactivate={(item) => void handleDeactivate(item)}
        onReactivate={(item) => void handleReactivate(item)}
        onDelete={(item) => void handleDelete(item)}
      />
    </section>
  )
}

