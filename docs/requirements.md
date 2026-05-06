# Sistema Web para Avaliação Periódica de Curso de Graduação no IFB – Campus Brasília

**Versão:** 3.0  
**Instituição:** Instituto Federal de Brasília – Pró-Reitoria de Pesquisa e Inovação (PRPI)  
**Bolsista:** Davi Rocha Fortes Bezerra  
**Orientador:** Prof. Dr. Dauster Souza Pereira  
**Período:** Setembro/2025 – Agosto/2026  
**Data:** Março de 2026  

---

## 1. Introdução

O documento incorpora um quarto perfil de usuário (Padrão) à estrutura anterior (ADM, Comissão e Respondente), realinhando todos os requisitos funcionais, regras de negócio e casos de uso. O sistema visa digitalizar o processo avaliativo em conformidade com SINAES (Lei nº 10.861/2004).

---

## 2. Escopo do Sistema

### Funcionalidades incluídas
- Autenticação e controle de acesso por perfil
- Administração de usuários, cursos e configurações
- Criação, personalização e acompanhamento de questionários
- Análise de resultados e geração de relatórios
- Acesso completo ao painel (Respondente)
- Acesso minimalista: login, logout e resposta (Padrão)

### Fora do escopo
Avaliação de aprendizagem, gestão de matrículas e integração com SUAP/MEC neste ciclo.

---

## 3. Perfis de Usuário

| Perfil | Descrição |
|---|---|
| **ADM** | Configuração e manutenção geral; gerência irrestrita |
| **Comissão** | Criação e análise de questionários; acompanhamento de participação |
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
| RF01 | Cadastrar, editar, desativar e excluir usuários | Alta | Pendente (Etapa 6) |
| RF02 | Atribuir perfis e sub-tipos | Alta | Pendente (Etapa 6) |
| RF03 | Cadastrar cursos, turmas e disciplinas | Alta | Pendente (Etapa 6) |
| RF04 | Configurar parâmetros gerais da plataforma | Média | Pendente (Etapa 6) |
| RF05 | Exibir painel de monitoramento com indicadores | Média | Pendente (Etapa 6) |
| RF06 | Visualizar logs de atividades e auditoria | Média | Pendente (Etapa 6) |

### 4.2 Perfil Comissão

| ID | Descrição | Prioridade | Status |
|---|---|---|---|
| RF07 | Criar questionários com título e período de vigência | Alta | ✅ Concluído |
| RF08 | Adicionar questões (múltipla escolha, Likert, dissertativa) | Alta | ✅ Concluído |
| RF09 | Vincular questionários a cursos/turmas/grupos | Alta | Pendente (Etapa 6) |
| RF10 | Salvar em rascunho; publicados não editáveis | Alta | ✅ Concluído |
| RF11 | Encerrar antecipadamente questionário | Média | ✅ Concluído |
| RF12 | Arquivar questionários encerrados | Média | ✅ Concluído |
| RF13 | Painel com taxa de participação por curso, turma e sub-tipo | Alta | ✅ Concluído |
| RF14 | Gerar relatórios automáticos após encerramento do período de vigência | Alta | ✅ Concluído |
| RF15 | Exibir gráficos e indicadores dinâmicos por questão, curso e sub-tipo | Alta | ✅ Concluído |
| RF16 | Filtrar relatórios por período, curso, turma e sub-tipo de respondente | Média | ✅ Concluído |
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

---

## 6. Regras de Negócio

| ID | Regra |
|---|---|
| RN01 | Resposta apenas dentro do período de vigência |
| RN02 | Uma resposta por usuário por ciclo avaliativo |
| RN03 | Questionários publicados não editáveis; apenas rascunhos |
| RN04 | Anônimos sem identificação armazenada ou exibida |
| RN05 | Apenas ADM cria e altera usuários e perfis |
| RN06 | Comissão vincula apenas a cursos/turmas cadastrados |
| RN07 | Relatórios disponíveis após encerramento |
| RN08 | Sub-tipo definido e alterado somente pelo ADM |
| RN09 | Padrão restrito a login, logout e resposta |
| RN10 | Questionários contemplam dimensões SINAES |

