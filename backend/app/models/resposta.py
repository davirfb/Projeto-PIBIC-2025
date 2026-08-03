import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Resposta(Base):
    __tablename__ = "respostas"
    __table_args__ = (
        UniqueConstraint("respondente_id", "questionario_id", name="uq_respondente_questionario"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    questionario_id: Mapped[str] = mapped_column(ForeignKey("questionarios.id", ondelete="CASCADE"), nullable=False)
    # Armazenado sempre para deduplicação (RN02). Nunca exposto na API se questionário for anônimo (RN04).
    respondente_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    respondente_role: Mapped[str] = mapped_column(String, nullable=False)
    submetido_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    questionario: Mapped["Questionario"] = relationship(back_populates="respostas")  # type: ignore[name-defined]
    respondente: Mapped["Usuario"] = relationship(back_populates="respostas")  # type: ignore[name-defined]
    respostas_questao: Mapped[list["RespostaQuestao"]] = relationship(back_populates="resposta", cascade="all, delete-orphan")


class RespostaQuestao(Base):
    __tablename__ = "respostas_questoes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    resposta_id: Mapped[str] = mapped_column(ForeignKey("respostas.id", ondelete="CASCADE"), nullable=False)
    questao_id: Mapped[str] = mapped_column(ForeignKey("questoes.id"), nullable=False)
    opcao_id: Mapped[str | None] = mapped_column(ForeignKey("opcoes.id"), nullable=True)
    likert_valor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    texto: Mapped[str | None] = mapped_column(Text, nullable=True)

    resposta: Mapped["Resposta"] = relationship(back_populates="respostas_questao")
    questao: Mapped["Questao"] = relationship(back_populates="respostas_questao")  # type: ignore[name-defined]
    opcao: Mapped["Opcao"] = relationship(back_populates="respostas_questao")  # type: ignore[name-defined]
