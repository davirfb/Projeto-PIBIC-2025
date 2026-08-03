from datetime import datetime
from pydantic import BaseModel


class CursoCreate(BaseModel):
    nome: str
    codigo: str


class CursoUpdate(BaseModel):
    nome: str | None = None
    ativo: bool | None = None


class CursoOut(BaseModel):
    id: str
    nome: str
    codigo: str
    ativo: bool
    criado_em: datetime

    model_config = {"from_attributes": True}
