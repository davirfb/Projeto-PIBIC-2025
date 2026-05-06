import { useState } from "react"
import type { UserRole, UserSubType } from "@/types/user"

interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  subType?: UserSubType
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = (authUser: Omit<AuthUser, "id">) => {
    setUser({ ...authUser, id: authUser.email })
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
