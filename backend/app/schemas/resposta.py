from datetime import datetime
from pydantic import BaseModel


class RespostaQuestaoIn(BaseModel):
    questao_id: str
    opcao_id: str | None = None
    likert_valor: int | None = None
    texto: str | None = None


class RespostaCreate(BaseModel):
    questionario_id: str
    respostas: list[RespostaQuestaoIn]


class RespostaQuestaoOut(BaseModel):
    id: str
    questao_id: str
    opcao_id: str | None
    likert_valor: int | None
    texto: str | None

    model_config = {"from_attributes": True}


class RespostaOut(BaseModel):
    id: str
    questionario_id: str
    respondente_role: str
    submetido_em: datetime
    respostas_questao: list[RespostaQuestaoOut] = []
    # respondente_id nunca é exposto (RN04)

    model_config = {"from_attributes": True}
