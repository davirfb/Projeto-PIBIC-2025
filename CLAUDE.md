# CLAUDE.md — Avaliação IFB (PIBIC CNPq 2025–2026)

## Início de sessão — obrigatório

Ao iniciar qualquer sessão neste projeto:
1. Leia `docs/requirements.md`
2. Confirme com exatamente esta linha: `✅ Requisitos carregados: Sistema Web para Avaliação Periódica de Curso v3.0`

---

## Visão geral

Sistema web de avaliação institucional do Instituto Federal de Brasília.
Projeto de pesquisa PIBIC/CNPq 2025–2026. Desenvolvido em etapas sequenciais — não antecipar funcionalidades de etapas futuras.

---

## Estrutura do repositório

```
Projeto-PIBIC-2025/
├── frontend/          ← todo o código React (pasta de trabalho principal)
│   ├── src/
│   │   ├── app/           App.tsx, routes.tsx, providers.tsx
│   │   ├── components/
│   │   │   ├── layout/    AppLayout.tsx (sidebar + main)
│   │   │   ├── shared/    Sidebar.tsx
│   │   │   └── ui/        shadcn/ui — NÃO editar diretamente
│   │   ├── context/       QuestionarioContext.tsx
│   │   ├── hooks/         useAuth.ts, use-mobile.tsx
│   │   ├── pages/
│   │   │   ├── auth/      LoginPage.tsx
│   │   │   ├── adm/       HomeADM.tsx
│   │   │   ├── comissao/  HomeComissao.tsx, QuestionarioForm.tsx
│   │   │   ├── respondente/ HomeRespondente.tsx, ResponderView.tsx
│   │   │   └── padrao/    HomePadrao.tsx
│   │   ├── services/      api.ts (stub — backend futuro)
│   │   └── types/         user.ts, questionario.ts, resposta.ts
│   ├── package.json
│   └── vite.config.ts
└── backend/           ← Python/FastAPI — implementar APÓS todas as etapas frontend
```

---

## Stack técnica

| Camada        | Tecnologia                                      |
| ------------- | ----------------------------------------------- |
| Framework     | React 19 + TypeScript 5.9                       |
| Build         | Vite 7.3                                        |
| Estilos       | Tailwind CSS 4 (via `@tailwindcss/vite`)        |
| Componentes   | shadcn/ui (Radix UI) + lucide-react             |
| Estado global | React Context API (`QuestionarioContext`)       |
| Autenticação  | Mock local via `useAuth` — sem JWT ainda        |
| Roteamento    | State-based em `App.tsx` — **sem React Router** |
| Backend       | Pendente — Python/FastAPI (pós-frontend)        |

**Alias de import:** `@/` → `frontend/src/` (configurado em `vite.config.ts`).

---

## Rodar o projeto

```bash
cd frontend
npm run dev        # servidor de desenvolvimento em http://localhost:5173
npm run build      # build de produção (tsc -b && vite build)
npx tsc --noEmit   # type-check sem gerar arquivos
```

---

## Credenciais mock

Senha: qualquer valor não vazio.

| Email                    | Perfil      |
| ------------------------ | ----------- |
| `adm@ifb.edu.br`         | ADM         |
| `comissao@ifb.edu.br`    | Comissão    |
| `respondente@ifb.edu.br` | Respondente |
| `padrao@ifb.edu.br`      | Padrão      |

---

## Perfis de usuário

| Role          | Interface       | Layout                              |
| ------------- | --------------- | ----------------------------------- |
| `adm`         | HomeADM         | AppLayout (sidebar)                 |
| `comissao`    | HomeComissao    | AppLayout (sidebar)                 |
| `respondente` | HomeRespondente | AppLayout (sidebar)                 |
| `padrao`      | HomePadrao      | Header simples + main (sem sidebar) |

---

## Estado e roteamento

- **Sem React Router.** Navegação por `useState<Section>` dentro de cada página.
- **QuestionarioContext** (`src/context/QuestionarioContext.tsx`) é o único estado global. Envolve toda a área autenticada em `App.tsx`.
- `useAuth` gerencia sessão em memória. `user.id` = `user.email` normalizado.
- Ao adicionar novo estado global, usar o contexto existente — não criar novos providers sem necessidade.

---

## Tipos principais

### `src/types/user.ts`

```ts
type UserRole = "adm" | "comissao" | "respondente" | "padrao";
type UserSubType =
  | "aluno"
  | "professor"
  | "coordenador"
  | "tecnico_administrativo"
  | "outro";
```

### `src/types/questionario.ts`

```ts
type QuestaoTipo = "multipla_escolha" | "likert" | "dissertativa";
type QuestionarioStatus = "rascunho" | "publicado" | "encerrado" | "arquivado";
type LikertEscalaId =
  | "satisfacao"
  | "concordancia"
  | "frequencia"
  | "qualidade";
// LIKERT_ESCALAS: Record<LikertEscalaId, { label, opcoes: string[5] }>
```

### `src/types/resposta.ts`

