import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    senha_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)  # adm|comissao|respondente|padrao
    sub_type: Mapped[str | None] = mapped_column(String, nullable=True)  # aluno|professor|...
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    cursos_comissao: Mapped[list["ComissaoCurso"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    cursos_respondente: Mapped[list["RespondenteCurso"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    questionarios_criados: Mapped[list["Questionario"]] = relationship(back_populates="criado_por")  # type: ignore[name-defined]
    respostas: Mapped[list["Resposta"]] = relationship(back_populates="respondente")  # type: ignore[name-defined]


class ComissaoCurso(Base):
    __tablename__ = "comissao_cursos"

    usuario_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    curso_id: Mapped[str] = mapped_column(ForeignKey("cursos.id", ondelete="CASCADE"), primary_key=True)

    usuario: Mapped["Usuario"] = relationship(back_populates="cursos_comissao")
    curso: Mapped["Curso"] = relationship(back_populates="membros_comissao")  # type: ignore[name-defined]


class RespondenteCurso(Base):
    __tablename__ = "respondente_cursos"

    usuario_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    curso_id: Mapped[str] = mapped_column(ForeignKey("cursos.id", ondelete="CASCADE"), primary_key=True)

    usuario: Mapped["Usuario"] = relationship(back_populates="cursos_respondente")
    curso: Mapped["Curso"] = relationship(back_populates="respondentes")  # type: ignore[name-defined]
