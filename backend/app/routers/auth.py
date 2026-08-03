from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario
from app.schemas.usuario import TokenOut, UsuarioOut
from app.services.auth import criar_token, verificar_senha
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _usuario_out(u: Usuario) -> UsuarioOut:
    curso_ids = [c.curso_id for c in u.cursos_comissao] + [c.curso_id for c in u.cursos_respondente]
    return UsuarioOut(
        id=u.id,
        nome=u.nome,
        email=u.email,
        role=u.role,
        sub_type=u.sub_type,
        ativo=u.ativo,
        criado_em=u.criado_em,
        curso_ids=list(set(curso_ids)),
    )


@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == form.username.lower()).first()
    if not user or not verificar_senha(form.password, user.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    if not user.ativo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta desativada")
    return TokenOut(access_token=criar_token(user.id), user=_usuario_out(user))


@router.get("/me", response_model=UsuarioOut)
def me(current_user: Usuario = Depends(get_current_user)):
    return _usuario_out(current_user)
