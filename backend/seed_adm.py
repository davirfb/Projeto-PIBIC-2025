"""
Script de bootstrap — cria o usuário ADM inicial no banco.
Rodar apenas uma vez: python seed_adm.py
"""
import sys
from app.database import SessionLocal, Base, engine
from app.models.usuario import Usuario
from app.services.auth import hash_senha

Base.metadata.create_all(bind=engine)

EMAIL = "adm@ifb.edu.br"
NOME = "Administrador IFB"
SENHA = "admin123"

db = SessionLocal()
try:
    if db.query(Usuario).filter(Usuario.email == EMAIL).first():
        print(f"Usuário {EMAIL} já existe.")
        sys.exit(0)

    adm = Usuario(
        nome=NOME,
        email=EMAIL,
        senha_hash=hash_senha(SENHA),
        role="adm",
        sub_type=None,
        ativo=True,
    )
    db.add(adm)
    db.commit()
    db.refresh(adm)
    print(f"ADM criado com sucesso!")
    print(f"  Email: {EMAIL}")
    print(f"  Senha: {SENHA}")
    print(f"  ID:    {adm.id}")
finally:
    db.close()
