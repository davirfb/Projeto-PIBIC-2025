from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Curso
from app.schemas.curso import CursoCreate, CursoOut, CursoUpdate
from app.dependencies import require_role

router = APIRouter(prefix="/cursos", tags=["cursos"])
_adm = require_role("adm")


@router.get("/", response_model=list[CursoOut])
def listar(db: Session = Depends(get_db), _=Depends(require_role("adm", "comissao", "respondente", "padrao"))):
    return db.query(Curso).all()


@router.post("/", response_model=CursoOut, status_code=status.HTTP_201_CREATED)
def criar(body: CursoCreate, db: Session = Depends(get_db), _=Depends(_adm)):
    if db.query(Curso).filter(Curso.codigo == body.codigo.upper()).first():
        raise HTTPException(status_code=409, detail="Código de curso já existe")
    c = Curso(nome=body.nome, codigo=body.codigo.upper())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.patch("/{curso_id}", response_model=CursoOut)
def atualizar(curso_id: str, body: CursoUpdate, db: Session = Depends(get_db), _=Depends(_adm)):
    c = db.get(Curso, curso_id)
    if not c:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    if body.nome is not None:
        c.nome = body.nome
    if body.ativo is not None:
        c.ativo = body.ativo
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(curso_id: str, db: Session = Depends(get_db), _=Depends(_adm)):
    c = db.get(Curso, curso_id)
    if not c:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    db.delete(c)
    db.commit()
