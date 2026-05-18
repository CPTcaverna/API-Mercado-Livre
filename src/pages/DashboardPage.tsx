import { useEffect, useState } from 'react'
import { ApiError, apiJson } from '../lib/api'
import { useAuth } from '../context/useAuth'

export function DashboardPage() {
  const { user, logout, refreshMe } = useAuth()
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  const mlConnected = user?.mlConnected ?? false

  useEffect(() => {
    const onFocus = () => {
      if (!mlConnected) void refreshMe()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [mlConnected, refreshMe])

  async function connectMercadoLivre() {
    setConnectError(null)
    setConnecting(true)
    try {
      const data = await apiJson<{ authorizationUrl: string }>(
        '/auth/ml/connect',
      )
      const opened = window.open(
        data.authorizationUrl,
        '_blank',
        'noopener,noreferrer',
      )
      if (!opened) {
        setConnectError(
          'O navegador bloqueou a nova aba. Permita pop-ups para este site e tente de novo.',
        )
      }
    } catch (err) {
      setConnectError(
        err instanceof ApiError ? err.message : 'Não foi possível iniciar o OAuth.',
      )
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold tracking-tight text-blue-950">
            ML Integração
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        {mlConnected ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-medium text-emerald-700">
              Conta Mercado Livre vinculada
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue-950">
              Bem-vindo, {user?.name ?? 'usuário'}!
            </h1>
            <p className="mt-3 max-w-xl text-slate-600">
              Sua conta já está conectada à API. Você pode usar as integrações
              disponíveis a partir daqui.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-violet-800">
              Olá, {user?.name ?? 'usuário'}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue-950">
              Painel
            </h1>
            <p className="mt-2 max-w-xl text-slate-600">
              Conecte sua conta do Mercado Livre para começar. A autorização
              abre em outra aba; ao concluir, feche-a e volte aqui — o painel
              atualiza automaticamente.
            </p>

            <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/60">
              <h2 className="text-lg font-semibold text-blue-950">
                Conectar Mercado Livre
              </h2>

              {connectError && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {connectError}
                </p>
              )}

              <button
                type="button"
                disabled={connecting}
                onClick={() => void connectMercadoLivre()}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffe600] px-6 py-3 text-sm font-bold text-blue-950 shadow-md transition hover:bg-[#ffef66] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="font-black tracking-tight">Mercado Livre</span>
                <span className="text-blue-950">
                  — {connecting ? 'Abrindo…' : 'Conectar conta'}
                </span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
