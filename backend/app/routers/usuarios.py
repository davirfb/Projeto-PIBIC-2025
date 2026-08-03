from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario, ComissaoCurso, RespondenteCurso, Curso
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.services.auth import hash_senha
from app.dependencies import require_role

router = APIRouter(prefix="/usuarios", tags=["usuarios"])
_adm = require_role("adm")


def _build_out(u: Usuario) -> UsuarioOut:
    curso_ids = [c.curso_id for c in u.cursos_comissao] + [c.curso_id for c in u.cursos_respondente]
    return UsuarioOut(
        id=u.id, nome=u.nome, email=u.email, role=u.role,
        sub_type=u.sub_type, ativo=u.ativo, criado_em=u.criado_em,
        curso_ids=list(set(curso_ids)),
    )


def _sync_cursos(db: Session, u: Usuario, curso_ids: list[str]):
    db.query(ComissaoCurso).filter(ComissaoCurso.usuario_id == u.id).delete()
    db.query(RespondenteCurso).filter(RespondenteCurso.usuario_id == u.id).delete()
    for cid in curso_ids:
        if not db.get(Curso, cid):
            raise HTTPException(status_code=404, detail=f"Curso {cid} não encontrado")
        if u.role == "comissao":
            db.add(ComissaoCurso(usuario_id=u.id, curso_id=cid))
        elif u.role in ("respondente", "padrao"):
            db.add(RespondenteCurso(usuario_id=u.id, curso_id=cid))


@router.get("/", response_model=list[UsuarioOut])
def listar(db: Session = Depends(get_db), _=Depends(_adm)):
    return [_build_out(u) for u in db.query(Usuario).all()]


@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def criar(body: UsuarioCreate, db: Session = Depends(get_db), _=Depends(_adm)):
    if db.query(Usuario).filter(Usuario.email == body.email.lower()).first():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")
    u = Usuario(
        nome=body.nome,
        email=body.email.lower(),
        senha_hash=hash_senha(body.senha),
        role=body.role,
        sub_type=body.sub_type,
    )
    db.add(u)
    db.flush()
    _sync_cursos(db, u, body.curso_ids)
    db.commit()
    db.refresh(u)
    return _build_out(u)


@router.patch("/{user_id}", response_model=UsuarioOut)
def atualizar(user_id: str, body: UsuarioUpdate, db: Session = Depends(get_db), _=Depends(_adm)):
    u = db.get(Usuario, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if body.nome is not None:
        u.nome = body.nome
    if body.role is not None:
        u.role = body.role
    if body.sub_type is not None:
        u.sub_type = body.sub_type
    if body.ativo is not None:
        u.ativo = body.ativo
    if body.curso_ids is not None:
        _sync_cursos(db, u, body.curso_ids)
    db.commit()
    db.refresh(u)
    return _build_out(u)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(user_id: str, db: Session = Depends(get_db), _=Depends(_adm)):
    u = db.get(Usuario, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    db.delete(u)
    db.commit()
