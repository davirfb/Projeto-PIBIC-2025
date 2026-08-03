import { useState, useEffect } from "react"
import type { UserRole, UserSubType } from "@/types/user"
import { api, setToken } from "@/services/api"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  subType?: UserSubType
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("token")
    if (!stored) {
      setIsLoading(false)
      return
    }
    setToken(stored)
    api
      .get("/auth/me")
      .then((data) => {
        setUser({
          id: data.id,
          email: data.email,
          name: data.nome,
          role: data.role,
          subType: data.sub_type ?? undefined,
        })
      })
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false))
  }, [])

  function login(token: string, authUser: AuthUser) {
    setToken(token)
    setUser(authUser)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return { user, isAuthenticated: user !== null, isLoading, login, logout }
}
