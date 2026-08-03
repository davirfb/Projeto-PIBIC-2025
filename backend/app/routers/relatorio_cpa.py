"""
Módulo e-MEC / INEP — RF_INEP_01, RF_INEP_02, RF_INEP_03.

RF_INEP_01  GET  /relatorio-cpa/{questionario_id}        → relatório CPA estruturado
RF_INEP_02  GET  /relatorio-cpa/{questionario_id}/xml    → exportação XML (e-MEC)
RF_INEP_03  GET  /relatorio-cpa/submissoes               → log de auditoria
RF_INEP_03  POST /relatorio-cpa/submissoes               → registrar nova submissão
RF_INEP_03  PATCH /relatorio-cpa/submissoes/{id}/status  → atualizar status (confirmado/rejeitado)
"""
from datetime import datetime, timezone
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom.minidom import parseString
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import Questionario, Resposta, RespostaQuestao, Questao, SubmissaoINEP, Usuario
from app.dependencies import get_current_user, require_role

router = APIRouter(prefix="/relatorio-cpa", tags=["relatorio-cpa"])

_comissao_adm = require_role("comissao", "adm")


# ---------------------------------------------------------------------------
# Schemas de saída
# ---------------------------------------------------------------------------

class QuestaoResumoOut(BaseModel):
    questao_id: str
    enunciado: str
    tipo: str
    total_respostas: int
    media_likert: float | None
    distribuicao: dict[str, int]
    respostas_dissertativas: list[str]

    model_config = {"from_attributes": True}


class RelatorioCPAOut(BaseModel):
    questionario_id: str
    titulo: str
    data_inicio: str
    data_fim: str
    total_respondentes: int
    questoes: list[QuestaoResumoOut]

    model_config = {"from_attributes": True}


class SubmissaoCreate(BaseModel):
    questionario_id: str
    observacao: str | None = None


class SubmissaoStatusUpdate(BaseModel):
    status: str  # confirmado | rejeitado
    observacao: str | None = None


class SubmissaoOut(BaseModel):
    id: str
    questionario_id: str | None
    usuario_id: str | None
    status: str
    observacao: str | None
    registrado_em: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_relatorio(q: Questionario, respostas: list[Resposta]) -> RelatorioCPAOut:
    questoes_out: list[QuestaoResumoOut] = []

    for questao in q.questoes:
        rqs: list[RespostaQuestao] = [
            rq for r in respostas for rq in r.respostas_questao if rq.questao_id == questao.id
        ]
        total = len(rqs)
        distribuicao: dict[str, int] = {}
        media_likert: float | None = None
        dissertativas: list[str] = []

        if questao.tipo == "likert":
            valores = [rq.likert_valor for rq in rqs if rq.likert_valor is not None]
            if valores:
                media_likert = round(sum(valores) / len(valores), 2)
            for v in range(1, 6):
                distribuicao[str(v)] = valores.count(v)

        elif questao.tipo == "multipla_escolha":
            for rq in rqs:
                if rq.opcao_id:
                    distribuicao[rq.opcao_id] = distribuicao.get(rq.opcao_id, 0) + 1

        elif questao.tipo == "dissertativa":
            dissertativas = [rq.texto for rq in rqs if rq.texto]

        questoes_out.append(QuestaoResumoOut(
            questao_id=questao.id,
            enunciado=questao.enunciado,
            tipo=questao.tipo,
            total_respostas=total,
            media_likert=media_likert,
            distribuicao=distribuicao,
            respostas_dissertativas=dissertativas,
        ))

    return RelatorioCPAOut(
        questionario_id=q.id,
        titulo=q.titulo,
        data_inicio=q.data_inicio.isoformat(),
        data_fim=q.data_fim.isoformat(),
        total_respondentes=len(respostas),
        questoes=questoes_out,
    )


