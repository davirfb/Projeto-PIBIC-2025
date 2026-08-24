import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"
import type { DemoProfile } from "./demoData"

export interface ChecklistItem {
  id: string
  label: string
}

export const CHECKLIST_ITEMS: Record<DemoProfile, ChecklistItem[]> = {
  "estudante-comissao": [
    { id: "ver-questionarios", label: "Ver questionários disponíveis" },
    { id: "responder", label: "Responder avaliação atual" },
    { id: "ver-historico", label: "Consultar histórico de pesquisas" },
    { id: "abrir-comissao", label: "Acessar Painel da Comissão" },
    { id: "ver-relatorios", label: "Analisar relatórios de pesquisa" },
    { id: "ver-evolucao", label: "Ver evolução histórica do curso" },
  ],
  "professor-comissao": [
    { id: "ver-questionarios", label: "Ver questionários gerenciados" },
    { id: "ver-participacao", label: "Ver painel de participação" },
    { id: "ver-relatorios", label: "Consultar relatórios" },
    { id: "ver-evolucao", label: "Ver evolução histórica" },
    { id: "config-pesquisa", label: "Configurar eixos de avaliação" },
  ],
  aluno: [
    { id: "ver-questionarios", label: "Ver questionários disponíveis" },
    { id: "responder", label: "Responder avaliação" },
    { id: "ver-historico", label: "Consultar histórico de participação" },
  ],
}

interface ChecklistContextValue {
  completedItems: Set<string>
  markVisited: (...ids: string[]) => void
  profile: DemoProfile | null
}

const ChecklistContext = createContext<ChecklistContextValue | null>(null)

interface ChecklistProviderProps {
  children: ReactNode
  profile: DemoProfile | null
}

export function ChecklistProvider({ children, profile }: ChecklistProviderProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  const markVisited = useCallback((...ids: string[]) => {
    setCompletedItems((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }, [])

  return (
    <ChecklistContext.Provider value={{ completedItems, markVisited, profile }}>
      {children}
    </ChecklistContext.Provider>
  )
}

export function useChecklist(): ChecklistContextValue | null {
  return useContext(ChecklistContext)
}
