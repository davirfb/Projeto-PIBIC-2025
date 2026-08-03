"""
Cria o usuário ADM inicial e popula um curso de exemplo.
Rodar a partir da pasta backend/:
    python seed.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, Base, engine
from app.models import Usuario, Curso
from app.services.auth import hash_senha


def seed():
    print("Criando tabelas...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ADM inicial
        if not db.query(Usuario).filter(Usuario.email == "adm@ifb.edu.br").first():
            db.add(Usuario(
                nome="Administrador IFB",
                email="adm@ifb.edu.br",
                senha_hash=hash_senha("Admin@IFB2026"),
                role="adm",
                ativo=True,
            ))
            print("✅ ADM criado: adm@ifb.edu.br / Admin@IFB2026")
        else:
            print("ℹ️  ADM já existe — ignorado.")

        # Curso de exemplo
        if not db.query(Curso).filter(Curso.codigo == "TSI").first():
            db.add(Curso(nome="Tecnologia em Sistemas para Internet", codigo="TSI"))
            print("✅ Curso TSI criado.")
        else:
            print("ℹ️  Curso TSI já existe — ignorado.")

        db.commit()
        print("\n⚠️  Altere a senha do ADM após o primeiro login.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
