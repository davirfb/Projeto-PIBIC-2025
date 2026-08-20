-- =============================================================
-- 000_drop_all.sql — Remove todo o schema anterior
-- Execute ANTES de 001_schema.sql
-- =============================================================

DROP TABLE IF EXISTS respostas_questoes   CASCADE;
DROP TABLE IF EXISTS respostas            CASCADE;
DROP TABLE IF EXISTS opcoes               CASCADE;
DROP TABLE IF EXISTS questoes             CASCADE;
DROP TABLE IF EXISTS questionario_cursos  CASCADE;
DROP TABLE IF EXISTS questionarios        CASCADE;
DROP TABLE IF EXISTS comissao_membros     CASCADE;
DROP TABLE IF EXISTS comissoes            CASCADE;
DROP TABLE IF EXISTS adm_sistema          CASCADE;
DROP TABLE IF EXISTS usuario_cursos       CASCADE;
DROP TABLE IF EXISTS alunos               CASCADE;
DROP TABLE IF EXISTS cursos               CASCADE;
DROP TABLE IF EXISTS usuarios             CASCADE;

-- Tabelas do schema antigo (caso ainda existam)
DROP TABLE IF EXISTS respondente_cursos   CASCADE;
DROP TABLE IF EXISTS comissao_cursos      CASCADE;
DROP TABLE IF EXISTS profiles             CASCADE;

-- Funções e triggers são removidos junto com as tabelas via CASCADE,
-- mas remova explicitamente se necessário:
DROP FUNCTION IF EXISTS update_atualizado_em() CASCADE;
DROP FUNCTION IF EXISTS is_adm()               CASCADE;