---

## 7. Casos de Uso Principais

### UC01 – Responder Questionário (Respondente)
- **Ator:** Respondente (aluno, professor, coordenador, etc.)
- **Pré-condição:** Autenticado; questionário publicado e vigente; sem resposta anterior neste ciclo
- **Fluxo:** Acessa painel → seleciona questionário → responde → confirma envio → confirmação
- **Requisitos:** RF19, RF20, RF21, RF22, RF23, RF28, RN01, RN02, RN04

### UC02 – Responder Questionário (Padrão)
- **Ator:** Usuário Padrão
- **Pré-condição:** Autenticado; questionário publicado e vigente; sem resposta anterior
- **Fluxo:** Login → acessa questionário → responde → confirma → logout
- **Restrição:** Sem painel, histórico nem notificações
- **Requisitos:** RF24, RF25, RF26, RF27, RF28, RN01, RN02, RN04, RN09

### UC03 – Criar e Publicar Questionário (Comissão)
- **Ator:** Comissão
- **Pré-condição:** Autenticado; cursos e turmas cadastrados
- **Fluxo:** Acessa módulo → cria questionário → adiciona questões → configura anonimato → vincula → salva/publica
- **Requisitos:** RF07, RF08, RF09, RF10, RN03, RN06, RN10

### UC04 – Analisar Resultados (Comissão)
- **Ator:** Comissão
- **Pré-condição:** Questionário encerrado; autenticado
- **Fluxo:** Acessa relatórios → seleciona questionário → aplica filtros → visualiza gráficos → exporta
- **Requisitos:** RF14, RF15, RF16, RF17, RN07

### UC05 – Gerenciar Usuários (ADM)
- **Ator:** ADM
- **Pré-condição:** Autenticado
- **Fluxo:** Acessa gestão → cadastra novo usuário (nome, e-mail, perfil, sub-tipo) → salva → envia credenciais
- **Alternativa:** Edita ou desativa usuário existente
- **Requisitos:** RF01, RF02, RF29, RN05, RN08

---

## 8. Restrições e Premissas Técnicas

### 8.1 Tecnologias
- Desenvolvimento em Visual Studio Code
- Foco inicial em front-end
- Back-end e banco de dados definidos posteriormente
- Respeitando requisitos não funcionais

### 8.2 Premissas
- Usuários com internet e navegador web atualizado
- Infraestrutura fornecida pelo IFB ou nuvem
- Sem integração com SUAP/MEC neste ciclo
- Implantação inicial em Campus Brasília; expansão futura viável

---

## 9. Histórico de Versões

| Versão | Data | Alterações | Autor |
|---|---|---|---|
| 1.0 | 21/03/2026 | Inicial com perfis: Aluno, Professor, Coordenador, Gestor | Davi Rocha F. Bezerra |
| 2.0 | 24/03/2026 | Reestruturação para ADM, Comissão, Respondente (com sub-tipos) | Davi Rocha F. Bezerra |
| 3.0 | 24/03/2026 | Inclusão perfil Padrão; tabela comparativa; UC02; realinhamento RFs/RNs | Davi Rocha F. Bezerra |

---

## 10. Referências

- BRASIL. Lei nº 10.861/2004 – Sistema Nacional de Avaliação da Educação Superior (SINAES)
- BRASIL. Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (LGPD)
- KITCHENHAM, B. Guidelines for Performing Systematic Literature Reviews (2007)
- RISTOFF & GIOLO. O Sinaes como sistema (2006)
- SOMMERVILLE, I. Engenharia de Software (10ª ed., 2019)

---

*Programa PIBIC CNPq 2025–2026 | Brasília, 2026*
