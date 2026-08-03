import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SubmissaoINEP(Base):
    """RF_INEP_03 — registro de auditoria de submissões ao e-MEC."""

    __tablename__ = "submissoes_inep"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    questionario_id: Mapped[str] = mapped_column(
        ForeignKey("questionarios.id", ondelete="SET NULL"), nullable=True
    )
    usuario_id: Mapped[str] = mapped_column(
        ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True
    )
    # pendente | enviado | confirmado | rejeitado
    status: Mapped[str] = mapped_column(String, nullable=False, default="enviado")
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    registrado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    questionario: Mapped["Questionario"] = relationship()  # type: ignore[name-defined]
    usuario: Mapped["Usuario"] = relationship()  # type: ignore[name-defined]
