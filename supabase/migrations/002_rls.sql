-- =============================================================
-- 002_rls.sql — Row Level Security
-- Versão 2.0 — Papéis derivados das relações, não armazenados
-- Execute APÓS 001_schema.sql
-- =============================================================

ALTER TABLE usuarios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_cursos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE adm_sistema      ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissoes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissao_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionario_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE opcoes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_questoes ENABLE ROW LEVEL SECURITY;

-- Funções auxiliares
CREATE OR REPLACE FUNCTION is_adm()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM adm_sistema WHERE usuario_id = auth.uid())
$$;

-- -------- usuarios --------
CREATE POLICY "usuarios_select_own"
  ON usuarios FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "usuarios_select_adm"
  ON usuarios FOR SELECT
  USING (is_adm());

CREATE POLICY "usuarios_insert_adm"
  ON usuarios FOR INSERT
  WITH CHECK (is_adm());

CREATE POLICY "usuarios_update_adm"
  ON usuarios FOR UPDATE
  USING (is_adm());

CREATE POLICY "usuarios_delete_adm"
  ON usuarios FOR DELETE
  USING (is_adm());

-- -------- cursos --------
CREATE POLICY "cursos_select_authenticated"
  ON cursos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "cursos_all_adm"
  ON cursos FOR ALL
  USING (is_adm());

-- -------- alunos --------
CREATE POLICY "alunos_select_own_or_adm"
  ON alunos FOR SELECT
  USING (usuario_id = auth.uid() OR is_adm());

CREATE POLICY "alunos_all_adm"
  ON alunos FOR ALL
  USING (is_adm());

-- -------- usuario_cursos --------
CREATE POLICY "usuario_cursos_select_own_or_adm"
  ON usuario_cursos FOR SELECT
  USING (usuario_id = auth.uid() OR is_adm());

CREATE POLICY "usuario_cursos_all_adm"
  ON usuario_cursos FOR ALL
  USING (is_adm());

-- -------- adm_sistema --------
CREATE POLICY "adm_sistema_select_own_or_adm"
  ON adm_sistema FOR SELECT
  USING (usuario_id = auth.uid() OR is_adm());

CREATE POLICY "adm_sistema_all_adm"
  ON adm_sistema FOR ALL
  USING (is_adm());

-- -------- comissoes --------
CREATE POLICY "comissoes_select_member_or_adm"
  ON comissoes FOR SELECT
  USING (
    is_adm()
    OR diretor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM comissao_membros cm
      WHERE cm.comissao_id = comissoes.id AND cm.usuario_id = auth.uid()
    )
  );

CREATE POLICY "comissoes_all_adm"
  ON comissoes FOR ALL
  USING (is_adm());

-- -------- comissao_membros --------
CREATE POLICY "membros_select_own_comissao_or_adm"
  ON comissao_membros FOR SELECT
  USING (
    is_adm()
    OR usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM comissoes c
      WHERE c.id = comissao_id AND c.diretor_id = auth.uid()
    )
  );

-- Diretor pode convidar e remover membros
CREATE POLICY "membros_insert_diretor_or_adm"
  ON comissao_membros FOR INSERT
  WITH CHECK (
    is_adm()
    OR EXISTS (
      SELECT 1 FROM comissoes c
      WHERE c.id = comissao_id AND c.diretor_id = auth.uid()
    )
  );

CREATE POLICY "membros_delete_diretor_or_adm"
  ON comissao_membros FOR DELETE
  USING (
    is_adm()
    OR EXISTS (
      SELECT 1 FROM comissoes c
      WHERE c.id = comissao_id AND c.diretor_id = auth.uid()
    )
  );

-- -------- questionarios --------
CREATE POLICY "questionarios_all_adm"
  ON questionarios FOR ALL
  USING (is_adm());

-- Membros veem e gerenciam questionários da sua comissão
CREATE POLICY "questionarios_select_comissao"
  ON questionarios FOR SELECT
  USING (
    comissao_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM comissao_membros cm
      WHERE cm.comissao_id = questionarios.comissao_id
        AND cm.usuario_id = auth.uid()
    )
  );

CREATE POLICY "questionarios_insert_comissao"
  ON questionarios FOR INSERT
  WITH CHECK (
    comissao_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM comissao_membros cm
      WHERE cm.comissao_id = comissao_id
        AND cm.usuario_id = auth.uid()
    )
  );

