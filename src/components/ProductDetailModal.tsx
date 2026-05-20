import { useEffect, useState, type ReactNode } from 'react'
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
  onDelete: (item: Item) => void
}

const LISTING_TYPE_LABELS: Record<string, string> = {
  gold_special: 'Clássico',
  gold_pro: 'Premium',
  silver: 'Prata',
  bronze: 'Bronze',
  free: 'Grátis',
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'Novo',
  used: 'Usado',
  not_specified: 'Não especificado',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function formatCondition(value?: string | null) {
  if (!value) return '—'
  return CONDITION_LABELS[value] ?? value
}

function formatListingType(value?: string | null) {
  if (!value) return '—'
  const label = LISTING_TYPE_LABELS[value]
  return label ? `${label} (${value})` : value
}

function formatAttributeValue(attr: {
  value_name?: string
  value_id?: string
}) {
  return attr.value_name?.trim() || attr.value_id?.trim() || '—'
}

function CollapsibleSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <details className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 select-none hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-800">{title}</span>
          {hint ? (
            <span className="mt-0.5 block text-xs font-normal text-slate-500">{hint}</span>
          ) : null}
        </span>
        <span
          className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          ▼
        </span>
      </summary>
      <div className="border-t border-slate-100 px-4 pb-4 pt-3">{children}</div>
    </details>
  )
}

export function ProductDetailModal({
  open,
  itemId,
  onClose,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
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

  const gallery =
    item?.pictures && item.pictures.length > 0
      ? item.pictures
      : item?.thumbnail
        ? [item.thumbnail]
        : []

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="shrink-0">
              {gallery.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gallery.map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-xl border border-slate-100"
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-28 w-28 object-cover sm:h-32 sm:w-32"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
                  Sem imagem
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
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
                {item.soldQuantity != null && (
                  <>
                    {' '}
                    · Vendidos: <strong>{item.soldQuantity}</strong>
                  </>
                )}
              </p>
              {item.permalink && (
                <a
                  href={item.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-blue-800 hover:underline"
                >
                  Abrir anúncio publicado
                </a>
              )}
            </div>
          </div>

          <CollapsibleSection
            title="Informações do anúncio"
            hint="Clique para ver condição, categoria, IDs e datas"
          >
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Condição</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatCondition(item.condition)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Tipo de anúncio</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatListingType(item.listingTypeId)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Categoria</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {item.categoryName ?? item.categoryId ?? '—'}
                  {item.categoryName && item.categoryId && (
                    <span className="block text-xs font-normal text-slate-500">
                      {item.categoryId}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Moeda</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {item.currencyId ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">ID Mercado Livre</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{item.mlItemId}</dd>
              </div>
              <div>
                <dt className="text-slate-500">ID no painel</dt>
                <dd className="mt-0.5 break-all font-medium text-slate-900">{item.id}</dd>
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
          </CollapsibleSection>

          {item.attributes && item.attributes.length > 0 && (
            <CollapsibleSection
              title="Características"
              hint={`Clique para ver ${item.attributes.length} característica${item.attributes.length === 1 ? '' : 's'}`}
            >
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {item.attributes.map((attr) => (
                  <div key={attr.id}>
                    <dt className="text-slate-500">{attr.name}</dt>
                    <dd className="mt-0.5 font-medium text-slate-900">
                      {formatAttributeValue(attr)}
                    </dd>
                  </div>
                ))}
              </dl>
            </CollapsibleSection>
          )}

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
              <>
                <button
                  type="button"
                  onClick={() => void onReactivate(item)}
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Reativar
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(item)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Excluir
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
