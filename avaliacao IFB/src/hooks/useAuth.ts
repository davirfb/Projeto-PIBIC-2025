import { useState } from "react"
import type { UserRole, UserSubType } from "@/types/user"

interface AuthUser {
  email: string
  name: string
  role: UserRole
  subType?: UserSubType
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = (authUser: AuthUser) => {
    setUser(authUser)
  }

  const logout = () => {
    setUser(null)
  }

  return {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
  }
}
