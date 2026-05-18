import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError, apiJson } from '../lib/api'

type Status = 'loading' | 'success' | 'error'

export function MercadoLivreCallbackPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const oauthError = searchParams.get('error')
    const oauthErrorDescription = searchParams.get('error_description')
    if (oauthError) {
      setStatus('error')
      setMessage(
        oauthErrorDescription?.trim() ||
          `Autorização cancelada ou recusada (${oauthError}).`,
      )
      return
    }

    const code = searchParams.get('code')?.trim()
    const state = searchParams.get('state')?.trim()

    if (!code || !state) {
      setStatus('error')
      setMessage(
        'Resposta incompleta do Mercado Livre. Volte ao painel e tente conectar de novo.',
      )
      return
    }

    ;(async () => {
      try {
        await apiJson<{ connected: boolean }>('/auth/ml/complete', {
          method: 'POST',
          body: JSON.stringify({ code, state }),
        })
        setStatus('success')
      } catch (err) {
        setStatus('error')
        setMessage(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível vincular a conta. Tente novamente pelo painel.',
        )
      }
    })()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-lg shadow-slate-200/60">
        {status === 'loading' && (
          <>
            <div
              className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900"
              aria-hidden
            />
            <h1 className="text-lg font-semibold text-blue-950">
              Vinculando conta…
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Aguarde enquanto salvamos a autorização na API.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700"
              aria-hidden
            >
              ✓
            </div>
            <h1 className="text-lg font-semibold text-blue-950">
              Conta vinculada
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sua conta Mercado Livre foi conectada com sucesso. Pode fechar
              esta guia e voltar ao painel.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-700"
              aria-hidden
            >
              !
            </div>
            <h1 className="text-lg font-semibold text-blue-950">
              Não foi possível vincular
            </h1>
            <p className="mt-2 text-sm text-red-800">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}
