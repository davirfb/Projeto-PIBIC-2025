# Avaliação IFB – React + Vite + Tailwind (shadcn-style)

Projeto em React + Vite configurado com Tailwind CSS 4 e componentes no estilo **shadcn/ui** (utilizando `class-variance-authority`, `tailwind-merge`, etc.).

Este guia explica como rodar o projeto em **qualquer computador**.

---

## Requisitos

- **Node.js** (versão LTS recomendada)  
  Você pode conferir se está instalado com:

```bash
node -v
npm -v
```

---

## Como rodar o projeto pela primeira vez

1. **Clonar ou copiar o projeto**
   - Se estiver usando Git:
     ```bash
     git clone <url-do-repositorio>
     cd "avaliacao IFB"
     ```
   - Ou copie a pasta `avaliacao IFB` para o outro computador (não é necessário copiar `node_modules`).

2. **Instalar as dependências**

   Dentro da pasta `avaliacao IFB`:

   ```bash
   npm install
   ```

   Isso usa `package.json` e `package-lock.json` para instalar as mesmas versões de bibliotecas (React, Vite, Tailwind, shadcn-utils, etc.).

3. **Rodar em modo desenvolvimento**

   Ainda dentro de `avaliacao IFB`:

   ```bash
   npm run dev
   ```

   Em seguida, abra no navegador o endereço mostrado no terminal (geralmente `http://localhost:5173`).

---

## Build de produção (opcional)

Para gerar os arquivos otimizados de produção:

```bash
npm run build
```

Para pré-visualizar a build:

```bash
npm run preview
```

---

## Tecnologias principais

- **React** + **TypeScript**
- **Vite**
- **Tailwind CSS 4**
- Utilitários no estilo **shadcn/ui**:
  - `class-variance-authority`
  - `clsx`
  - `tailwind-merge`
  - `tailwindcss-animate`
  - `@radix-ui/react-slot`
  - `lucide-react`

# Arquitetura do Sistema — Avaliação IFB

**Versão:** 1.0 | **Data:** Junho/2026

---

## 1. Diagrama de Classes

```mermaid
classDiagram
    class Usuario {
        +String id
        +String nome
        +String email
        +String senhaHash
        +UserRole role
        +UserSubType subType
        +Boolean ativo
        +DateTime criadoEm
    }

    class Curso {
        +String id
        +String nome
        +String codigo
        +Boolean ativo
        +DateTime criadoEm
    }

    class Questionario {
        +String id
        +String titulo
        +String descricao
        +Date dataInicio
        +Date dataFim
        +Boolean anonimo
        +QuestionarioStatus status
        +String criadoPorId
        +DateTime criadoEm
        +DateTime atualizadoEm
    }

    class Questao {
        +String id
        +String questionarioId
        +String enunciado
        +QuestaoTipo tipo
        +Boolean obrigatoria
        +LikertEscalaId likertEscala
        +Int ordem
    }

    class Opcao {
        +String id
        +String questaoId
        +String texto
        +Int ordem
    }

    class Resposta {
        +String id
        +String questionarioId
        +String respondentId
        +String respondentRole
        +DateTime submetidoEm
    }

    class RespostaQuestao {
        +String id
        +String respostaId
        +String questaoId
        +String opcaoId
        +Int likertValor
        +String texto
    }

    class UserRole {
        <<enumeration>>
        adm
        comissao
        respondente
        padrao
    }

    class UserSubType {
        <<enumeration>>
        aluno
        professor
        coordenador
        tecnico_administrativo
        outro
    }

    class QuestionarioStatus {
        <<enumeration>>
        rascunho
        publicado
        encerrado
        arquivado
    }

    class QuestaoTipo {
        <<enumeration>>
        multipla_escolha
        likert
        dissertativa
    }

    Usuario --> UserRole
    Usuario --> UserSubType
    Questionario --> QuestionarioStatus
    Questao --> QuestaoTipo

    Usuario "N" --> "N" Curso : comissiona (role=comissao)
    Usuario "N" --> "N" Curso : matriculado em (role=respondente)
    Usuario "1" --> "N" Questionario : cria
    Usuario "1" --> "N" Resposta : submete

    Questionario "N" --> "N" Curso : vinculado a
    Questionario "1" --> "N" Questao : contém
    Questionario "1" --> "N" Resposta : recebe

    Questao "1" --> "N" Opcao : tem opções
    Questao "1" --> "N" RespostaQuestao : referenciada por

    Resposta "1" --> "N" RespostaQuestao : contém
    Opcao "1" --> "N" RespostaQuestao : selecionada em
```

---

## 2. Diagrama de Banco de Dados (ER)

