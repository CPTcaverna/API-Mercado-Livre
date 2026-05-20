import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api'
import {
  isStrongPassword,
  STRONG_PASSWORD_ERROR,
  STRONG_PASSWORD_HINT,
} from '../lib/password'
import { useAuth } from '../context/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'
export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password || !confirmPassword ) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (!isStrongPassword(password)) {
      setError(STRONG_PASSWORD_ERROR)
      return
    }

    setSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/login?registered=1')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao cadastrar.')
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
            to="/login"
            className="text-sm font-medium text-blue-900 hover:text-blue-700"
          >
            Já tenho conta
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:flex-row lg:items-start lg:justify-between lg:py-16">
        <section className="max-w-xl space-y-6">
          <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
            Cadastro de vendedor
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-blue-950 lg:text-5xl">
            Crie sua conta de vendedor
          </h1>
          <p className="text-lg text-slate-600">
            Cadastro rápido com nome, e-mail e senha. Depois do login, conecte o
            Mercado Livre e publique seus produtos.
          </p>

        </section>

        <section className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/60">
          <h2 className="text-xl font-semibold text-blue-950">
            Registrar
          </h2>


          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-1">
              <p className="block text-sm font-medium text-blue-950">Name</p>
              <Input
                placeholder="Nome"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <p className="block text-sm font-medium text-blue-950">E-mail</p>

              <Input
                placeholder="exemplo@gmail.com"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <p className="block text-sm font-medium text-blue-950">Senha</p>

              <Input
                placeholder="******"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <p className="block text-sm font-medium text-blue-950">Confirme sua Senha</p>

              <Input
                placeholder="******"
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />

              <p className="mt-1 text-xs text-slate-500">{STRONG_PASSWORD_HINT}</p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}
            <Button type="submit" title={submitting ? 'Cadastrando…' : 'Criar conta'}></Button>

          </form>
        </section>
      </main>
    </div>
  )
}
