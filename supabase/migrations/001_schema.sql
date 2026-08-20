-- =============================================================
-- 001_schema.sql — Schema do sistema de avaliação IFB
-- Versão 2.0 — Identidade institucional separada dos papéis do sistema
-- =============================================================

-- ---------------------------------------------------------------
-- CAMADA 1: Identidade institucional (simula banco de dados do IFB)
-- ---------------------------------------------------------------

-- Usuários — espelha o banco institucional do IFB
CREATE TABLE usuarios (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  nome         TEXT NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('aluno', 'professor', 'coordenador', 'tecnico_administrativo', 'outro')),
  nivel_acesso TEXT NOT NULL DEFAULT 'padrao' CHECK (nivel_acesso IN ('padrao', 'respondente')),
  ativo        BOOLEAN NOT NULL DEFAULT true,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cursos
CREATE TABLE cursos (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome      TEXT NOT NULL,
  codigo    TEXT NOT NULL UNIQUE,
  ativo     BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extensão para alunos: matrícula
CREATE TABLE alunos (
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE PRIMARY KEY,
  matricula  TEXT NOT NULL UNIQUE
);

-- Vínculo usuário ↔ cursos (todos os tipos)
-- Aluno: geralmente 1 curso; professor/coordenador: N cursos
CREATE TABLE usuario_cursos (
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id   UUID REFERENCES cursos(id)   ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, curso_id)
);

-- ---------------------------------------------------------------
-- CAMADA 2: Papéis do sistema (gerenciados pelo ADM)
-- ---------------------------------------------------------------

-- Administradores deste sistema de avaliação
CREATE TABLE adm_sistema (
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE PRIMARY KEY,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grupos de comissão por curso
CREATE TABLE comissoes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       TEXT NOT NULL,
  curso_id   UUID REFERENCES cursos(id) NOT NULL,
  diretor_id UUID REFERENCES usuarios(id) NOT NULL,
  ativo      BOOLEAN NOT NULL DEFAULT true,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Membros de comissão (diretor conclui + é membro; só ADM troca o diretor)
CREATE TABLE comissao_membros (
  comissao_id      UUID REFERENCES comissoes(id) ON DELETE CASCADE,
  usuario_id       UUID REFERENCES usuarios(id)  ON DELETE CASCADE,
  convidado_por_id UUID REFERENCES usuarios(id),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (comissao_id, usuario_id)
);

-- ---------------------------------------------------------------
-- CAMADA 3: Questionários e respostas
-- ---------------------------------------------------------------

CREATE TABLE questionarios (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        TEXT NOT NULL,
  descricao     TEXT NOT NULL DEFAULT '',
  data_inicio   DATE NOT NULL,
  data_fim      DATE NOT NULL,
  anonimo       BOOLEAN NOT NULL DEFAULT false,
  status        TEXT NOT NULL DEFAULT 'rascunho'
                  CHECK (status IN ('rascunho', 'publicado', 'encerrado', 'arquivado')),
  criado_por_id UUID REFERENCES usuarios(id) NOT NULL,
  comissao_id   UUID REFERENCES comissoes(id),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE questionario_cursos (
  questionario_id UUID REFERENCES questionarios(id) ON DELETE CASCADE,
  curso_id        UUID REFERENCES cursos(id)         ON DELETE CASCADE,
  PRIMARY KEY (questionario_id, curso_id)
);

CREATE TABLE questoes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  questionario_id UUID REFERENCES questionarios(id) ON DELETE CASCADE NOT NULL,
  enunciado       TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('multipla_escolha', 'likert', 'dissertativa')),
  obrigatoria     BOOLEAN NOT NULL DEFAULT true,
  likert_escala   TEXT CHECK (likert_escala IN ('satisfacao', 'concordancia', 'frequencia', 'qualidade')),
  ordem           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE opcoes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE NOT NULL,
  texto      TEXT NOT NULL,
  ordem      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE respostas (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  questionario_id  UUID REFERENCES questionarios(id) ON DELETE CASCADE NOT NULL,
  respondente_id   UUID REFERENCES usuarios(id) NOT NULL,
  respondente_tipo TEXT NOT NULL CHECK (respondente_tipo IN ('aluno', 'professor', 'coordenador', 'tecnico_administrativo', 'outro')),
  submetido_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (respondente_id, questionario_id)
);

CREATE TABLE respostas_questoes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resposta_id  UUID REFERENCES respostas(id) ON DELETE CASCADE NOT NULL,
  questao_id   UUID REFERENCES questoes(id) NOT NULL,
  opcao_id     UUID REFERENCES opcoes(id),
  likert_valor INTEGER,
  texto        TEXT
);

CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_questionarios_atualizado_em
BEFORE UPDATE ON questionarios
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();
