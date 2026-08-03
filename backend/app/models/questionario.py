import uuid
from datetime import date, datetime, timezone
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Questionario(Base):
    __tablename__ = "questionarios"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    titulo: Mapped[str] = mapped_column(String, nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False, default="")
    data_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    data_fim: Mapped[date] = mapped_column(Date, nullable=False)
    anonimo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="rascunho")
    criado_por_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    criado_por: Mapped["Usuario"] = relationship(back_populates="questionarios_criados")  # type: ignore[name-defined]
    cursos: Mapped[list["QuestionarioCurso"]] = relationship(back_populates="questionario", cascade="all, delete-orphan")
    questoes: Mapped[list["Questao"]] = relationship(back_populates="questionario", cascade="all, delete-orphan", order_by="Questao.ordem")
    respostas: Mapped[list["Resposta"]] = relationship(back_populates="questionario", cascade="all, delete-orphan")  # type: ignore[name-defined]


class QuestionarioCurso(Base):
    __tablename__ = "questionario_cursos"

    questionario_id: Mapped[str] = mapped_column(ForeignKey("questionarios.id", ondelete="CASCADE"), primary_key=True)
    curso_id: Mapped[str] = mapped_column(ForeignKey("cursos.id", ondelete="CASCADE"), primary_key=True)

    questionario: Mapped["Questionario"] = relationship(back_populates="cursos")
    curso: Mapped["Curso"] = relationship(back_populates="questionarios")  # type: ignore[name-defined]


class Questao(Base):
    __tablename__ = "questoes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    questionario_id: Mapped[str] = mapped_column(ForeignKey("questionarios.id", ondelete="CASCADE"), nullable=False)
    enunciado: Mapped[str] = mapped_column(Text, nullable=False)
    tipo: Mapped[str] = mapped_column(String, nullable=False)  # multipla_escolha|likert|dissertativa
    obrigatoria: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    likert_escala: Mapped[str | None] = mapped_column(String, nullable=True)  # satisfacao|concordancia|frequencia|qualidade
    ordem: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    questionario: Mapped["Questionario"] = relationship(back_populates="questoes")
    opcoes: Mapped[list["Opcao"]] = relationship(back_populates="questao", cascade="all, delete-orphan", order_by="Opcao.ordem")
    respostas_questao: Mapped[list["RespostaQuestao"]] = relationship(back_populates="questao", cascade="all, delete-orphan")  # type: ignore[name-defined]


class Opcao(Base):
    __tablename__ = "opcoes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    questao_id: Mapped[str] = mapped_column(ForeignKey("questoes.id", ondelete="CASCADE"), nullable=False)
    texto: Mapped[str] = mapped_column(String, nullable=False)
    ordem: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    questao: Mapped["Questao"] = relationship(back_populates="opcoes")
    respostas_questao: Mapped[list["RespostaQuestao"]] = relationship(back_populates="opcao")  # type: ignore[name-defined]
