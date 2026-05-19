import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, apiJson } from '../lib/api'
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiJson<{ user: AuthUser }>('/auth/me')
      setUser({
        ...data.user,
        mlConnected: data.user.mlConnected ?? false,
      })
    } catch (e) {
      setUser(null)
      if (e instanceof ApiError && e.status === 401) return
      throw e
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refreshMe()
      } catch {
        // falha de rede ou servidor indisponível ao iniciar
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshMe])

  const login = useCallback(
    async (email: string, password: string) => {
      await apiJson<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      await refreshMe()
    },
    [refreshMe],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiJson('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })
    },
    [],
  )

  const logout = useCallback(async () => {
    await apiJson('/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, loading, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
