import { useState, useEffect } from "react"
import type { AuthUser, UserTipo, NivelAcesso, ComissaoInfo } from "@/types/user"
import { supabase } from "@/lib/supabase"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        void loadSession(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          void loadSession(session.user.id)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setIsLoading(false)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadSession(userId: string) {
    const [usuarioResult, admResult, membrosResult] = await Promise.all([
      supabase
        .from("usuarios")
        .select("email, nome, tipo, nivel_acesso, ativo")
        .eq("id", userId)
        .single(),
      supabase
        .from("adm_sistema")
        .select("usuario_id")
        .eq("usuario_id", userId)
        .maybeSingle(),
      supabase
        .from("comissao_membros")
        .select(`
          comissao_id,
          comissoes (
            id, nome, diretor_id,
            cursos ( id, nome )
          )
        `)
        .eq("usuario_id", userId),
    ])

    const usuario = usuarioResult.data
    if (!usuario || !usuario.ativo) {
      await supabase.auth.signOut()
      return
    }

    type ComissaoRow = {
      id: string
      nome: string
      diretor_id: string
      cursos: { id: string; nome: string }
    }

    const comissoes: ComissaoInfo[] = (membrosResult.data ?? []).flatMap((m) => {
      const c = m.comissoes as ComissaoRow | null
      if (!c) return []
      return [{
        id: c.id,
        nome: c.nome,
        cursoId: c.cursos.id,
        cursoNome: c.cursos.nome,
        isDiretor: c.diretor_id === userId,
      }]
    })

    setUser({
      id: userId,
      email: usuario.email as string,
      nome: usuario.nome as string,
      tipo: usuario.tipo as UserTipo,
      nivelAcesso: usuario.nivel_acesso as NivelAcesso,
      isAdm: admResult.data !== null,
      comissoes,
    })
    setIsLoading(false)
  }

  function logout() {
    void supabase.auth.signOut()
  }

  return { user, isAuthenticated: user !== null, isLoading, logout }
}
