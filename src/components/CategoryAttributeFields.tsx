import type {
  CategoryAttribute,
  CategoryAttributeValue,
} from '../types/category-attribute'
import {
  getAttributeMaxLength,
  getAttributePlaceholder,
  getAttributeUnit,
  isAnatelAttribute,
  isAnatelDigitsComplete,
  parseNumberUnitValue,
  sanitizeAnatelDigits,
} from '../lib/category-attribute-value'
import { FieldLabel } from './FieldLabel'
import Input from './Input'

const FORM_CONTROL_CLASS =
  'mt-1 box-border h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/40'

type CategoryAttributeFieldsProps = {
  attributes: CategoryAttribute[]
  values: Record<string, CategoryAttributeValue>
  onChange: (id: string, value: CategoryAttributeValue) => void
  disabled?: boolean
}

export function CategoryAttributeFields({
  attributes,
  values,
  onChange,
  disabled,
}: CategoryAttributeFieldsProps) {
  if (attributes.length === 0) return null

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-800">
        Características obrigatórias da categoria
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {attributes.map((attr) => {
          const current = values[attr.id]
          const suggestions = attr.values ?? []
          const isBoolean = attr.value_type === 'boolean'
          const isClosedList = attr.value_type === 'list' || isBoolean
          const isNumberUnit = attr.value_type === 'number_unit'
          const isNumber = attr.value_type === 'number'
          const unit = getAttributeUnit(attr)
          const listId = `attr-${attr.id}`
          const placeholder = getAttributePlaceholder(attr)
          const maxLength = getAttributeMaxLength(attr)

          return (
            <div key={attr.id}>
              <FieldLabel>{attr.name}</FieldLabel>
              {isClosedList && suggestions.length > 0 ? (
                <select
                  value={current?.value_id ?? ''}
                  onChange={(e) => {
                    const option = suggestions.find((v) => v.id === e.target.value)
                    onChange(attr.id, {
                      value_id: e.target.value,
                      value_name: option?.name,
                    })
                  }}
                  required
                  disabled={disabled}
                  className={FORM_CONTROL_CLASS}
                >
                  <option value="">Selecione…</option>
                  {suggestions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              ) : isNumberUnit ? (
                <div className="mt-1 flex h-10 overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/40">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={parseNumberUnitValue(current?.value_name)}
                    onChange={(e) => {
                      const numeric = e.target.value
                      onChange(attr.id, {
                        value_name: numeric && unit ? `${numeric} ${unit}` : numeric,
                      })
                    }}
                    placeholder={placeholder}
                    required
                    disabled={disabled}
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 outline-none"
                  />
                  {unit ? (
                    <span className="flex shrink-0 items-center border-l border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-600">
                      {unit}
                    </span>
                  ) : null}
                </div>
              ) : isNumber && isAnatelAttribute(attr) ? (
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    pattern="[012][0-9]{11}"
                    maxLength={12}
                    value={current?.value_name ?? ''}
                    onChange={(e) => {
                      onChange(attr.id, {
                        value_name: sanitizeAnatelDigits(e.target.value),
                      })
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const text = e.clipboardData.getData('text')
                      onChange(attr.id, { value_name: sanitizeAnatelDigits(text) })
                    }}
                    placeholder={placeholder}
                    required
                    disabled={disabled}
                    aria-invalid={
                      (current?.value_name?.length ?? 0) > 0 &&
                      !isAnatelDigitsComplete(current?.value_name ?? '')
                    }
                    className={`${FORM_CONTROL_CLASS} font-mono tracking-widest ${
                      (current?.value_name?.length ?? 0) > 0 &&
                      !isAnatelDigitsComplete(current?.value_name ?? '')
                        ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/40'
                        : ''
                    }`}
                  />
                  <p className="mt-1 text-xs text-slate-600">
                    12 dígitos, começando com 0, 1 ou 2 — código da etiqueta/certificado Anatel
                    do aparelho.
                  </p>
                  <p
                    className={`mt-0.5 text-xs ${
                      isAnatelDigitsComplete(current?.value_name ?? '')
                        ? 'text-emerald-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {(current?.value_name?.length ?? 0)}/12 dígitos
                    {isAnatelDigitsComplete(current?.value_name ?? '')
                      ? ' — formato ok (o ML ainda valida se o produto está homologado)'
                      : ''}
                  </p>
                </div>
              ) : isNumber ? (
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={maxLength}
                  value={current?.value_name ?? ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, maxLength ?? 18)
                    onChange(attr.id, { value_name: digits })
                  }}
                  placeholder={placeholder}
                  required
                  disabled={disabled}
                  className={FORM_CONTROL_CLASS}
                />
              ) : (
                <>
                  <Input
                    type="text"
                    list={suggestions.length > 0 ? listId : undefined}
                    value={current?.value_name ?? ''}
                    onChange={(e) => {
                      const text = e.target.value
                      const match = suggestions.find(
                        (v) => v.name.toLowerCase() === text.trim().toLowerCase(),
                      )
                      onChange(
                        attr.id,
                        match
                          ? { value_id: match.id, value_name: match.name }
                          : { value_name: text },
                      )
                    }}
                    placeholder={placeholder}
                    required
                    disabled={disabled}
                  />
                  {suggestions.length > 0 && !isClosedList && (
                    <datalist id={listId}>
                      {suggestions.map((opt) => (
                        <option key={opt.id} value={opt.name} />
                      ))}
                    </datalist>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
