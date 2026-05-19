import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../lib/api'
import { createItem, updateItem } from '../lib/items-api'
import type { Item } from '../types/item'
import Button from './Button'
import { FieldLabel } from './FieldLabel'
import Input from './Input'
import { Modal } from './Modal'

type ItemFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  item?: Item | null
  onClose: () => void
  onSuccess: () => void
}

const LISTING_TYPES = [
  { value: 'gold_special', label: 'Clássico — gold_special' },
  { value: 'gold_pro', label: 'Premium — gold_pro' },
  { value: 'silver', label: 'Prata — silver' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'free', label: 'Grátis' },
]

export function ItemFormModal({
  open,
  mode,
  item,
  onClose,
  onSuccess,
}: ItemFormModalProps) {
  const isEdit = mode === 'edit'

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [condition, setCondition] = useState<'new' | 'used' | 'not_specified'>('new')
  const [listingTypeId, setListingTypeId] = useState('silver')
  const [pictureUrl, setPictureUrl] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (isEdit && item) {
      setTitle(item.title)
      setPrice(String(item.price))
      setQuantity(String(item.availableQty))
    } else if (!isEdit) {
      setTitle('')
      setCategoryId('')
      setPrice('')
      setQuantity('')
      setCondition('new')
      setListingTypeId('silver')
      setPictureUrl('')
      setBrand('')
      setModel('')
    }
  }, [open, isEdit, item])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const parsedPrice = Number(price.replace(',', '.'))
      const parsedQty = Number(quantity)

      if (isEdit && item) {
        await updateItem(item.id, {
          title: title.trim(),
          price: parsedPrice,
          available_quantity: parsedQty,
        })
      } else {
        await createItem({
          title: title.trim(),
          category_id: categoryId.trim(),
          price: parsedPrice,
          available_quantity: parsedQty,
          condition,
          listing_type_id: listingTypeId,
          pictures: [{ source: pictureUrl.trim() }],
          attributes: [
            { id: 'BRAND', value_name: brand.trim() },
            { id: 'MODEL', value_name: model.trim() },
          ],
        })
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Não foi possível salvar.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide={!isEdit}
      title={isEdit ? 'Editar anúncio' : 'Novo anúncio no Mercado Livre'}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <FieldLabel>Título</FieldLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Produto Exemplo"
            required
            minLength={3}
          />
        </div>

        {!isEdit && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel hint="Ex.: MLB3530">Categoria (ID ML)</FieldLabel>
                <Input
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  placeholder="MLB3530"
                  required
                />
              </div>
              <div>
                <FieldLabel>Tipo de anúncio</FieldLabel>
                <select
                  value={listingTypeId}
                  onChange={(e) => setListingTypeId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/40"
                >
                  {LISTING_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel>Preço (R$)</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="99.90"
                  required
                />
              </div>
              <div>
                <FieldLabel>Estoque</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  required
                />
              </div>
              <div>
                <FieldLabel>Condição</FieldLabel>
                <select
                  value={condition}
                  onChange={(e) =>
                    setCondition(e.target.value as 'new' | 'used' | 'not_specified')
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="new">Novo</option>
                  <option value="used">Usado</option>
                  <option value="not_specified">Não especificado</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Marca (BRAND)</FieldLabel>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Genérica"
                  required
                />
              </div>
              <div>
                <FieldLabel>Modelo (MODEL)</FieldLabel>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Padrão"
                  required
                />
              </div>
            </div>

            <div>
              <FieldLabel hint="URL pública da imagem">Foto (URL)</FieldLabel>
              <Input
                type="url"
                value={pictureUrl}
                onChange={(e) => setPictureUrl(e.target.value)}
                placeholder="https://http2.mlstatic.com/..."
                required
              />
            </div>
          </>
        )}

        {isEdit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Preço (R$)</FieldLabel>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <FieldLabel>Estoque</FieldLabel>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <div className="flex-1">
            <Button
              type="submit"
              title={submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Publicar'}
              disabled={submitting}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}