```ts
interface RespostaQuestao { questaoId, opcaoId?, likertValor?, texto? }
interface Resposta { id, questionarioId, respondentId: string|null, respondentRole, respostas[], submetidoEm }
```

---

## Regras de negócio — SEMPRE respeitar

| Código | Regra                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------- |
| RN01   | Questionário vigente: `status === "publicado"` **e** `dataInicio <= hoje <= dataFim`                     |
| RN02   | Um respondente só pode responder cada questionário uma vez (por `respondentId`)                          |
| RN03   | Questionário publicado **não pode ser editado**, mas pode ser excluído (com confirmação via AlertDialog) |
| RN04   | Questionário anônimo: `respondentId = null` na resposta — não aparece no histórico                       |
| RN09   | Perfil `padrao` não tem histórico de respostas                                                           |

**Fluxo de status:** `rascunho → publicado → encerrado → arquivado` (sem reversão).

---

## Convenções de código

### Geral

- TypeScript estrito — sem `any` explícito.
- Sem comentários descritivos (o código se explica pelos nomes). Comentar só quando o "porquê" não é óbvio.
- Sem `console.log` em produção.
- Funções dentro de componentes: `function` declarations, não arrow functions.
- Exportações nomeadas — sem `export default` em componentes (exceto `App.tsx`).

### Componentes

- Um componente por arquivo, salvo sub-componentes internos pequenos (ex: `PendingSection`, cards).
- Sub-componentes internos: declarar **antes** do componente principal no mesmo arquivo.
- Props sempre tipadas com `interface`, não `type`.
- Sem props drilling — usar `QuestionarioContext` quando o dado atravessa mais de um nível.

### Estilos (Tailwind)

- Paleta principal: `slate` (neutros), `emerald` (ações positivas/primárias), `red` (destrutivo), `blue` (informativo), `amber` (aviso).
- Cards de conteúdo: `rounded-xl border border-slate-200 bg-white shadow-sm`.
- Padding de página: `p-8` com `space-y-8` para seções.
- Botões de ação primária: `bg-emerald-500 hover:bg-emerald-600 text-white`.
- Botão destrutivo: `bg-red-500 hover:bg-red-600 text-white`.
- Badges de status: padrão do `STATUS_CONFIG` em HomeComissao.

### Formulários e validação

- Validação no client — sem libs externas (sem Zod, sem React Hook Form).
- Erros inline por campo, não toast global.
- Confirmações destrutivas sempre via `AlertDialog` do shadcn/ui.

### IDs gerados no mock

```ts
`${Date.now()}-${Math.random().toString(36).slice(2)}`;
```

### Datas

- Formato ISO `"YYYY-MM-DD"` como string — comparação lexicográfica é correta.
- Vigência: `q.dataInicio <= hoje && q.dataFim >= hoje` onde `hoje = new Date().toISOString().slice(0, 10)`.

---

## Componentes disponíveis (shadcn/ui — `src/components/ui/`)

`alert-dialog`, `badge`, `button`, `card`, `input`, `label`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `tooltip`

**Não instalar novos componentes shadcn/ui sem confirmar com o usuário.**

---

## Etapas do projeto

| Etapa   | Escopo                                                                                         | Status       |
| ------- | ---------------------------------------------------------------------------------------------- | ------------ |
| 1       | Perfis e autenticação (tipos, useAuth, LoginPage, roteamento)                                  | ✅ Concluída |
| 2       | Layouts e dashboards por perfil (AppLayout, Sidebar, HomeADM, HomeRespondente, HomePadrao)     | ✅ Concluída |
| 3       | Módulo de questionários — Comissão (QuestionarioForm, HomeComissao, tipos)                     | ✅ Concluída |
| 4       | Módulo de resposta — Respondente e Padrão (QuestionarioContext, ResponderView, fluxo completo) | ✅ Concluída |
| 5       | Módulo de relatórios — Comissão (RF13–RF17)                                                    | ✅ Concluída |
| 6       | Gestão administrativa — ADM (RF01–RF06)                                                        | ✅ Concluída |
| Backend | API REST Python/FastAPI — após todas as etapas frontend                                        | Pendente     |

**Implementar sempre uma etapa por vez. Não antecipar funcionalidades de etapas futuras.**

---

## O que NÃO fazer

- Não instalar React Router — navegação é state-based.
- Não usar `any` em TypeScript.
- Não criar novos arquivos de tipos sem necessidade (reaproveitar os existentes).
- Não editar arquivos em `src/components/ui/` — são gerados pelo shadcn/ui.
- Não implementar backend enquanto o frontend estiver incompleto.
- Não adicionar tratamento de erro para cenários impossíveis no mock.
- Não usar `export default` em componentes de páginas/layouts.
- Não criar abstrações genéricas antecipadas ("helper", "utils") além do `src/lib/utils.ts` existente.
- Não commitar `node_modules/`.

---

## Verificação antes de entregar

1. `npx tsc --noEmit` — zero erros.
2. Checar se o fluxo completo funciona no browser (login → ação → resultado esperado).
3. Checar se os outros perfis não foram quebrados pela mudança.
