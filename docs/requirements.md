# Sistema Web para Avaliação Periódica de Curso de Graduação no IFB – Campus Brasília

**Versão:** 4.0  
**Instituição:** Instituto Federal de Brasília – Pró-Reitoria de Pesquisa e Inovação (PRPI)  
**Bolsista:** Davi Rocha Fortes Bezerra  
**Orientador:** Prof. Dr. Dauster Souza Pereira  
**Período:** Setembro/2025 – Agosto/2026  
**Data:** Agosto de 2026  

---

## 1. Introdução

O sistema visa digitalizar o processo avaliativo do Curso de Tecnologia em Sistemas para Internet (TSI) do IFB Campus Brasília, em conformidade com o SINAES (Lei nº 10.861/2004) e a LGPD (Lei nº 13.709/2018). O modelo de requisitos foi validado junto à Comissão Própria de Avaliação (CPA) do IFB em reunião presencial de 25 de março de 2026, evoluindo da versão inicial até a v4.0 por meio de acompanhamento contínuo com o representante da CPA.

---

## 2. Escopo do Sistema

### Funcionalidades incluídas
- Autenticação e controle de acesso por perfil
- Administração de usuários, cursos e configurações
- Criação, personalização e acompanhamento de questionários
- Análise de resultados e geração de relatórios e gráficos dinâmicos
- Acesso completo ao painel (Respondente)
- Acesso minimalista: login, logout e resposta (Padrão)
- Geração e exportação de relatório CPA compatível com e-MEC/INEP
- Registro de auditoria de submissões ao INEP

### Fora do escopo
Avaliação de aprendizagem, gestão de matrículas e integração automatizada em tempo real com o e-MEC neste ciclo.

---

## 3. Perfis de Usuário

| Perfil | Descrição |
|---|---|
| **ADM** | Configuração e manutenção geral; gerência irrestrita |
| **Comissão** | Criação e análise de questionários; acompanhamento de participação; geração de relatórios CPA |
| **Respondente** | Painel completo, histórico, notificações; participa das avaliações |
| **Padrão** | Login, logout e resposta apenas; sem painel nem notificações |

### Comparativo Padrão vs. Respondente

| Funcionalidade | Padrão | Respondente |
|---|---|---|
| Login/Logout | Sim | Sim |
| Responder questionários | Sim | Sim |
| Painel de questionários | Não | Sim |
| Histórico | Não | Sim |
| Notificações | Não | Sim |
| Recuperação de senha | Sim | Sim |

### Sub-tipos de Usuário

- **Aluno:** Discente matriculado
- **Professor/Docente:** Docente vinculado ao campus
- **Coordenador de Curso:** Com função de coordenação
- **Técnico-Administrativo:** Servidor técnico-administrativo em educação
- **Outro:** Conforme necessidade institucional

---

## 4. Requisitos Funcionais

### 4.1 Perfil ADM

| ID | Descrição | Prioridade | Status |
|---|---|---|---|
| RF01 | Cadastrar, editar, desativar e excluir usuários | Alta | ✅ Concluído (Etapa 6) |
| RF02 | Atribuir perfis e sub-tipos | Alta | ✅ Concluído (Etapa 6) |
| RF03 | Cadastrar cursos, turmas e disciplinas | Alta | ✅ Concluído (Etapa 6) |
| RF04 | Configurar parâmetros gerais da plataforma | Média | ✅ Concluído (Etapa 6) |
| RF05 | Exibir painel de monitoramento com indicadores | Média | ✅ Concluído (Etapa 6) |
| RF06 | Visualizar logs de atividades e auditoria | Média | ✅ Concluído (Etapa 6) |

### 4.2 Perfil Comissão

| ID | Descrição | Prioridade | Status |
|---|---|---|---|
| RF07 | Criar questionários com título e período de vigência | Alta | ✅ Concluído |
| RF08 | Adicionar questões (múltipla escolha, Likert, dissertativa) | Alta | ✅ Concluído |
| RF09 | Vincular questionários a cursos/turmas/grupos | Alta | ✅ Concluído |
| RF10 | Salvar em rascunho; publicados não editáveis | Alta | ✅ Concluído |
| RF11 | Encerrar antecipadamente questionário | Média | ✅ Concluído |
| RF12 | Arquivar questionários encerrados | Média | ✅ Concluído |
| RF13 | Painel com taxa de participação por curso, turma e sub-tipo | Alta | ✅ Concluído |
| RF14 | Gerar relatórios automáticos após encerramento | Alta | ✅ Concluído |
| RF15 | Exibir gráficos e indicadores dinâmicos por questão, curso e sub-tipo | Alta | ✅ Concluído |
| RF16 | Filtrar relatórios por período, curso, turma e sub-tipo | Média | ✅ Concluído |
| RF17 | Exportar relatórios em PDF e CSV | Média | ✅ Concluído |
| RF18 | Notificar sobre taxa de participação abaixo de limiar | Baixa | Pendente |

