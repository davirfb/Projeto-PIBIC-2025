-- =============================================================
-- 003_seed.sql — Dados de teste para o protótipo
-- Execute APÓS 001_schema.sql e 002_rls.sql
--
-- FLUXO PARA CRIAR USUÁRIOS DE TESTE:
--
-- Para cada usuário abaixo:
--   1. Acesse Authentication > Users no painel do Supabase
--   2. Clique em "Add user" → informe o e-mail e senha
--   3. Copie o UUID gerado
--   4. Execute os INSERTs correspondentes substituindo 'UUID-...'
--
-- Usuários de teste:
--   adm@ifb.edu.br           senha: Admin@123   → ADM do sistema
--   prof@ifb.edu.br          senha: Prof@123    → Professor, diretor da comissão TSI
--   coord@ifb.edu.br         senha: Coord@123   → Coordenador, membro da comissão TSI
--   tecnico@ifb.edu.br       senha: Tec@123     → Técnico-administrativo
--   aluno@ifb.edu.br         senha: Aluno@123   → Aluno do TSI
-- =============================================================

-- 1. Cursos
INSERT INTO cursos (nome, codigo) VALUES
  ('Tecnologia em Sistemas para Internet', 'TSI-BSB'),
  ('Administração', 'ADM-BSB');

-- ---------------------------------------------------------------
-- 2. Usuários — substitua os UUIDs pelos IDs reais do Supabase Auth
-- ---------------------------------------------------------------

-- ADM do sistema
-- INSERT INTO usuarios (id, email, nome, tipo, nivel_acesso) VALUES
--   ('UUID-ADM', 'adm@ifb.edu.br', 'Administrador IFB', 'outro', 'respondente');
-- INSERT INTO adm_sistema (usuario_id) VALUES ('UUID-ADM');

-- Professor (diretor da comissão TSI)
-- INSERT INTO usuarios (id, email, nome, tipo, nivel_acesso) VALUES
--   ('UUID-PROF', 'prof@ifb.edu.br', 'Prof. João Silva', 'professor', 'respondente');
-- INSERT INTO usuario_cursos (usuario_id, curso_id)
--   SELECT 'UUID-PROF', id FROM cursos WHERE codigo = 'TSI-BSB';

-- Coordenador (membro da comissão TSI)
-- INSERT INTO usuarios (id, email, nome, tipo, nivel_acesso) VALUES
--   ('UUID-COORD', 'coord@ifb.edu.br', 'Coord. Maria Santos', 'coordenador', 'respondente');
-- INSERT INTO usuario_cursos (usuario_id, curso_id)
--   SELECT 'UUID-COORD', id FROM cursos WHERE codigo = 'TSI-BSB';

-- Técnico-administrativo (respondente simples)
-- INSERT INTO usuarios (id, email, nome, tipo, nivel_acesso) VALUES
--   ('UUID-TEC', 'tecnico@ifb.edu.br', 'Carlos Oliveira', 'tecnico_administrativo', 'respondente');

-- Aluno do TSI (acesso padrão)
-- INSERT INTO usuarios (id, email, nome, tipo, nivel_acesso) VALUES
--   ('UUID-ALUNO', 'aluno@ifb.edu.br', 'Ana Costa', 'aluno', 'padrao');
-- INSERT INTO alunos (usuario_id, matricula) VALUES ('UUID-ALUNO', '2024001');
-- INSERT INTO usuario_cursos (usuario_id, curso_id)
--   SELECT 'UUID-ALUNO', id FROM cursos WHERE codigo = 'TSI-BSB';

-- ---------------------------------------------------------------
-- 3. Comissão — execute após criar prof e coord acima
-- ---------------------------------------------------------------

-- Criar comissão TSI com o professor como diretor
-- INSERT INTO comissoes (nome, curso_id, diretor_id)
--   SELECT 'Comissão de Avaliação TSI 2026', c.id, 'UUID-PROF'
--   FROM cursos c WHERE c.codigo = 'TSI-BSB';

-- Diretor é membro de sua própria comissão
-- INSERT INTO comissao_membros (comissao_id, usuario_id, convidado_por_id)
--   SELECT cm.id, 'UUID-PROF', 'UUID-PROF'
--   FROM comissoes cm JOIN cursos c ON c.id = cm.curso_id
--   WHERE c.codigo = 'TSI-BSB';

-- Coordenador convidado pelo professor
-- INSERT INTO comissao_membros (comissao_id, usuario_id, convidado_por_id)
--   SELECT cm.id, 'UUID-COORD', 'UUID-PROF'
--   FROM comissoes cm JOIN cursos c ON c.id = cm.curso_id
--   WHERE c.codigo = 'TSI-BSB';
