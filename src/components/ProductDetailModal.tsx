import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import { formatBrl } from '../lib/format'
import { fetchItem } from '../lib/items-api'
import { mercadoLivreItemUrl } from '../lib/mercadolivre'
import type { Item } from '../types/item'
import { Modal } from './Modal'

type ProductDetailModalProps = {
  open: boolean
  itemId: string | null
  onClose: () => void
  onEdit: (item: Item) => void
  onDeactivate: (item: Item) => void
  onReactivate: (item: Item) => void
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function ProductDetailModal({
  open,
  itemId,
  onClose,
  onEdit,
  onDeactivate,
  onReactivate,
}: ProductDetailModalProps) {
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !itemId) {
      setItem(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchItem(itemId)
      .then((data) => {
        if (!cancelled) setItem(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Não foi possível carregar o produto.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, itemId])

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={item?.title ?? 'Detalhes do produto'}
    >
      {loading && (
        <p className="text-sm text-slate-500">Carregando detalhes…</p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {item && !loading && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt=""
                className="h-32 w-32 shrink-0 rounded-xl border border-slate-100 object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
                Sem imagem
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  item.active
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {item.active ? item.status : 'inativo'}
              </span>
              <p className="text-2xl font-bold text-blue-950">{formatBrl(item.price)}</p>
              <p className="text-sm text-slate-600">
                Estoque: <strong>{item.availableQty}</strong> un.
              </p>
            </div>
          </div>

          <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">ID Mercado Livre</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{item.mlItemId}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Categoria</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {item.categoryId ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Criado em</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {formatDate(item.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Atualizado em</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {formatDate(item.updatedAt)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <a
              href={mercadoLivreItemUrl(item.mlItemId)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ver no Mercado Livre
            </a>
            {item.active ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onEdit(item)
                  }}
                  className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void onDeactivate(item)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Inativar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void onReactivate(item)}
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Reativar
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

