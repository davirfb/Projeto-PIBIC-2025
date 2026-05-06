import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import type { Questionario } from "@/types/questionario"
import type { Resposta } from "@/types/resposta"

interface QuestionarioContextValue {
  questionarios: Questionario[]
  respostas: Resposta[]
  upsert: (q: Questionario) => void
  encerrar: (id: string) => void
  arquivar: (id: string) => void
  excluir: (id: string) => void
  submeterResposta: (r: Resposta) => void
  getQuestionariosVigentes: () => Questionario[]
  jaRespondeu: (respondentId: string, questionarioId: string) => boolean
}

const QuestionarioContext = createContext<QuestionarioContextValue | null>(null)

export function QuestionarioProvider({ children }: { children: ReactNode }) {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [respostas, setRespostas] = useState<Resposta[]>([])

  function upsert(q: Questionario) {
    setQuestionarios((prev) => {
      const existe = prev.some((p) => p.id === q.id)
      return existe ? prev.map((p) => (p.id === q.id ? q : p)) : [...prev, q]
    })
  }

  function encerrar(id: string) {
    setQuestionarios((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: "encerrado", atualizadoEm: new Date().toISOString() } : q,
      ),
    )
  }

  function arquivar(id: string) {
    setQuestionarios((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: "arquivado", atualizadoEm: new Date().toISOString() } : q,
      ),
    )
  }

  function excluir(id: string) {
    setQuestionarios((prev) => prev.filter((q) => q.id !== id))
  }

  function jaRespondeu(respondentId: string, questionarioId: string): boolean {
    return respostas.some(
      (r) => r.respondentId === respondentId && r.questionarioId === questionarioId,
    )
  }

  function submeterResposta(r: Resposta) {
    if (r.respondentId !== null && jaRespondeu(r.respondentId, r.questionarioId)) return
    setRespostas((prev) => [...prev, r])
  }

  function getQuestionariosVigentes(): Questionario[] {
    const hoje = new Date().toISOString().slice(0, 10)
    return questionarios.filter(
      (q) =>
        q.status === "publicado" &&
        q.dataInicio <= hoje &&
        q.dataFim >= hoje,
    )
  }

  return (
    <QuestionarioContext.Provider
      value={{
        questionarios,
        respostas,
        upsert,
        encerrar,
        arquivar,
        excluir,
        submeterResposta,
        getQuestionariosVigentes,
        jaRespondeu,
      }}
    >
      {children}
    </QuestionarioContext.Provider>
  )
}

export function useQuestionario(): QuestionarioContextValue {
  const ctx = useContext(QuestionarioContext)
  if (!ctx) throw new Error("useQuestionario deve ser usado dentro de QuestionarioProvider")
  return ctx
}
