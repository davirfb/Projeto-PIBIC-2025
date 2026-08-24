import type { UserRole, UserSubType } from "@/types/user"

export interface UsuarioAdm {
  id: string
  nome: string
  email: string
  perfil: UserRole
  subTipo?: UserSubType
  cursoIds: string[]
  ativo: boolean
  criadoEm: string
}

export interface Turma {
  id: string
  nome: string
  ano: number
  semestre: number
}

export interface Curso {
  id: string
  nome: string
  codigo: string
  turmas: Turma[]
}

export interface LogEntry {
  id: string
  acao: string
  usuario: string
  perfil?: UserRole
  timestamp: string
}

export interface Configuracoes {
  nomeInstituicao: string
  campus: string
  limiarParticipacao: number
  emailSuporte: string
}
