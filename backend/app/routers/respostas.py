from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Resposta, RespostaQuestao, Questionario, Usuario
from app.schemas.resposta import RespostaCreate, RespostaOut
from app.dependencies import get_current_user, require_role

router = APIRouter(prefix="/respostas", tags=["respostas"])


def _build_out(r: Resposta, anonimo: bool) -> RespostaOut:
    return RespostaOut(
        id=r.id,
        questionario_id=r.questionario_id,
        respondente_role=r.respondente_role,
        submetido_em=r.submetido_em,
        respostas_questao=[
            {"id": rq.id, "questao_id": rq.questao_id,
             "opcao_id": rq.opcao_id, "likert_valor": rq.likert_valor, "texto": rq.texto}
            for rq in r.respostas_questao
        ],
    )


@router.post("/", response_model=RespostaOut, status_code=status.HTTP_201_CREATED)
def submeter(
    body: RespostaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("respondente", "padrao")),
):
    q = db.get(Questionario, body.questionario_id)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")

    hoje = date.today().isoformat()
    if q.status != "publicado" or not (q.data_inicio.isoformat() <= hoje <= q.data_fim.isoformat()):
        raise HTTPException(status_code=409, detail="Questionário não está vigente (RN01)")

    ja_respondeu = db.query(Resposta).filter(
        Resposta.respondente_id == current_user.id,
        Resposta.questionario_id == q.id,
    ).first()
    if ja_respondeu:
        raise HTTPException(status_code=409, detail="Você já respondeu este questionário (RN02)")

    resposta = Resposta(
        questionario_id=q.id,
        respondente_id=current_user.id,  # sempre salvo para deduplicação
        respondente_role=current_user.role,
    )
    db.add(resposta)
    db.flush()

    for rq in body.respostas:
        db.add(RespostaQuestao(
            resposta_id=resposta.id,
            questao_id=rq.questao_id,
            opcao_id=rq.opcao_id,
            likert_valor=rq.likert_valor,
            texto=rq.texto,
        ))

    db.commit()
    db.refresh(resposta)
    return _build_out(resposta, q.anonimo)


@router.get("/questionario/{qid}", response_model=list[RespostaOut])
def listar_por_questionario(
    qid: str,
    db: Session = Depends(get_db),
    _=Depends(require_role("comissao", "adm")),
):
    q = db.get(Questionario, qid)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    respostas = db.query(Resposta).filter(Resposta.questionario_id == qid).all()
    return [_build_out(r, q.anonimo) for r in respostas]


@router.get("/meu-historico", response_model=list[RespostaOut])
def historico(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("respondente")),
):
    respostas = db.query(Resposta).filter(Resposta.respondente_id == current_user.id).all()
    return [_build_out(r, False) for r in respostas]
