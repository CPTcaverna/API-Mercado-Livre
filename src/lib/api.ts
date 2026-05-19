export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

function messageFromBody(body: unknown): string {
  if (!body || typeof body !== 'object') return 'Não foi possível completar a operação.'
  const record = body as Record<string, unknown>
  const raw = record.message
  if (Array.isArray(raw)) return raw.map(String).join(' ')
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return 'Não foi possível completar a operação.'
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

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body != null) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  const body = await parseBody(res)

  if (!res.ok) {
    throw new ApiError(messageFromBody(body), res.status, body)
  }

  return body as T
}
