export type UserRole = "adm" | "comissao" | "respondente" | "padrao"

export type UserSubType =
  | "aluno"
  | "professor"
  | "coordenador"
  | "tecnico_administrativo"
  | "outro"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  subType?: UserSubType
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}
