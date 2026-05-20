import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../lib/api'
import {
  createItem,
  fetchCategoryAttributes,
  predictCategoryFromTitle,
  resolveCategoryAttributes,
  updateItem,
} from '../lib/items-api'
import { uploadItemImage } from '../lib/media-api'
import {
  formatAttributeValueForMl,
  getAttributeValidationMessage,
  isAttributeValueFilled,
} from '../lib/category-attribute-value'
import type {
  CategoryAttribute,
  CategoryAttributeValue,
} from '../types/category-attribute'
import type { Item } from '../types/item'
import Button from './Button'
import { CategoryAttributeFields } from './CategoryAttributeFields'
import { ItemImageUpload } from './ItemImageUpload'
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

const FORM_CONTROL_CLASS =
  'mt-1 box-border h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/40'

const PRICE_GROUP_CLASS =
  'mt-1 box-border flex h-10 w-full overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/40'

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
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const [predictingCategory, setPredictingCategory] = useState(false)
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [condition, setCondition] = useState<'new' | 'used' | 'not_specified'>('new')
  const [listingTypeId, setListingTypeId] = useState('silver')
  const [pictureFile, setPictureFile] = useState<File | null>(null)
  const [requiredAttributes, setRequiredAttributes] = useState<CategoryAttribute[]>(
    [],
  )
  const [attributeValues, setAttributeValues] = useState<
    Record<string, CategoryAttributeValue>
  >({})
  const [loadingAttributes, setLoadingAttributes] = useState(false)
  const resolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current)
      setLoadingAttributes(false)
      setPredictingCategory(false)
      setSubmitting(false)
      return
    }

    setError(null)
    setLoadingAttributes(false)
    setPredictingCategory(false)
    setSubmitting(false)

    if (isEdit && item) {
      setTitle(item.title)
      setPrice(String(item.price))
      setQuantity(String(item.availableQty))
      setPictureFile(null)
    } else if (!isEdit) {
      setTitle('')
      setCategoryId('')
      setCategoryName(null)
      setPrice('')
      setQuantity('')
      setCondition('new')
      setListingTypeId('silver')
      setPictureFile(null)
      setRequiredAttributes([])
      setAttributeValues({})
    }
  }, [open, isEdit, item])

  useEffect(() => {
    if (!open || isEdit || !categoryId.trim()) {
      setRequiredAttributes([])
      setAttributeValues({})
      setLoadingAttributes(false)
      return
    }

    let cancelled = false
    setLoadingAttributes(true)
    setError(null)
    ;(async () => {
      try {
        const { required } = await fetchCategoryAttributes(categoryId.trim())
        if (cancelled) return
        setRequiredAttributes(required)
        setAttributeValues({})
      } catch (err) {
        if (cancelled) return
        setRequiredAttributes([])
        setAttributeValues({})
        setError(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar os atributos da categoria.',
        )
      } finally {
        if (!cancelled) setLoadingAttributes(false)
      }
    })()

    return () => {
      cancelled = true
      setLoadingAttributes(false)
    }
  }, [open, isEdit, categoryId])

  useEffect(() => {
    if (!open || isEdit || !categoryId.trim() || requiredAttributes.length === 0) {
      return
    }

    if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current)
    resolveTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const draft = buildAttributesPayload()
          const result = await resolveCategoryAttributes(categoryId.trim(), {
            title: title.trim(),
            condition,
            listing_type_id: listingTypeId,
            attributes: draft,
          })
          setRequiredAttributes((prev) => {
            const prevIds = prev
              .map((a) => a.id)
              .sort()
              .join(',')
            const nextIds = result.required
              .map((a) => a.id)
              .sort()
              .join(',')
            return prevIds === nextIds ? prev : result.required
          })
        } catch {
          // Mantém lista atual se a validação condicional falhar.
        }
      })()
    }, 500)

    return () => {
      if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current)
    }
  }, [open, isEdit, categoryId, title, condition, listingTypeId, attributeValues])

  function handleAttributeChange(id: string, value: CategoryAttributeValue) {
    setAttributeValues((prev) => {
      const next = { ...prev, [id]: value }
      if (id === 'PROCESSOR_BRAND') {
        delete next.PROCESSOR_LINE
        delete next.PROCESSOR_MODEL
      }
      if (id === 'BRAND') {
        delete next.MODEL
        delete next.RAM
        delete next.INTERNAL_MEMORY
      }
      if (id === 'MODEL') {
        delete next.RAM
        delete next.INTERNAL_MEMORY
      }
      return next
    })
  }

  function buildAttributesPayload() {
    return requiredAttributes
      .map((attr) => {
        const formatted = formatAttributeValueForMl(
          attr,
          attributeValues[attr.id] ?? {},
        )
        if (!formatted) return null
        return {
          id: attr.id,
          ...(formatted.value_id ? { value_id: formatted.value_id } : {}),
          ...(formatted.value_name ? { value_name: formatted.value_name } : {}),
        }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
  }

  async function handlePredictCategory() {
    const term = title.trim()
    if (term.length < 3) {
      setError('Digite um título com pelo menos 3 caracteres.')
      return
    }
    setPredictingCategory(true)
    setError(null)
    try {
      const result = await predictCategoryFromTitle(term)
      if (!result.predicted) {
        setCategoryId('')
        setCategoryName(null)
        setError('Nenhuma categoria encontrada para este título. Ajuste o texto e tente de novo.')
        return
      }
      setCategoryId(result.predicted.category_id)
      setCategoryName(result.predicted.category_name)
    } catch (err) {
      setCategoryId('')
      setCategoryName(null)
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível prever a categoria.',
      )
    } finally {
      setPredictingCategory(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const parsedPrice = Number(price.replace(',', '.'))
      const parsedQty = Number(quantity)

      if (isEdit && item) {
        const updatePayload: Parameters<typeof updateItem>[1] = {
          title: title.trim(),
          price: parsedPrice,
          available_quantity: parsedQty,
        }
        if (pictureFile) {
          const { url } = await uploadItemImage(pictureFile)
          updatePayload.pictures = [{ source: url }]
        }
        await updateItem(item.id, updatePayload)
      } else {
        if (!categoryId.trim()) {
          setError('Clique em "Prever categoria" após preencher o título.')
          setSubmitting(false)
          return
        }
        if (loadingAttributes) {
          setError('Aguarde o carregamento dos atributos da categoria.')
          setSubmitting(false)
          return
        }
        const missing = requiredAttributes.filter(
          (attr) => !isAttributeValueFilled(attr, attributeValues[attr.id]),
        )
        if (missing.length > 0) {
          const detail = getAttributeValidationMessage(
            missing[0],
            attributeValues[missing[0].id],
          )
          setError(
            detail ??
              `Preencha os campos obrigatórios: ${missing.map((a) => a.name).join(', ')}.`,
          )
          setSubmitting(false)
          return
        }
        if (!pictureFile) {
          setError('Selecione uma imagem do produto.')
          setSubmitting(false)
          return
        }
        const { url: imageUrl } = await uploadItemImage(pictureFile)
        await createItem({
          title: title.trim(),
          category_id: categoryId.trim(),
          price: parsedPrice,
          available_quantity: parsedQty,
          condition,
          listing_type_id: listingTypeId,
          pictures: [{ source: imageUrl }],
          attributes: buildAttributesPayload(),
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
      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <FieldLabel>Título do anúncio</FieldLabel>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (categoryId) {
                    setCategoryId('')
                    setCategoryName(null)
                    setRequiredAttributes([])
                    setAttributeValues({})
                  }
                }}
                onBlur={() => {
                  if (!isEdit && title.trim().length >= 3 && !categoryId) {
                    void handlePredictCategory()
                  }
                }}
                placeholder="Notebook Dell Inspiron 15"
                required
                minLength={3}
                disabled={submitting || predictingCategory}
              />
            </div>
            {!isEdit && (
              <button
                type="button"
                onClick={() => void handlePredictCategory()}
                disabled={submitting || predictingCategory || title.trim().length < 3}
                className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-60"
              >
                {predictingCategory ? 'Prevendo…' : 'Prever categoria'}
              </button>
            )}
          </div>
          {!isEdit && (
            <p className="mt-2 text-xs text-slate-500">
              A categoria é sugerida pelo Mercado Livre com base no título (API domain_discovery).
            </p>
          )}
          {!isEdit && categoryName && categoryId && (
            <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Categoria sugerida: <strong>{categoryName}</strong> ({categoryId})
            </p>
          )}
        </div>

        {!isEdit && (
          <>
            <div>
              <FieldLabel>Tipo de anúncio</FieldLabel>
              <select
                value={listingTypeId}
                onChange={(e) => setListingTypeId(e.target.value)}
                className={FORM_CONTROL_CLASS}
              >
                {LISTING_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel >
                  Preço
                </FieldLabel>
                <div className={PRICE_GROUP_CLASS}>
                  <span className="flex h-full shrink-0 items-center border-r border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-600">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99.90"
                    required
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 outline-none"
                  />
                </div>
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
                  className={FORM_CONTROL_CLASS}
                >
                  <option value="new">Novo</option>
                  <option value="used">Usado</option>
                  <option value="not_specified">Não especificado</option>
                </select>
              </div>
            </div>

            {loadingAttributes && categoryId && (
              <p className="text-sm text-slate-500">Carregando atributos da categoria…</p>
            )}
            {!loadingAttributes && requiredAttributes.length > 0 && (
              <CategoryAttributeFields
                attributes={requiredAttributes}
                values={attributeValues}
                onChange={handleAttributeChange}
                disabled={submitting}
              />
            )}

            <div>
              <FieldLabel>Foto do produto</FieldLabel>
              <ItemImageUpload
                file={pictureFile}
                onFileChange={setPictureFile}
                disabled={submitting}
                required
              />
            </div>
          </>
        )}

        {isEdit && item && (
          <>
            <div>
              <FieldLabel>Foto do produto</FieldLabel>
              <ItemImageUpload
                file={pictureFile}
                onFileChange={setPictureFile}
                currentImageUrl={item.thumbnail}
                disabled={submitting}
              />
            </div>
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
          </>
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
              disabled={submitting || loadingAttributes}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
