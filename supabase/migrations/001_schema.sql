-- =============================================================
-- 001_schema.sql — Schema do sistema de avaliação IFB v2.0
-- Execute no Supabase SQL Editor (Project → SQL Editor)
-- =============================================================

-- ---------------------------------------------------------------
-- CAMADA 1: Identidade e perfis
-- ---------------------------------------------------------------

-- profiles: substitui usuarios + adm_sistema
-- role determina o acesso ao sistema (adm / comissao / respondente / padrao)
-- sub_type é o vínculo institucional (aluno / professor / etc.)
CREATE TABLE profiles (
  id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email     TEXT NOT NULL UNIQUE,
  nome      TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'padrao'
              CHECK (role IN ('adm', 'comissao', 'respondente', 'padrao')),
  sub_type  TEXT
              CHECK (sub_type IN ('aluno', 'professor', 'coordenador', 'tecnico_administrativo', 'outro')),
  ativo     BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- cursos
CREATE TABLE cursos (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome      TEXT NOT NULL,
  codigo    TEXT NOT NULL UNIQUE,
  ativo     BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vínculo usuário de comissão ↔ cursos que gerencia
CREATE TABLE comissao_cursos (
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  curso_id   UUID REFERENCES cursos(id)   ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, curso_id)
);

-- vínculo respondente/padrão ↔ cursos aos quais está vinculado
CREATE TABLE respondente_cursos (
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  curso_id   UUID REFERENCES cursos(id)   ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, curso_id)
);

-- ---------------------------------------------------------------
-- CAMADA 2: Questionários e respostas
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
  criado_por_id UUID REFERENCES profiles(id),
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
  tipo            TEXT NOT NULL
                    CHECK (tipo IN ('multipla_escolha', 'likert', 'dissertativa')),
  obrigatoria     BOOLEAN NOT NULL DEFAULT true,
  likert_escala   TEXT
                    CHECK (likert_escala IN ('satisfacao', 'concordancia', 'frequencia', 'qualidade')),
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
  respondente_id   UUID REFERENCES profiles(id),
  respondente_role TEXT NOT NULL
                     CHECK (respondente_role IN ('adm', 'comissao', 'respondente', 'padrao')),
  submetido_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (respondente_id, questionario_id)
);

CREATE TABLE respostas_questoes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resposta_id  UUID REFERENCES respostas(id)  ON DELETE CASCADE NOT NULL,
  questao_id   UUID REFERENCES questoes(id)   NOT NULL,
  opcao_id     UUID REFERENCES opcoes(id),
  likert_valor INTEGER,
  texto        TEXT
);

-- Atualiza atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_questionarios_atualizado_em
BEFORE UPDATE ON questionarios
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();