> **Notas:**
> - Questionários anônimos: `respondent_id` é armazenado no banco para deduplicação (RN02), mas **nunca exposto em relatórios ou respostas da API** (RN04).
> - **Semestre/período** não é uma entidade separada. É implícito no título e nas datas de vigência do questionário (ex: "Avaliação ADS — 1º Semestre 2025").
> - **Curso** representa apenas o nome do curso (ex: "ADS"). Respondentes e membros da comissão são vinculados a cursos — o questionário define o período.

```mermaid
erDiagram
    USUARIOS {
        uuid id PK
        string nome
        string email UK
        string senha_hash
        string role
        string sub_type
        boolean ativo
        timestamp criado_em
    }

    CURSOS {
        uuid id PK
        string nome
        string codigo UK
        boolean ativo
        timestamp criado_em
    }

    COMISSAO_CURSOS {
        uuid usuario_id FK
        uuid curso_id FK
    }

    RESPONDENTE_CURSOS {
        uuid usuario_id FK
        uuid curso_id FK
    }

    QUESTIONARIOS {
        uuid id PK
        string titulo
        text descricao
        date data_inicio
        date data_fim
        boolean anonimo
        string status
        uuid criado_por_id FK
        timestamp criado_em
        timestamp atualizado_em
    }

    QUESTIONARIO_CURSOS {
        uuid questionario_id FK
        uuid curso_id FK
    }

    QUESTOES {
        uuid id PK
        uuid questionario_id FK
        text enunciado
        string tipo
        boolean obrigatoria
        string likert_escala
        int ordem
    }

    OPCOES {
        uuid id PK
        uuid questao_id FK
        string texto
        int ordem
    }

    RESPOSTAS {
        uuid id PK
        uuid questionario_id FK
        uuid respondent_id FK "armazenado mas nunca exposto se anônimo"
        string respondent_role
        timestamp submetido_em
    }

    RESPOSTAS_QUESTOES {
        uuid id PK
        uuid resposta_id FK
        uuid questao_id FK
        uuid opcao_id FK "nullable"
        int likert_valor "nullable"
        text texto "nullable"
    }

    USUARIOS ||--o{ COMISSAO_CURSOS : "comissiona"
    CURSOS ||--o{ COMISSAO_CURSOS : "tem membros comissão"

    USUARIOS ||--o{ RESPONDENTE_CURSOS : "matriculado em"
    CURSOS ||--o{ RESPONDENTE_CURSOS : "tem respondentes"

    USUARIOS ||--o{ QUESTIONARIOS : "cria"
    USUARIOS ||--o{ RESPOSTAS : "submete"

    QUESTIONARIOS ||--o{ QUESTIONARIO_CURSOS : "vinculado a"
    CURSOS ||--o{ QUESTIONARIO_CURSOS : "recebe"

    QUESTIONARIOS ||--o{ QUESTOES : "possui"
    QUESTOES ||--o{ OPCOES : "tem"

    QUESTIONARIOS ||--o{ RESPOSTAS : "recebe"
    RESPOSTAS ||--o{ RESPOSTAS_QUESTOES : "contém"
    QUESTOES ||--o{ RESPOSTAS_QUESTOES : "referenciada"
    OPCOES ||--o{ RESPOSTAS_QUESTOES : "selecionada"
```

---

## 3. Fluxo de Autenticação

```mermaid
flowchart TD
    A([Início]) --> B[Usuário acessa o sistema]
    B --> C[/Insere email e senha/]
    C --> D{Credenciais válidas?}
    D -->|Não| E[Exibe erro de autenticação]
    E --> C
    D -->|Sim| F{Usuário ativo?}
    F -->|Não| G[Exibe: conta desativada]
    G --> B
    F -->|Sim| H{Qual é o perfil?}
    H -->|ADM| I[HomeADM]
    H -->|Comissão| J[HomeComissao]
    H -->|Respondente| K[HomeRespondente]
    H -->|Padrão| L[HomePadrao]
```

---

## 4. Fluxo de Resposta — Respondente e Padrão

```mermaid
flowchart TD
    A([Login realizado]) --> B{Perfil?}
    B -->|Respondente| C[Painel com questionários disponíveis + histórico]
    B -->|Padrão| D[Lista de questionários vigentes]
    C --> E[Seleciona questionário]
    D --> E
    E --> F{Questionário vigente?\nstatus=publicado e dentro do período}
    F -->|Não| G[Exibe: fora do período de resposta]
    F -->|Sim| I{Já respondeu?}
    I -->|Sim| J[Exibe: questionário já respondido]
    I -->|Não| K[Exibe formulário de questões]
    K --> L[Preenche questões obrigatórias]
    L --> M{Validação OK?}
    M -->|Não| N[Exibe erros inline por campo]
    N --> L
    M -->|Sim| O[Confirma envio]
    O --> P{Questionário anônimo?}
    P -->|Sim| Q[Salva respondentId no banco\nnão exposto em relatórios]
    P -->|Não| R[Salva respondentId normalmente]
    Q --> S[Exibe tela de confirmação]
    R --> S
    S --> T([Fim])
```

