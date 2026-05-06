import type { UserRole } from "@/types/user"

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
  respondentRole: UserRole
  respostas: RespostaQuestao[]
  submetidoEm: string
}
