import type {
  CategoryAttribute,
  CategoryAttributeValue,
} from '../types/category-attribute'

export function getAttributeUnit(attr: CategoryAttribute): string {
  return attr.default_unit ?? attr.allowed_units?.[0]?.id ?? ''
}

export function isAnatelAttribute(attr: CategoryAttribute): boolean {
  return attr.id.includes('ANATEL')
}

const ANATEL_LENGTH = 12

export function sanitizeAnatelDigits(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (!digits) return ''

  let result = ''
  for (const ch of digits) {
    if (result.length === 0) {
      if (ch === '0' || ch === '1' || ch === '2') result += ch
    } else if (result.length < ANATEL_LENGTH) {
      result += ch
    }
  }
  return result
}

export function isAnatelDigitsComplete(digits: string): boolean {
  return /^[012]\d{11}$/.test(digits)
}

export function getAttributePlaceholder(attr: CategoryAttribute): string {
  if (attr.example?.trim()) return attr.example.trim()
  if (attr.value_type === 'number_unit') {
    const unit = getAttributeUnit(attr)
    return unit ? `Ex.: 8 ${unit}` : 'Ex.: 8'
  }
  if (attr.value_type === 'number' && isAnatelAttribute(attr)) {
    return '012345678901'
  }
  if (attr.value_type === 'number') return 'Somente números'
  return attr.name
}

export function getAttributeMaxLength(attr: CategoryAttribute): number | undefined {
  if (isAnatelAttribute(attr)) return 12
  if (attr.value_max_length) return attr.value_max_length
  return undefined
}

export function parseNumberUnitValue(valueName?: string): string {
  if (!valueName?.trim()) return ''
  const match = valueName.trim().match(/^([\d.,]+)/)
  return match ? match[1].replace(',', '.') : valueName.trim()
}

export function formatAttributeValueForMl(
  attr: CategoryAttribute,
  value: CategoryAttributeValue,
): CategoryAttributeValue | null {
  if (attr.value_type === 'boolean') {
    if (value.value_id) {
      return {
        value_id: value.value_id,
        ...(value.value_name ? { value_name: value.value_name } : {}),
      }
    }
    const match = attr.values?.find(
      (v) => v.name.toLowerCase() === value.value_name?.trim().toLowerCase(),
    )
    if (match) {
      return { value_id: match.id, value_name: match.name }
    }
    return null
  }

  if (attr.value_type === 'number') {
    const digits = isAnatelAttribute(attr)
      ? sanitizeAnatelDigits(value.value_name ?? '')
      : (value.value_name ?? '').replace(/\D/g, '')
    if (!digits) return null
    if (isAnatelAttribute(attr) && !isAnatelDigitsComplete(digits)) {
      return null
    }
    return { value_name: digits }
  }

  const name = value.value_name?.trim()
  if (!value.value_id && !name) return null

  if (attr.value_type === 'number_unit' && name) {
    const unit = getAttributeUnit(attr)
    const numeric = parseNumberUnitValue(name)
    if (!numeric) return null
    const formatted = unit ? `${numeric} ${unit}` : numeric
    return { value_name: formatted }
  }

  if (value.value_id) {
    return {
      value_id: value.value_id,
      ...(name ? { value_name: name } : {}),
    }
  }

  return { value_name: name }
}

export function getAttributeValidationMessage(
  attr: CategoryAttribute,
  value: CategoryAttributeValue | undefined,
): string | null {
  if (isAttributeValueFilled(attr, value)) return null
  if (attr.value_type === 'number' && isAnatelAttribute(attr)) {
    const digits = sanitizeAnatelDigits(value?.value_name ?? '')
    if (!digits) {
      return `${attr.name}: informe o código de 12 dígitos (inicia com 0, 1 ou 2).`
    }
    if (!isAnatelDigitsComplete(digits)) {
      return `${attr.name}: complete os 12 dígitos do código homologado na Anatel.`
    }
    return `${attr.name}: o Mercado Livre só aceita códigos de produtos homologados na Anatel. Confira o número na etiqueta do aparelho.`
  }
  if (attr.value_type === 'number_unit') {
    const unit = getAttributeUnit(attr)
    return `${attr.name}: informe o valor${unit ? ` em ${unit}` : ''}.`
  }
  if (attr.value_type === 'boolean') {
    return `${attr.name}: selecione Sim ou Não.`
  }
  return `${attr.name} é obrigatório.`
}

export function isAttributeValueFilled(
  attr: CategoryAttribute,
  value: CategoryAttributeValue | undefined,
): boolean {
  return formatAttributeValueForMl(attr, value ?? {}) !== null
}
