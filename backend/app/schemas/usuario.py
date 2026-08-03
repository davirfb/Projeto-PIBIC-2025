from datetime import datetime
from pydantic import BaseModel, EmailStr


class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    role: str
    sub_type: str | None = None
    curso_ids: list[str] = []


class UsuarioUpdate(BaseModel):
    nome: str | None = None
    role: str | None = None
    sub_type: str | None = None
    ativo: bool | None = None
    curso_ids: list[str] | None = None


class UsuarioOut(BaseModel):
    id: str
    nome: str
    email: str
    role: str
    sub_type: str | None
    ativo: bool
    criado_em: datetime
    curso_ids: list[str] = []

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UsuarioOut