CREATE POLICY "questionarios_update_comissao"
  ON questionarios FOR UPDATE
  USING (
    comissao_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM comissao_membros cm
      WHERE cm.comissao_id = questionarios.comissao_id
        AND cm.usuario_id = auth.uid()
    )
  );

CREATE POLICY "questionarios_delete_comissao"
  ON questionarios FOR DELETE
  USING (
    comissao_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM comissao_membros cm
      WHERE cm.comissao_id = questionarios.comissao_id
        AND cm.usuario_id = auth.uid()
    )
  );

-- Respondentes veem apenas publicados e vigentes vinculados aos seus cursos
CREATE POLICY "questionarios_select_respondente"
  ON questionarios FOR SELECT
  USING (
    status = 'publicado'
    AND data_inicio <= CURRENT_DATE
    AND data_fim >= CURRENT_DATE
    AND EXISTS (
      SELECT 1 FROM questionario_cursos qc
      JOIN usuario_cursos uc ON uc.curso_id = qc.curso_id
      WHERE qc.questionario_id = questionarios.id
        AND uc.usuario_id = auth.uid()
    )
  );

-- -------- questionario_cursos --------
CREATE POLICY "qc_select_authenticated"
  ON questionario_cursos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "qc_all_comissao_adm"
  ON questionario_cursos FOR ALL
  USING (
    is_adm()
    OR EXISTS (
      SELECT 1 FROM comissao_membros cm
      JOIN questionarios q ON q.comissao_id = cm.comissao_id
      WHERE q.id = questionario_id AND cm.usuario_id = auth.uid()
    )
  );

-- -------- questoes --------
CREATE POLICY "questoes_select_authenticated"
  ON questoes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "questoes_all_comissao_adm"
  ON questoes FOR ALL
  USING (
    is_adm()
    OR EXISTS (
      SELECT 1 FROM comissao_membros cm
      JOIN questionarios q ON q.comissao_id = cm.comissao_id
      WHERE q.id = questionario_id AND cm.usuario_id = auth.uid()
    )
  );

-- -------- opcoes --------
CREATE POLICY "opcoes_select_authenticated"
  ON opcoes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "opcoes_all_comissao_adm"
  ON opcoes FOR ALL
  USING (
    is_adm()
    OR EXISTS (
      SELECT 1 FROM comissao_membros cm
      JOIN questionarios q ON q.comissao_id = cm.comissao_id
      JOIN questoes qe ON qe.questionario_id = q.id
      WHERE qe.id = questao_id AND cm.usuario_id = auth.uid()
    )
  );

-- -------- respostas --------
-- Qualquer usuário autenticado pode submeter sua própria resposta
CREATE POLICY "respostas_insert_authenticated"
  ON respostas FOR INSERT
  WITH CHECK (respondente_id = auth.uid());

-- Usuário vê apenas suas próprias (para histórico)
CREATE POLICY "respostas_select_own"
  ON respostas FOR SELECT
  USING (respondente_id = auth.uid());

-- Comissão/ADM veem respostas dos seus questionários
CREATE POLICY "respostas_select_comissao_adm"
  ON respostas FOR SELECT
  USING (
    is_adm()
    OR EXISTS (
      SELECT 1 FROM comissao_membros cm
      JOIN questionarios q ON q.comissao_id = cm.comissao_id
      WHERE q.id = questionario_id AND cm.usuario_id = auth.uid()
    )
  );

-- -------- respostas_questoes --------
CREATE POLICY "rq_insert_respondente"
  ON respostas_questoes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM respostas r
      WHERE r.id = resposta_id AND r.respondente_id = auth.uid()
    )
  );

CREATE POLICY "rq_select_own"
  ON respostas_questoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM respostas r
      WHERE r.id = resposta_id AND r.respondente_id = auth.uid()
    )
  );

CREATE POLICY "rq_select_comissao_adm"
  ON respostas_questoes FOR SELECT
  USING (
    is_adm()
    OR EXISTS (
      SELECT 1 FROM respostas r
      JOIN questionarios q ON q.id = r.questionario_id
      JOIN comissao_membros cm ON cm.comissao_id = q.comissao_id
      WHERE r.id = resposta_id AND cm.usuario_id = auth.uid()
    )
  );
