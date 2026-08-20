import type { UserTipo } from "@/types/user"

export interface RespostaQuestao {
  questaoId: string
  opcaoId?: string
  likertValor?: number
  texto?: string
}

export interface Resposta {
  id: string
  questionarioId: string
  respondentId: string | null
  respondentTipo: UserTipo
  respostas: RespostaQuestao[]
  submetidoEm: string
}
