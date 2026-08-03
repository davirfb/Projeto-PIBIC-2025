from datetime import date, datetime
from pydantic import BaseModel


class OpcaoIn(BaseModel):
    id: str | None = None
    texto: str
    ordem: int = 0


class QuestaoIn(BaseModel):
    id: str | None = None
    enunciado: str
    tipo: str  # multipla_escolha|likert|dissertativa
    obrigatoria: bool = True
    likert_escala: str | None = None
    ordem: int = 0
    opcoes: list[OpcaoIn] = []


class QuestionarioCreate(BaseModel):
    titulo: str
    descricao: str = ""
    data_inicio: date
    data_fim: date
    anonimo: bool = False
    curso_ids: list[str] = []
    questoes: list[QuestaoIn] = []


class QuestionarioUpdate(BaseModel):
    titulo: str | None = None
    descricao: str | None = None
    data_inicio: date | None = None
    data_fim: date | None = None
    anonimo: bool | None = None
    curso_ids: list[str] | None = None
    questoes: list[QuestaoIn] | None = None


class OpcaoOut(BaseModel):
    id: str
    texto: str
    ordem: int

    model_config = {"from_attributes": True}


class QuestaoOut(BaseModel):
    id: str
    enunciado: str
    tipo: str
    obrigatoria: bool
    likert_escala: str | None
    ordem: int
    opcoes: list[OpcaoOut] = []

    model_config = {"from_attributes": True}


class QuestionarioOut(BaseModel):
    id: str
    titulo: str
    descricao: str
    data_inicio: date
    data_fim: date
    anonimo: bool
    status: str
    criado_por_id: str
    criado_em: datetime
    atualizado_em: datetime
    curso_ids: list[str] = []
    questoes: list[QuestaoOut] = []

    model_config = {"from_attributes": True}
