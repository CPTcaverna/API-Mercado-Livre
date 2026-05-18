import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { useAuth } from '../context/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'

export function LoginPage() {
  const { login } = useAuth()
  const [params] = useSearchParams()
  const registered = params.get('registered') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold tracking-tight text-blue-950">
            ML Integração
          </span>
          <Link
            to="/cadastro"
            className="text-sm font-medium text-blue-900 hover:text-blue-700"
          >
            Criar conta
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:flex-row lg:items-start lg:justify-between lg:py-16">
        <section className="max-w-xl space-y-6">
          <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
            Painel do vendedor
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-blue-950 lg:text-5xl">
            Entre para gerenciar seus anúncios
          </h1>
          <p className="text-lg text-slate-600">
            Plataforma para vendedores integrados ao Mercado Livre. Publique e
            gerencie produtos.
          </p>
        </section>

        <section className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/60">
          <h2 className="text-xl font-semibold text-blue-950">
            Entrar na conta
          </h2>


          {registered && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Cadastro concluído. Faça login com sua nova senha.
            </p>
          )}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <p
                className="block text-sm font-medium text-blue-950">
                E-mail
              </p>

              <Input
                placeholder="exemplo@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            <div>
              <p
                className="block text-sm font-medium text-blue-950"
              >
                Senha
              </p>
              <Input
                placeholder="******"
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}
            <Button type="submit" title={submitting ? 'Entrando…' : 'Entrar'}></Button>
          </form>
        </section>
      </main>
    </div>
  )
}
