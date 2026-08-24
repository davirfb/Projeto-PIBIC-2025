import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import type { Questionario, QuestaoTipo, LikertEscalaId, QuestionarioStatus } from "@/types/questionario"
import type { Resposta } from "@/types/resposta"
import type { UserRole } from "@/types/user"
import { supabase } from "@/lib/supabase"
import {
  DEMO_MODE,
  DEMO_QUESTIONARIOS,
  DEMO_RESPOSTAS,
  DEMO_RESPOSTAS_ANA,
  DEMO_RESPONDIDOS_ANA,
  DEMO_RESPOSTAS_LUCAS,
  DEMO_RESPONDIDOS_LUCAS,
} from "@/demo/demoData"

// ---- Mappers ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbQ(raw: Record<string, any>): Questionario {
  return {
    id: raw.id,
    titulo: raw.titulo,
    descricao: raw.descricao ?? "",
    dataInicio: String(raw.data_inicio),
    dataFim: String(raw.data_fim),
    anonimo: raw.anonimo,
    status: raw.status as QuestionarioStatus,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questoes: (raw.questoes ?? []).sort((a: any, b: any) => a.ordem - b.ordem).map((q: Record<string, any>) => ({
      id: q.id,
      tipo: q.tipo as QuestaoTipo,
      enunciado: q.enunciado,
      obrigatoria: q.obrigatoria,
      likertEscala: (q.likert_escala ?? undefined) as LikertEscalaId | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opcoes: (q.opcoes ?? []).sort((a: any, b: any) => a.ordem - b.ordem).map((o: Record<string, any>) => ({
        id: o.id,
        texto: o.texto,
      })),
    })),
    cursos: (raw.questionario_cursos ?? []).map((qc: { curso_id: string }) => qc.curso_id),
    criadoEm: String(raw.criado_em),
    atualizadoEm: String(raw.atualizado_em),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbResposta(raw: Record<string, any>): Resposta {
  return {
    id: raw.id,
    questionarioId: raw.questionario_id,
    respondentId: null,
    respondentRole: raw.respondente_role as UserRole,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    respostas: (raw.respostas_questoes ?? []).map((rq: Record<string, any>) => ({
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
  userId: string
}

export function QuestionarioProvider({ children, userRole, userId }: QuestionarioProviderProps) {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [respondidosIds, setRespondidosIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (DEMO_MODE) {
      setQuestionarios(DEMO_QUESTIONARIOS)
      if (userRole === "adm" || userRole === "comissao") {
        setRespostas(DEMO_RESPOSTAS)
      } else if (userId === "demo-estudante-comissao") {
        // Ana: tem historico de pesquisas anteriores (2024/1 e 2026/1)
        setRespostas(DEMO_RESPOSTAS_ANA)
        setRespondidosIds(new Set(DEMO_RESPONDIDOS_ANA))
      } else if (userId === "demo-aluno-respondente") {
        // Lucas: tem 2 pesquisas respondidas no historico
        setRespostas(DEMO_RESPOSTAS_LUCAS)
        setRespondidosIds(new Set(DEMO_RESPONDIDOS_LUCAS))
      } else {
        setRespostas([])
        setRespondidosIds(new Set())
      }
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const { data: rawQs, error: qError } = await supabase
        .from("questionarios")
        .select(`
          *,
          questionario_cursos(curso_id),
          questoes(id, tipo, enunciado, obrigatoria, likert_escala, ordem,
            opcoes(id, texto, ordem)
          )
        `)
        .order("criado_em", { ascending: false })

      if (qError) throw qError
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setQuestionarios((rawQs as Record<string, any>[]).map(fromDbQ))

      if (userRole === "adm" || userRole === "comissao") {
        const { data: rawRs } = await supabase
          .from("respostas")
          .select("*, respostas_questoes(*)")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setRespostas((rawRs ?? []).map((r: Record<string, any>) => fromDbResposta(r)))
      } else {
        const { data: rawRs } = await supabase
          .from("respostas")
          .select("*, respostas_questoes(*)")
          .eq("respondente_id", userId)
        const hist = (rawRs ?? []).map(fromDbResposta)
        setRespostas(hist)
        setRespondidosIds(new Set(rawRs?.map((r) => r.questionario_id as string) ?? []))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.")
    } finally {
      setIsLoading(false)
    }
  }, [userRole, userId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function upsert(q: Questionario) {
    if (DEMO_MODE) {
      const isExisting = questionarios.some((p) => p.id === q.id)
      setQuestionarios((prev) =>
        isExisting ? prev.map((p) => (p.id === q.id ? q : p)) : [q, ...prev],
      )
      return
    }
    const isExisting = questionarios.some((p) => p.id === q.id)

    try {
      let questionarioId: string

      if (isExisting) {
        const updates: Record<string, unknown> = {
          titulo: q.titulo,
          descricao: q.descricao,
          data_inicio: q.dataInicio,
          data_fim: q.dataFim,
          anonimo: q.anonimo,
        }
        if (q.status === "publicado") updates.status = "publicado"

        const { error: uError } = await supabase
          .from("questionarios")
          .update(updates)
          .eq("id", q.id)
        if (uError) throw uError
        questionarioId = q.id
      } else {
        const { data: created, error: iError } = await supabase
          .from("questionarios")
          .insert({
            titulo: q.titulo,
            descricao: q.descricao,
            data_inicio: q.dataInicio,
            data_fim: q.dataFim,
            anonimo: q.anonimo,
            status: "rascunho",
            criado_por_id: userId,
          })
          .select("id")
          .single()
        if (iError || !created) throw iError ?? new Error("Erro ao criar questionario")
        questionarioId = created.id as string

        if (q.status === "publicado") {
          await supabase
            .from("questionarios")
            .update({ status: "publicado" })
            .eq("id", questionarioId)
        }
      }

      await supabase.from("questionario_cursos").delete().eq("questionario_id", questionarioId)
      if (q.cursos.length > 0) {
        await supabase.from("questionario_cursos").insert(
          q.cursos.map((cid) => ({ questionario_id: questionarioId, curso_id: cid })),
        )
      }

      await supabase.from("questoes").delete().eq("questionario_id", questionarioId)
      for (let i = 0; i < q.questoes.length; i++) {
        const qu = q.questoes[i]
        const { data: questao, error: qErr } = await supabase
          .from("questoes")
          .insert({
            questionario_id: questionarioId,
            enunciado: qu.enunciado,
            tipo: qu.tipo,
            obrigatoria: qu.obrigatoria,
            likert_escala: qu.likertEscala ?? null,
            ordem: i,
          })
          .select("id")
          .single()
        if (qErr || !questao) throw qErr ?? new Error("Erro ao criar questao")

        if (qu.opcoes && qu.opcoes.length > 0) {
          await supabase.from("opcoes").insert(
            qu.opcoes.map((o, oi) => ({
              questao_id: questao.id as string,
              texto: o.texto,
              ordem: oi,
            })),
          )
        }
      }

      const { data: refreshed } = await supabase
        .from("questionarios")
        .select(`
          *,
          questionario_cursos(curso_id),
          questoes(id, tipo, enunciado, obrigatoria, likert_escala, ordem,
            opcoes(id, texto, ordem)
          )
        `)
        .eq("id", questionarioId)
        .single()

      if (refreshed) {
        const saved = fromDbQ(refreshed as Record<string, unknown>)
        setQuestionarios((prev) =>
          isExisting ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved],
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar questionario."
      setError(msg)
      throw new Error(msg)
    }
  }

  async function encerrar(id: string) {
    if (DEMO_MODE) {
      setQuestionarios((prev) => prev.map((q) => (q.id === id ? { ...q, status: "encerrado" as QuestionarioStatus } : q)))
      return
    }
    const { error } = await supabase
      .from("questionarios")
      .update({ status: "encerrado" })
      .eq("id", id)
    if (error) { setError(error.message); throw error }
    setQuestionarios((prev) => prev.map((q) => (q.id === id ? { ...q, status: "encerrado" as QuestionarioStatus } : q)))
  }

  async function arquivar(id: string) {
    if (DEMO_MODE) {
      setQuestionarios((prev) => prev.map((q) => (q.id === id ? { ...q, status: "arquivado" as QuestionarioStatus } : q)))
      return
    }
    const { error } = await supabase
      .from("questionarios")
      .update({ status: "arquivado" })
      .eq("id", id)
    if (error) { setError(error.message); throw error }
    setQuestionarios((prev) => prev.map((q) => (q.id === id ? { ...q, status: "arquivado" as QuestionarioStatus } : q)))
  }

  async function excluir(id: string) {
    if (DEMO_MODE) {
      setQuestionarios((prev) => prev.filter((q) => q.id !== id))
      return
    }
    const { error } = await supabase.from("questionarios").delete().eq("id", id)
    if (error) { setError(error.message); throw error }
    setQuestionarios((prev) => prev.filter((q) => q.id !== id))
  }

  async function submeterResposta(r: Resposta) {
    if (DEMO_MODE) {
      const saved: Resposta = { ...r, id: `${Date.now()}-demo`, respondentId: null, submetidoEm: new Date().toISOString() }
      setRespostas((prev) => [...prev, saved])
      setRespondidosIds((prev) => new Set([...prev, r.questionarioId]))
      return
    }
    try {
      const { data: resposta, error: rError } = await supabase
        .from("respostas")
        .insert({
          questionario_id: r.questionarioId,
          respondente_id: userId,
          respondente_role: userRole,
        })
        .select("id")
        .single()
      if (rError || !resposta) throw rError ?? new Error("Erro ao submeter resposta")

      if (r.respostas.length > 0) {
        const { error: rqError } = await supabase.from("respostas_questoes").insert(
          r.respostas.map((rq) => ({
            resposta_id: resposta.id as string,
            questao_id: rq.questaoId,
            opcao_id: rq.opcaoId ?? null,
            likert_valor: rq.likertValor ?? null,
            texto: rq.texto ?? null,
          })),
        )
        if (rqError) throw rqError
      }

      const saved: Resposta = {
        id: resposta.id as string,
        questionarioId: r.questionarioId,
        respondentId: null,
        respondentRole: userRole,
        respostas: r.respostas,
        submetidoEm: new Date().toISOString(),
      }
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
    if (userRole !== "adm" && userRole !== "comissao") {
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