### 4.3 Perfil Respondente

| ID | Descrição | Prioridade | Status |
|---|---|---|---|
| RF19 | Painel com questionários disponíveis | Alta | ✅ Concluído |
| RF20 | Garantir anonimato quando configurado | Alta | ✅ Concluído |
| RF21 | Impedir duplicação de resposta no ciclo | Alta | ✅ Concluído |
| RF22 | Histórico de respondidos e pendentes | Média | ✅ Concluído |
| RF23 | Notificar sobre novos questionários e prazos | Média | Pendente |

### 4.4 Perfil Padrão

| ID | Descrição | Prioridade | Status |
|---|---|---|---|
| RF24 | Login com credenciais | Alta | ✅ Concluído |
| RF25 | Logout do sistema | Alta | ✅ Concluído |
| RF26 | Responder questionários atribuídos | Alta | ✅ Concluído |
| RF27 | Bloquear acesso a funcionalidades além de login/logout/resposta | Alta | ✅ Concluído |

### 4.5 Todos os Perfis – Autenticação

| ID | Descrição | Prioridade | Status |
|---|---|---|---|
| RF28 | Autenticar por login e senha | Alta | ✅ Concluído |
| RF29 | Controlar acesso por perfil | Alta | ✅ Concluído |
| RF30 | Recuperação de senha via e-mail | Média | Pendente (Backend) |

### 4.6 Integração e Submissão ao INEP/e-MEC

| ID | Descrição | Perfil | Prioridade | Status |
|---|---|---|---|---|
| RF_INEP_01 | Gerar relatório CPA compatível com a estrutura do e-MEC, contemplando as dimensões exigidas pelo INEP | Comissão / ADM | Alta | ✅ Concluído |
| RF_INEP_02 | Exportar relatórios CPA em formato XML reconhecido pelo INEP | Comissão / ADM | Alta | ✅ Concluído |
| RF_INEP_03 | Manter registro de auditoria das submissões ao e-MEC (data, hora, usuário, status, histórico de versões) | ADM | Alta | ✅ Concluído |

---

## 5. Requisitos Não Funcionais

| ID | Descrição | Categoria | Prioridade |
|---|---|---|---|
| RNF01 | 99% disponibilidade durante vigência | Disponibilidade | Alta |
| RNF02 | Suportar 500 usuários simultâneos | Desempenho | Alta |
| RNF03 | Carregamento ≤ 3 segundos | Desempenho | Alta |
| RNF04 | HTTPS exclusivamente | Segurança | Alta |
| RNF05 | Hash seguro para senhas (bcrypt) | Segurança | Alta |
| RNF06 | Conformidade LGPD | Legal | Alta |
| RNF07 | Respostas anônimas sem rastreamento | Privacidade | Alta |
| RNF08 | Responsiva (desktop, tablet, smartphone) | Usabilidade | Alta |
| RNF09 | Interface intuitiva, curva mínima | Usabilidade | Alta |
| RNF10 | Compatível com Chrome, Firefox, Edge, Safari | Compatibilidade | Média |
| RNF11 | Backups automáticos periódicos | Confiabilidade | Alta |
| RNF12 | Boas práticas e documentação técnica | Manutenibilidade | Média |
| RNF13 | Arquitetura expansível para outros campi | Escalabilidade | Média |
| RNF14 | Módulo de exportação para o e-MEC deve aderir ao leiaute XML definido pelo INEP | Conformidade | Alta |

---

## 6. Regras de Negócio

| ID | Regra |
|---|---|
| RN01 | Resposta apenas dentro do período de vigência |
| RN02 | Uma resposta por usuário por ciclo avaliativo |
| RN03 | Questionários publicados não editáveis; apenas rascunhos |
| RN04 | Anônimos sem identificação armazenada ou exibida (inclusive para ADM e Comissão) |
| RN05 | Apenas ADM cria e altera usuários e perfis |
| RN06 | Comissão vincula apenas a cursos/turmas cadastrados |
| RN07 | Relatórios disponíveis após encerramento |
| RN08 | Sub-tipo definido e alterado somente pelo ADM |
| RN09 | Padrão restrito a login, logout e resposta |
| RN10 | Questionários contemplam dimensões SINAES |
| RN11 | Relatório CPA gerado para o e-MEC deve cobrir todas as dimensões exigidas pelo INEP; relatórios incompletos não podem ser exportados |
| RN12 | Cada submissão ao e-MEC deve ser registrada com data, hora, usuário responsável e status; o histórico não pode ser excluído |
| RN13 | Exportação XML para o INEP só pode ser realizada por ADM ou Comissão, após validação de completude |

---

## 7. Casos de Uso Principais

