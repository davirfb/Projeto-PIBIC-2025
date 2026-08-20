export type UserTipo =
  | "aluno"
  | "professor"
  | "coordenador"
  | "tecnico_administrativo"
  | "outro"

export type NivelAcesso = "padrao" | "respondente"

export interface ComissaoInfo {
  id: string
  nome: string
  cursoId: string
  cursoNome: string
  isDiretor: boolean
}

export interface AuthUser {
  id: string
  email: string
  nome: string
  tipo: UserTipo
  nivelAcesso: NivelAcesso
  isAdm: boolean
  comissoes: ComissaoInfo[]
}

export interface LoginCredentials {
  email: string
  password: string
}
