from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Questionario, QuestionarioCurso, Questao, Opcao, Curso, Usuario
from app.schemas.questionario import QuestionarioCreate, QuestionarioOut, QuestionarioUpdate
from app.dependencies import get_current_user, require_role

router = APIRouter(prefix="/questionarios", tags=["questionarios"])


def _build_out(q: Questionario) -> QuestionarioOut:
    return QuestionarioOut(
        id=q.id, titulo=q.titulo, descricao=q.descricao,
        data_inicio=q.data_inicio, data_fim=q.data_fim,
        anonimo=q.anonimo, status=q.status,
        criado_por_id=q.criado_por_id,
        criado_em=q.criado_em, atualizado_em=q.atualizado_em,
        curso_ids=[qc.curso_id for qc in q.cursos],
        questoes=[
            {"id": qu.id, "enunciado": qu.enunciado, "tipo": qu.tipo,
             "obrigatoria": qu.obrigatoria, "likert_escala": qu.likert_escala,
             "ordem": qu.ordem,
             "opcoes": [{"id": o.id, "texto": o.texto, "ordem": o.ordem} for o in qu.opcoes]}
            for qu in q.questoes
        ],
    )


def _sync_questoes(db: Session, q: Questionario, questoes_in: list):
    db.query(Questao).filter(Questao.questionario_id == q.id).delete()
    for qi in questoes_in:
        questao = Questao(
            questionario_id=q.id, enunciado=qi.enunciado,
            tipo=qi.tipo, obrigatoria=qi.obrigatoria,
            likert_escala=qi.likert_escala, ordem=qi.ordem,
        )
        db.add(questao)
        db.flush()
        for oi in qi.opcoes:
            db.add(Opcao(questao_id=questao.id, texto=oi.texto, ordem=oi.ordem))


def _sync_cursos(db: Session, q: Questionario, curso_ids: list[str]):
    db.query(QuestionarioCurso).filter(QuestionarioCurso.questionario_id == q.id).delete()
    for cid in curso_ids:
        if not db.get(Curso, cid):
            raise HTTPException(status_code=404, detail=f"Curso {cid} não encontrado")
        db.add(QuestionarioCurso(questionario_id=q.id, curso_id=cid))


def _cursos_do_usuario(u: Usuario) -> list[str]:
    return [c.curso_id for c in u.cursos_comissao]


@router.get("/", response_model=list[QuestionarioOut])
def listar(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    q = db.query(Questionario)
    if current_user.role == "comissao":
        meus_cursos = _cursos_do_usuario(current_user)
        ids = db.query(QuestionarioCurso.questionario_id).filter(
            QuestionarioCurso.curso_id.in_(meus_cursos)
        ).subquery()
        q = q.filter(Questionario.id.in_(ids))
    elif current_user.role in ("respondente", "padrao"):
        hoje = date.today().isoformat()
        meus_cursos = [c.curso_id for c in current_user.cursos_respondente]
        ids = db.query(QuestionarioCurso.questionario_id).filter(
            QuestionarioCurso.curso_id.in_(meus_cursos)
        ).subquery()
        q = q.filter(
            Questionario.id.in_(ids),
            Questionario.status == "publicado",
            Questionario.data_inicio <= hoje,
            Questionario.data_fim >= hoje,
        )
    return [_build_out(qi) for qi in q.all()]


@router.post("/", response_model=QuestionarioOut, status_code=status.HTTP_201_CREATED)
def criar(
    body: QuestionarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("comissao", "adm")),
):
    q = Questionario(
        titulo=body.titulo, descricao=body.descricao,
        data_inicio=body.data_inicio, data_fim=body.data_fim,
        anonimo=body.anonimo, criado_por_id=current_user.id,
    )
    db.add(q)
    db.flush()
    _sync_cursos(db, q, body.curso_ids)
    _sync_questoes(db, q, body.questoes)
    db.commit()
    db.refresh(q)
    return _build_out(q)


@router.put("/{qid}", response_model=QuestionarioOut)
def atualizar(
    qid: str,
    body: QuestionarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("comissao", "adm")),
):
    q = db.get(Questionario, qid)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    if q.status != "rascunho":
        raise HTTPException(status_code=409, detail="Apenas rascunhos podem ser editados (RN03)")
    if body.titulo is not None:
        q.titulo = body.titulo
    if body.descricao is not None:
        q.descricao = body.descricao
    if body.data_inicio is not None:
        q.data_inicio = body.data_inicio
    if body.data_fim is not None:
        q.data_fim = body.data_fim
    if body.anonimo is not None:
        q.anonimo = body.anonimo
    if body.curso_ids is not None:
        _sync_cursos(db, q, body.curso_ids)
    if body.questoes is not None:
        _sync_questoes(db, q, body.questoes)
    db.commit()
    db.refresh(q)
    return _build_out(q)


@router.patch("/{qid}/publicar", response_model=QuestionarioOut)
def publicar(qid: str, db: Session = Depends(get_db), _=Depends(require_role("comissao", "adm"))):
    q = db.get(Questionario, qid)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    if q.status != "rascunho":
        raise HTTPException(status_code=409, detail="Apenas rascunhos podem ser publicados")
    q.status = "publicado"
    db.commit()
    db.refresh(q)
    return _build_out(q)


@router.patch("/{qid}/encerrar", response_model=QuestionarioOut)
def encerrar(qid: str, db: Session = Depends(get_db), _=Depends(require_role("comissao", "adm"))):
    q = db.get(Questionario, qid)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    if q.status != "publicado":
        raise HTTPException(status_code=409, detail="Apenas questionários publicados podem ser encerrados")
    q.status = "encerrado"
    db.commit()
    db.refresh(q)
    return _build_out(q)


@router.patch("/{qid}/arquivar", response_model=QuestionarioOut)
def arquivar(qid: str, db: Session = Depends(get_db), _=Depends(require_role("comissao", "adm"))):
    q = db.get(Questionario, qid)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    if q.status != "encerrado":
        raise HTTPException(status_code=409, detail="Apenas questionários encerrados podem ser arquivados")
    q.status = "arquivado"
    db.commit()
    db.refresh(q)
    return _build_out(q)


@router.delete("/{qid}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(qid: str, db: Session = Depends(get_db), _=Depends(require_role("comissao", "adm"))):
    q = db.get(Questionario, qid)
    if not q:
        raise HTTPException(status_code=404, detail="Questionário não encontrado")
    db.delete(q)
    db.commit()