---

## 5. Fluxo de Criação de Questionário — Comissão

```mermaid
flowchart TD
    A([Login como Comissão]) --> B[HomeComissao]
    B --> C{Ação?}

    C -->|Novo questionário| D[Preenche: título, período, anonimato]
    D --> E[Adiciona questões:\nmúltipla escolha, Likert, dissertativa]
    E --> F[Vincula aos cursos que o membro comissiona]
    F --> G{Publicar ou salvar rascunho?}
    G -->|Rascunho| H[Salva como rascunho]
    G -->|Publicar| I{Validação completa?\ntítulo + período + pelo menos 1 questão}
    I -->|Não| J[Exibe erros inline]
    J --> E
    I -->|Sim| K[Publica questionário\nstatus → publicado]

    C -->|Editar rascunho| L[Edita apenas se status = rascunho]
    L --> G

    C -->|Encerrar antecipado| M{Status = publicado?}
    M -->|Sim| N[Status → encerrado]
    M -->|Não| O[Ação não permitida]

    C -->|Arquivar| P{Status = encerrado?}
    P -->|Sim| Q[Status → arquivado]
    P -->|Não| O

    C -->|Excluir| R[AlertDialog de confirmação]
    R -->|Confirmar| S[Remove questionário e respostas]
    R -->|Cancelar| B
```

---

## 6. Fluxo de Relatórios — Comissão

```mermaid
flowchart TD
    A([Login como Comissão]) --> B[Acessa seção Relatórios]
    B --> C[Lista questionários encerrados/arquivados\nfiltrados pelos cursos do membro]
    C --> D[Seleciona questionário]
    D --> E[Aplica filtros: período, curso, sub-tipo de respondente]
    E --> F[Exibe gráficos por questão\nmúltipla escolha: barras\nLikert: barras de satisfação\ndissertativa: listagem]
    F --> G[Exibe taxa de participação por curso e sub-tipo]
    G --> H{Exportar?}
    H -->|PDF| I[Gera PDF do relatório completo]
    H -->|CSV| J[Gera CSV com respostas agregadas]
    H -->|Não| K([Fim])
    I --> K
    J --> K
```

---

## 7. Fluxo de Gestão — ADM

```mermaid
flowchart TD
    A([Login como ADM]) --> B[HomeADM]
    B --> C{Módulo?}

    C -->|Usuários| D[Lista todos os usuários]
    D --> E{Operação?}
    E -->|Criar| F[Preenche: nome, email, senha, role, sub-tipo]
    F --> G{Role = comissão?}
    G -->|Sim| H[Seleciona cursos vinculados ao membro]
    G -->|Não| I[Salva usuário]
    H --> I
    E -->|Editar| J[Altera: dados pessoais, role, sub-tipo, cursos]
    J --> I
    E -->|Desativar| K[Marca ativo = false\nusuário não consegue mais logar]
    E -->|Excluir| L[Remove usuário permanentemente]

    C -->|Cursos| M[Cadastra / edita / desativa cursos]

    C -->|Configurações| N[Parâmetros gerais da plataforma]

    C -->|Logs| O[Visualiza auditoria:\nlogins, criações, publicações, respostas]
```

---

## 8. Regras de Negócio Críticas

| Código | Regra | Impacto no Backend |
|--------|-------|-------------------|
| RN01 | Resposta só dentro do período de vigência | Validar `dataInicio ≤ hoje ≤ dataFim` na API |
| RN02 | Uma resposta por usuário por questionário | `UNIQUE(respondent_id, questionario_id)` — aplicado sempre, inclusive anônimos |
| RN03 | Questionário publicado não é editável | API recusa PUT se `status ≠ rascunho` |
| RN04 | Anônimo: `respondent_id` não exposto | Armazenado no banco para deduplicação, nunca retornado pela API |
| RN05 | Só ADM cria e altera usuários | Guard de autorização por role |
| RN07 | Relatórios disponíveis só após encerramento | Filtrar por `status IN (encerrado, arquivado)` |
| RN09 | Padrão: acesso restrito a login/logout/resposta | Guard de rota na API e no frontend |

---

## 9. Visibilidade por Perfil — Resumo

| Recurso | ADM | Comissão | Respondente | Padrão |
|---------|-----|----------|-------------|--------|
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ |
| Gerenciar cursos | ✅ | ❌ | ❌ | ❌ |
| Criar questionários | ❌ | ✅ (cursos vinculados) | ❌ | ❌ |
| Ver relatórios | ❌ | ✅ (cursos vinculados) | ❌ | ❌ |
| Responder questionários | ❌ | ❌ | ✅ | ✅ |
| Ver histórico | ❌ | ❌ | ✅ | ❌ |
| Painel de participação | ❌ | ✅ (cursos vinculados) | ❌ | ❌ |
