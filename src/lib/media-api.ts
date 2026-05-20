import { apiBaseUrl, ApiError } from './api'

export type UploadImageResult = {
  url: string
  publicId: string
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

function messageFromBody(body: unknown): string {
  if (!body || typeof body !== 'object') return 'Não foi possível enviar a imagem.'
  const record = body as Record<string, unknown>
  const raw = record.message
  if (Array.isArray(raw)) return raw.map(String).join(' ')
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return 'Não foi possível enviar a imagem.'
}

export async function uploadItemImage(file: File): Promise<UploadImageResult> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${apiBaseUrl}/media/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })

  const body = await parseBody(res)
  if (!res.ok) {
    throw new ApiError(messageFromBody(body), res.status, body)
  }

  return body as UploadImageResult
}
