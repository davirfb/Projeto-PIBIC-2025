import { useState, useEffect } from "react"
import type { UserRole, UserSubType } from "@/types/user"
import { supabase } from "@/lib/supabase"
import { DEMO_MODE } from "@/demo/demoData"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  subType?: UserSubType
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(!DEMO_MODE)

  useEffect(() => {
    if (DEMO_MODE) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        void loadProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          void loadProfile(session.user.id)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setIsLoading(false)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("email, nome, role, sub_type, ativo")
      .eq("id", userId)
      .single()

    if (data && data.ativo) {
      setUser({
        id: userId,
        email: data.email as string,
        name: data.nome as string,
        role: data.role as UserRole,
        subType: (data.sub_type as UserSubType) ?? undefined,
      })
    } else {
      await supabase.auth.signOut()
    }
    setIsLoading(false)
  }

  function logout() {
    if (DEMO_MODE) return
    void supabase.auth.signOut()
  }

  return { user, isAuthenticated: user !== null, isLoading, logout }
}
