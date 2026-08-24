-- =============================================================
-- 002_rls.sql — Row Level Security
-- Compatível com o schema de 001_schema.sql (profiles, comissao_cursos, respondente_cursos)
-- Execute APÓS 001_schema.sql
-- =============================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissao_cursos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE respondente_cursos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionario_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE opcoes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_questoes  ENABLE ROW LEVEL SECURITY;

-- -------- Helpers --------
CREATE OR REPLACE FUNCTION is_adm()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'adm' AND ativo = true
  )
$$;

CREATE OR REPLACE FUNCTION is_comissao()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'comissao' AND ativo = true
  )
$$;

-- -------- profiles --------
-- Cada usuário lê o próprio perfil; ADM lê todos
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_select_adm"
  ON profiles FOR SELECT USING (is_adm());

-- Auto-cadastro: usuário pode inserir seu próprio perfil (RegisterPage)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Apenas ADM pode atualizar/deletar perfis (Edge Functions rodam com service_role)
CREATE POLICY "profiles_update_adm"
  ON profiles FOR UPDATE USING (is_adm());

CREATE POLICY "profiles_delete_adm"
  ON profiles FOR DELETE USING (is_adm());

-- -------- cursos --------
CREATE POLICY "cursos_select_authenticated"
  ON cursos FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "cursos_insert_adm"
  ON cursos FOR INSERT WITH CHECK (is_adm());

CREATE POLICY "cursos_update_adm"
  ON cursos FOR UPDATE USING (is_adm());

CREATE POLICY "cursos_delete_adm"
  ON cursos FOR DELETE USING (is_adm());

-- -------- comissao_cursos --------
CREATE POLICY "comissao_cursos_select_adm_or_member"
  ON comissao_cursos FOR SELECT
  USING (is_adm() OR usuario_id = auth.uid());

CREATE POLICY "comissao_cursos_all_adm"
  ON comissao_cursos FOR ALL USING (is_adm());

-- -------- respondente_cursos --------
CREATE POLICY "respondente_cursos_select_adm_or_own"
  ON respondente_cursos FOR SELECT
  USING (is_adm() OR usuario_id = auth.uid());

CREATE POLICY "respondente_cursos_all_adm"
  ON respondente_cursos FOR ALL USING (is_adm());

-- -------- questionarios --------
-- ADM e Comissão veem todos
CREATE POLICY "questionarios_select_adm_comissao"
  ON questionarios FOR SELECT
  USING (is_adm() OR is_comissao());

-- Respondentes/Padrão veem apenas publicados e vigentes vinculados aos seus cursos
CREATE POLICY "questionarios_select_respondente"
  ON questionarios FOR SELECT
  USING (
    status = 'publicado'
    AND data_inicio <= CURRENT_DATE
    AND data_fim >= CURRENT_DATE
    AND EXISTS (
      SELECT 1 FROM questionario_cursos qc
      JOIN respondente_cursos rc ON rc.curso_id = qc.curso_id
      WHERE qc.questionario_id = questionarios.id
        AND rc.usuario_id = auth.uid()
    )
  );

CREATE POLICY "questionarios_insert_adm_comissao"
  ON questionarios FOR INSERT WITH CHECK (is_adm() OR is_comissao());

CREATE POLICY "questionarios_update_adm_comissao"
  ON questionarios FOR UPDATE USING (is_adm() OR is_comissao());

CREATE POLICY "questionarios_delete_adm_comissao"
  ON questionarios FOR DELETE USING (is_adm() OR is_comissao());

-- -------- questionario_cursos --------
CREATE POLICY "qc_select_authenticated"
  ON questionario_cursos FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "qc_all_adm_comissao"
  ON questionario_cursos FOR ALL USING (is_adm() OR is_comissao());

-- -------- questoes --------
CREATE POLICY "questoes_select_authenticated"
  ON questoes FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "questoes_all_adm_comissao"
  ON questoes FOR ALL USING (is_adm() OR is_comissao());

-- -------- opcoes --------
CREATE POLICY "opcoes_select_authenticated"
  ON opcoes FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "opcoes_all_adm_comissao"
  ON opcoes FOR ALL USING (is_adm() OR is_comissao());

-- -------- respostas --------
-- Qualquer autenticado pode submeter a própria resposta
CREATE POLICY "respostas_insert_authenticated"
  ON respostas FOR INSERT WITH CHECK (respondente_id = auth.uid());

-- Usuário vê apenas suas próprias (histórico)
CREATE POLICY "respostas_select_own"
  ON respostas FOR SELECT USING (respondente_id = auth.uid());

-- ADM e Comissão veem todas as respostas
CREATE POLICY "respostas_select_adm_comissao"
  ON respostas FOR SELECT USING (is_adm() OR is_comissao());

-- -------- respostas_questoes --------
CREATE POLICY "rq_insert_own"
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

CREATE POLICY "rq_select_adm_comissao"
  ON respostas_questoes FOR SELECT USING (is_adm() OR is_comissao());