### UC01 – Responder Questionário (Respondente)
- **Ator:** Respondente
- **Pré-condição:** Autenticado; questionário publicado e vigente; sem resposta anterior neste ciclo
- **Fluxo:** Acessa painel → seleciona questionário → responde → confirma envio → confirmação
- **Requisitos:** RF19, RF20, RF21, RF22, RF23, RF28, RN01, RN02, RN04

### UC02 – Responder Questionário (Padrão)
- **Ator:** Usuário Padrão
- **Pré-condição:** Autenticado; questionário publicado e vigente; sem resposta anterior
- **Fluxo:** Login → acessa questionário → responde → confirma → logout
- **Requisitos:** RF24, RF25, RF26, RF27, RF28, RN01, RN02, RN04, RN09

### UC03 – Criar e Publicar Questionário (Comissão)
- **Ator:** Comissão
- **Pré-condição:** Autenticado; cursos e turmas cadastrados
- **Fluxo:** Acessa módulo → cria questionário → adiciona questões → configura anonimato → vincula cursos → salva/publica
- **Requisitos:** RF07, RF08, RF09, RF10, RN03, RN06, RN10

### UC04 – Analisar Resultados (Comissão)
- **Ator:** Comissão
- **Pré-condição:** Questionário encerrado; autenticado
- **Fluxo:** Acessa relatórios → seleciona questionário → aplica filtros → visualiza gráficos → exporta
- **Requisitos:** RF14, RF15, RF16, RF17, RN07

### UC05 – Gerenciar Usuários (ADM)
- **Ator:** ADM
- **Pré-condição:** Autenticado
- **Fluxo:** Acessa gestão → cadastra usuário (nome, e-mail, perfil, sub-tipo) → salva
- **Alternativa:** Edita ou desativa usuário existente
- **Requisitos:** RF01, RF02, RF29, RN05, RN08

### UC06 – Gerar e Submeter Relatório CPA ao e-MEC (Comissão / ADM)
- **Atores:** Comissão (geração e validação) / ADM (exportação e auditoria)
- **Pré-condição:** Ciclo avaliativo encerrado; relatório com dimensões INEP preenchidas; autenticado como Comissão ou ADM
- **Fluxo:** Comissão acessa módulo CPA → seleciona ciclo → sistema valida completude → gera XML e-MEC → ADM registra submissão no log de auditoria
- **Fluxo alternativo:** Se houver dimensões incompletas, sistema bloqueia exportação e exibe relatório de inconsistências
- **Requisitos:** RF_INEP_01, RF_INEP_02, RF_INEP_03, RN11, RN12, RN13, RNF14

---

## 8. Restrições e Premissas Técnicas

### 8.1 Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + shadcn/ui |
| Backend | Python/FastAPI + SQLAlchemy 2 + PostgreSQL + JWT (python-jose) + bcrypt |
| Deploy | Render (backend + banco PostgreSQL) |

### 8.2 Premissas
- Usuários com internet e navegador web atualizado
- Infraestrutura fornecida pelo IFB ou em nuvem (Render)
- Integração automatizada em tempo real com o e-MEC não está prevista neste ciclo; a submissão será manual via exportação XML
- O leiaute XML definitivo do e-MEC deve ser obtido junto ao INEP para refinamento do módulo RF_INEP_02
- Implantação inicial no Campus Brasília; expansão futura viável

---

## 9. Histórico de Versões

| Versão | Data | Alterações | Autor |
|---|---|---|---|
| 1.0 | 21/03/2026 | Versão inicial com perfis: Aluno, Professor, Coordenador, Gestor | Davi Rocha F. Bezerra |
| 2.0 | 24/03/2026 | Reestruturação para ADM, Comissão, Respondente (com sub-tipos) — após reunião com CPA | Davi Rocha F. Bezerra |
| 3.0 | 24/03/2026 | Inclusão perfil Padrão; tabela comparativa; UC02; realinhamento RFs/RNs | Davi Rocha F. Bezerra |
| 3.1 | 24/03/2026 | Seção 4.6 INEP/e-MEC (RF_INEP_01–03); RN11–13; RNF14; UC06 | Davi Rocha F. Bezerra |
| 4.0 | 08/2026 | Atualização de status de todos os RFs implementados; stack técnica documentada; RF09 concluído | Davi Rocha F. Bezerra |

---

## 10. Referências

- BRASIL. Lei nº 10.861/2004 – Sistema Nacional de Avaliação da Educação Superior (SINAES)
- BRASIL. Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (LGPD)
- INEP. Sistema e-MEC. Disponível em: https://emec.mec.gov.br
- KITCHENHAM, B. Guidelines for Performing Systematic Literature Reviews (2007)
- OKOLI, C. A guide to conducting a standalone systematic literature review (2015)
- RISTOFF & GIOLO. O Sinaes como sistema (2006)
- SOMMERVILLE, I. Engenharia de Software (10ª ed., 2019)

---

*Programa PIBIC CNPq 2025–2026 | IFB Campus Brasília | Brasília, 2026*
