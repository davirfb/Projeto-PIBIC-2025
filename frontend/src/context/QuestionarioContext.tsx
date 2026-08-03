import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { Questionario, QuestaoTipo, LikertEscalaId, QuestionarioStatus } from "@/types/questionario"
import type { Resposta } from "@/types/resposta"
import type { UserRole } from "@/types/user"
import { api } from "@/services/api"

// ---- Data mappers ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromApiQ(raw: Record<string, any>): Questionario {
  return {
    id: raw.id,
    titulo: raw.titulo,
    descricao: raw.descricao ?? "",
    dataInicio: String(raw.data_inicio),
    dataFim: String(raw.data_fim),
    anonimo: raw.anonimo,
    status: raw.status as QuestionarioStatus,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questoes: (raw.questoes ?? []).map((q: Record<string, any>) => ({
      id: q.id,
      tipo: q.tipo as QuestaoTipo,
      enunciado: q.enunciado,
      obrigatoria: q.obrigatoria,
      likertEscala: (q.likert_escala ?? undefined) as LikertEscalaId | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opcoes: (q.opcoes ?? []).map((o: Record<string, any>) => ({ id: o.id, texto: o.texto })),
    })),
    cursos: raw.curso_ids ?? [],
    criadoEm: String(raw.criado_em),
    atualizadoEm: String(raw.atualizado_em),
  }
}

function toApiPayload(q: Questionario) {
  return {
    titulo: q.titulo,
    descricao: q.descricao,
    data_inicio: q.dataInicio,
    data_fim: q.dataFim,
    anonimo: q.anonimo,
    curso_ids: q.cursos,
    questoes: q.questoes.map((qu, i) => ({
      enunciado: qu.enunciado,
      tipo: qu.tipo,
      obrigatoria: qu.obrigatoria,
      likert_escala: qu.likertEscala ?? null,
      ordem: i,
      opcoes: (qu.opcoes ?? []).map((o, oi) => ({ texto: o.texto, ordem: oi })),
    })),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromApiResposta(raw: Record<string, any>): Resposta {
  return {
    id: raw.id,
    questionarioId: raw.questionario_id,
    respondentId: null, // nunca exposto pela API (RN04)
    respondentRole: raw.respondente_role as UserRole,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    respostas: (raw.respostas_questao ?? []).map((rq: Record<string, any>) => ({
      questaoId: rq.questao_id,
      opcaoId: rq.opcao_id ?? undefined,
      likertValor: rq.likert_valor ?? undefined,
      texto: rq.texto ?? undefined,
    })),
    submetidoEm: String(raw.submetido_em),
  }
}

// ---- Context ----

interface QuestionarioContextValue {
  questionarios: Questionario[]
  respostas: Resposta[]
  isLoading: boolean
  error: string | null
  upsert: (q: Questionario) => Promise<void>
  encerrar: (id: string) => Promise<void>
  arquivar: (id: string) => Promise<void>
  excluir: (id: string) => Promise<void>
  submeterResposta: (r: Resposta) => Promise<void>
  getQuestionariosVigentes: () => Questionario[]
  jaRespondeu: (respondentId: string, questionarioId: string) => boolean
}

const QuestionarioContext = createContext<QuestionarioContextValue | null>(null)

interface QuestionarioProviderProps {
  children: ReactNode
  userRole: UserRole
}

export function QuestionarioProvider({ children, userRole }: QuestionarioProviderProps) {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [respondidosIds, setRespondidosIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const rawQs = await api.get("/questionarios/")
        const qs: Questionario[] = rawQs.map(fromApiQ)
        if (cancelled) return
        setQuestionarios(qs)

        if (userRole === "comissao" || userRole === "adm") {
          const allRespostas: Resposta[] = []
          await Promise.all(
            qs.map(async (q) => {
              try {
                const rawRs = await api.get(`/respostas/questionario/${q.id}`)
                allRespostas.push(...rawRs.map(fromApiResposta))
              } catch {
                // erros individuais são silenciados — relatório fica incompleto mas não quebra
              }
            }),
          )
          if (!cancelled) setRespostas(allRespostas)
        } else {
          // respondente / padrao: só o próprio histórico (para jaRespondeu)
          try {
            const rawHist = await api.get("/respostas/meu-historico")
            if (!cancelled) {
              const hist: Resposta[] = rawHist.map(fromApiResposta)
              setRespostas(hist)
              setRespondidosIds(new Set(hist.map((r) => r.questionarioId)))
            }
          } catch {
            // silencia — jaRespondeu retorna false por padrão
          }
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erro ao carregar dados.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [userRole])

  async function upsert(q: Questionario) {
    const payload = toApiPayload(q)
    const isExisting = questionarios.some((p) => p.id === q.id)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: Record<string, any>
      if (isExisting) {
        result = await api.put(`/questionarios/${q.id}`, payload)
      } else {
        result = await api.post("/questionarios/", payload)
      }
      if (q.status === "publicado" && result.status === "rascunho") {
        result = await api.patch(`/questionarios/${result.id}/publicar`, {})
      }
      const saved = fromApiQ(result)
      setQuestionarios((prev) => {
        const exists = prev.some((p) => p.id === saved.id)
        return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved]
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar questionário."
      setError(msg)
      throw new Error(msg)
    }
  }

  async function encerrar(id: string) {
    try {
      const result = await api.patch(`/questionarios/${id}/encerrar`, {})
      const saved = fromApiQ(result)
      setQuestionarios((prev) => prev.map((q) => (q.id === id ? saved : q)))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao encerrar questionário."
      setError(msg)
      throw new Error(msg)
    }
  }

  async function arquivar(id: string) {
    try {
      const result = await api.patch(`/questionarios/${id}/arquivar`, {})
      const saved = fromApiQ(result)
      setQuestionarios((prev) => prev.map((q) => (q.id === id ? saved : q)))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao arquivar questionário."
      setError(msg)
      throw new Error(msg)
    }
  }

  async function excluir(id: string) {
    try {
      await api.delete(`/questionarios/${id}`)
      setQuestionarios((prev) => prev.filter((q) => q.id !== id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir questionário."
      setError(msg)
      throw new Error(msg)
    }
  }

  async function submeterResposta(r: Resposta) {
    const payload = {
      questionario_id: r.questionarioId,
      respostas: r.respostas.map((rq) => ({
        questao_id: rq.questaoId,
        opcao_id: rq.opcaoId ?? null,
        likert_valor: rq.likertValor ?? null,
        texto: rq.texto ?? null,
      })),
    }
    try {
      const result = await api.post("/respostas/", payload)
      const saved = fromApiResposta(result)
      setRespostas((prev) => [...prev, saved])
      setRespondidosIds((prev) => new Set([...prev, r.questionarioId]))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao submeter resposta."
      setError(msg)
      throw new Error(msg)
    }
  }

  function getQuestionariosVigentes(): Questionario[] {
    const hoje = new Date().toISOString().slice(0, 10)
    return questionarios.filter(
      (q) => q.status === "publicado" && q.dataInicio <= hoje && q.dataFim >= hoje,
    )
  }

  function jaRespondeu(_respondentId: string, questionarioId: string): boolean {
    if (userRole === "respondente" || userRole === "padrao") {
      return respondidosIds.has(questionarioId)
    }
    return respostas.some((r) => r.questionarioId === questionarioId)
  }

  return (
    <QuestionarioContext.Provider
      value={{
        questionarios,
        respostas,
        isLoading,
        error,
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
