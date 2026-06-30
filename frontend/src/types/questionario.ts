export type QuestaoTipo = "multipla_escolha" | "likert" | "dissertativa"

export type QuestionarioStatus = "rascunho" | "publicado" | "encerrado" | "arquivado"

export type LikertEscalaId = "satisfacao" | "concordancia" | "frequencia" | "qualidade"

export const LIKERT_ESCALAS: Record<LikertEscalaId, { label: string; opcoes: string[] }> = {
  satisfacao: {
    label: "Satisfação",
    opcoes: ["Muito Insatisfeito", "Insatisfeito", "Regular", "Satisfeito", "Muito Satisfeito"],
  },
  concordancia: {
    label: "Concordância",
    opcoes: ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"],
  },
  frequencia: {
    label: "Frequência",
    opcoes: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"],
  },
  qualidade: {
    label: "Qualidade",
    opcoes: ["Péssimo", "Ruim", "Regular", "Bom", "Ótimo"],
  },
}

export interface Opcao {
  id: string
  texto: string
}

export interface Questao {
  id: string
  tipo: QuestaoTipo
  enunciado: string
  obrigatoria: boolean
  opcoes?: Opcao[]
  likertEscala?: LikertEscalaId
}

export interface Eixo {
  id: string
  nome: string
  cor: string
}

export const EIXO_CORES = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"]

export interface Questionario {
  id: string
  titulo: string
  descricao: string
  dataInicio: string
  dataFim: string
  anonimo: boolean
  status: QuestionarioStatus
  questoes: Questao[]
  cursos: string[]
  criadoEm: string
  atualizadoEm: string
}