def _build_xml(relatorio: RelatorioCPAOut) -> str:
    """
    Gera XML com a estrutura base compatível com o e-MEC/INEP (RF_INEP_02).
    O leiaute definitivo deve ser obtido junto ao INEP — este é o esqueleto inicial.
    """
    root = Element("RelatorioAutoavaliacao")
    root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    root.set("versao", "1.0")
    root.set("geradoEm", datetime.now(timezone.utc).isoformat())

    identificacao = SubElement(root, "Identificacao")
    SubElement(identificacao, "QuestionarioId").text = relatorio.questionario_id
    SubElement(identificacao, "Titulo").text = relatorio.titulo
    SubElement(identificacao, "PeriodoInicio").text = relatorio.data_inicio
    SubElement(identificacao, "PeriodoFim").text = relatorio.data_fim
    SubElement(identificacao, "TotalRespondentes").text = str(relatorio.total_respondentes)

    questoes_el = SubElement(root, "Questoes")
    for q in relatorio.questoes:
        q_el = SubElement(questoes_el, "Questao", id=q.questao_id, tipo=q.tipo)
        SubElement(q_el, "Enunciado").text = q.enunciado
        SubElement(q_el, "TotalRespostas").text = str(q.total_respostas)

        if q.tipo == "likert" and q.media_likert is not None:
            SubElement(q_el, "MediaLikert").text = str(q.media_likert)
            dist_el = SubElement(q_el, "Distribuicao")
            for valor, contagem in q.distribuicao.items():
                SubElement(dist_el, "Opcao", valor=valor).text = str(contagem)

        elif q.tipo == "multipla_escolha":
            dist_el = SubElement(q_el, "Distribuicao")
            for opcao_id, contagem in q.distribuicao.items():
                SubElement(dist_el, "Opcao", opcaoId=opcao_id).text = str(contagem)

        elif q.tipo == "dissertativa":
            respostas_el = SubElement(q_el, "Respostas")
            for texto in q.respostas_dissertativas:
                SubElement(respostas_el, "Resposta").text = texto

    raw = tostring(root, encoding="unicode")
    return parseString(raw).toprettyxml(indent="  ", encoding=None)


# ---------------------------------------------------------------------------
# Rotas
# ---------------------------------------------------------------------------

@router.get("/{questionario_id}", response_model=RelatorioCPAOut)
def gerar_relatorio(
    questionario_id: str,
    db: Session = Depends(get_db),
    _=Depends(_comissao_adm),
):
    """RF_INEP_01 — Gera relatório CPA estruturado de um questionário encerrado."""
    q = db.get(Questionario, questionario_id)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    if q.status not in ("encerrado", "arquivado"):
        raise HTTPException(status_code=409, detail="Relatório disponível apenas após encerramento (RN07)")
    respostas = db.query(Resposta).filter(Resposta.questionario_id == questionario_id).all()
    return _build_relatorio(q, respostas)


@router.get("/{questionario_id}/xml")
def exportar_xml(
    questionario_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(_comissao_adm),
):
    """RF_INEP_02 — Exporta relatório CPA em XML compatível com e-MEC/INEP."""
    q = db.get(Questionario, questionario_id)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    if q.status not in ("encerrado", "arquivado"):
        raise HTTPException(status_code=409, detail="Exportação disponível apenas após encerramento (RN07/RN11)")

    respostas = db.query(Resposta).filter(Resposta.questionario_id == questionario_id).all()
    relatorio = _build_relatorio(q, respostas)

    # Verifica completude mínima (RN11)
    if not relatorio.questoes:
        raise HTTPException(status_code=422, detail="Relatório incompleto — sem questões respondidas (RN11)")

    xml_content = _build_xml(relatorio)
    filename = f"relatorio_cpa_{questionario_id}.xml"
    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/submissoes/historico", response_model=list[SubmissaoOut])
def listar_submissoes(
    db: Session = Depends(get_db),
    _=Depends(require_role("adm")),
):
    """RF_INEP_03 — Lista o histórico de submissões ao e-MEC (somente ADM)."""
    return db.query(SubmissaoINEP).order_by(SubmissaoINEP.registrado_em.desc()).all()


@router.post("/submissoes", response_model=SubmissaoOut, status_code=201)
def registrar_submissao(
    body: SubmissaoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(_comissao_adm),
):
    """RF_INEP_03 — Registra uma nova submissão ao e-MEC."""
    q = db.get(Questionario, body.questionario_id)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    sub = SubmissaoINEP(
        questionario_id=body.questionario_id,
        usuario_id=current_user.id,
        status="enviado",
        observacao=body.observacao,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.patch("/submissoes/{submissao_id}/status", response_model=SubmissaoOut)
def atualizar_status_submissao(
    submissao_id: str,
    body: SubmissaoStatusUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("adm")),
):
    """RF_INEP_03 — Atualiza status de uma submissão (confirmado/rejeitado). Somente ADM."""
    sub = db.get(SubmissaoINEP, submissao_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submissão não encontrada")
    if body.status not in ("confirmado", "rejeitado"):
        raise HTTPException(status_code=422, detail="Status deve ser 'confirmado' ou 'rejeitado'")
    sub.status = body.status
    if body.observacao:
        sub.observacao = body.observacao
    db.commit()
    db.refresh(sub)
    return sub
