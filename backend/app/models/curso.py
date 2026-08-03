import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Curso(Base):
    __tablename__ = "cursos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    codigo: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    membros_comissao: Mapped[list["ComissaoCurso"]] = relationship(back_populates="curso", cascade="all, delete-orphan")  # type: ignore[name-defined]
    respondentes: Mapped[list["RespondenteCurso"]] = relationship(back_populates="curso", cascade="all, delete-orphan")  # type: ignore[name-defined]
    questionarios: Mapped[list["QuestionarioCurso"]] = relationship(back_populates="curso", cascade="all, delete-orphan")  # type: ignore[name-defined]
