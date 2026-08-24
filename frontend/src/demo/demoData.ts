import type { Questionario, QuestaoTipo, LikertEscalaId } from "@/types/questionario"
import type { Resposta, RespostaQuestao } from "@/types/resposta"
import type { UserRole } from "@/types/user"

// ─────────────────────────────────────────────────────────────
export const DEMO_MODE = true

export type DemoProfile = "estudante-comissao" | "professor-comissao" | "aluno"

export const DEMO_PROFILES: Record<
  DemoProfile,
  { id: string; name: string; role: "respondente" | "padrao"; roleLabel: string; isComissao: boolean }
> = {
  "estudante-comissao": {
    id: "demo-estudante-comissao",
    name: "Ana Luiza Costa",
    role: "respondente",
    roleLabel: "Estudante TSI",
    isComissao: true,
  },
  "professor-comissao": {
    id: "demo-professor-comissao",
    name: "Prof. Ricardo Melo",
    role: "padrao",
    roleLabel: "Professor / TSI",
    isComissao: true,
  },
  aluno: {
    id: "demo-aluno-respondente",
    name: "Lucas Ferreira",
    role: "respondente",
    roleLabel: "Estudante TSI",
    isComissao: false,
  },
}

// ─────────────────────────────────────────────────────────────
// Helpers de criação
// ─────────────────────────────────────────────────────────────
function qq(
  id: string,
  tipo: QuestaoTipo,
  enunciado: string,
  obrigatoria: boolean,
  extras: Partial<{ likertEscala: LikertEscalaId; opcoes: { id: string; texto: string }[] }> = {},
) {
  return { id, tipo, enunciado, obrigatoria, ...extras }
}

function l(questaoId: string, likertValor: number): RespostaQuestao {
  return { questaoId, likertValor }
}
function o(questaoId: string, opcaoId: string): RespostaQuestao {
  return { questaoId, opcaoId }
}
function tx(questaoId: string, texto: string): RespostaQuestao {
  return { questaoId, texto }
}
function resp(
  id: string,
  qid: string,
  role: UserRole,
  data: string,
  respostas: RespostaQuestao[],
): Resposta {
  return { id, questionarioId: qid, respondentId: null, respondentRole: role, respostas, submetidoEm: data }
}

// Gera respostas apenas-likert com base em distribuições por questão
// dist[q] = [n_v1, n_v2, n_v3, n_v4, n_v5]  — deve somar ao mesmo total
function gerarRespostasLikert(
  qid: string,
  questaoIds: string[],
  role: UserRole,
  prefix: string,
  data: string,
  dist: [number, number, number, number, number][],
): Resposta[] {
  const n = dist[0].reduce((a, b) => a + b, 0)
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    questionarioId: qid,
    respondentId: null,
    respondentRole: role,
    submetidoEm: data,
    respostas: questaoIds.map((questaoId, qi) => {
      let cum = 0
      for (let v = 1; v <= 5; v++) {
        cum += dist[qi][v - 1]
        if (i < cum) return { questaoId, likertValor: v }
      }
      return { questaoId, likertValor: 5 }
    }),
  }))
}

function criarQuestoesCurso(pfx: string) {
  return [
    qq(`${pfx}-q1`, "likert", "Como você avalia o curso de TSI de forma geral?", true, { likertEscala: "satisfacao" }),
    qq(`${pfx}-q2`, "likert", "Como você avalia a infraestrutura dos laboratórios de informática?", true, { likertEscala: "qualidade" }),
    qq(`${pfx}-q3`, "likert", "Como você avalia a qualidade do corpo docente?", true, { likertEscala: "qualidade" }),
    qq(`${pfx}-q4`, "likert", "Os conteúdos das disciplinas são relevantes para o mercado de trabalho.", true, { likertEscala: "concordancia" }),
    qq(`${pfx}-q5`, "likert", "A carga horária das atividades práticas atende às necessidades do curso.", true, { likertEscala: "concordancia" }),
  ]
}

function criarQuestoesDocente(pfx: string) {
  return [
    qq(`${pfx}-r1`, "likert", "Como você avalia o desempenho dos professores de forma geral?", true, { likertEscala: "qualidade" }),
    qq(`${pfx}-r2`, "likert", "Os professores relacionam os conteúdos com situações práticas do mercado.", true, { likertEscala: "concordancia" }),
    qq(`${pfx}-r3`, "likert", "Os professores estão disponíveis para atendimento fora do horário de aula.", true, { likertEscala: "frequencia" }),
    qq(`${pfx}-r4`, "likert", "O feedback dado pelos professores contribui para o desenvolvimento do aluno.", true, { likertEscala: "concordancia" }),
  ]
}

// ─────────────────────────────────────────────────────────────
// IDs dos questionários
// ─────────────────────────────────────────────────────────────
const QID = {
  c22_1: "q-tsi-2022-1",
  d22_2: "q-doc-2022-2",
  c23_1: "q-tsi-2023-1",
  d23_2: "q-doc-2023-2",
  c24_1: "q-tsi-2024-1",
  d24_2: "q-doc-2024-2",
  c25_1: "q-tsi-2025-1",   // existente
  c26_1: "q-tsi-2026-1",
  d26_2: "q-doc-2026-2",   // publicado/vigente
}

// ─────────────────────────────────────────────────────────────
// IDs das questões do Q 2025/1 (extenso, com múltipla escolha)
// ─────────────────────────────────────────────────────────────
const Q25_1 = {
  q1: "q25-qq1", q2: "q25-qq2", q3: "q25-qq3", q4: "q25-qq4", q5: "q25-qq5",
  q6: "q25-qq6", q7: "q25-qq7", q8: "q25-qq8", q9: "q25-qq9", q10: "q25-qq10",
}
const OPT25 = {
  infra: "q25-q6-o1", cont: "q25-q6-o2", meto: "q25-q6-o3", supo: "q25-q6-o4", esta: "q25-q6-o5",
  site: "q25-q9-o1",  prof: "q25-q9-o2", cole: "q25-q9-o3", rede: "q25-q9-o4", naoi: "q25-q9-o5",
}

// IDs do questionário 2026/2 (publicado/vigente)
const Q26_2 = { r1: "q26d-r1", r2: "q26d-r2", r3: "q26d-r3", r4: "q26d-r4" }
const OPT26_2 = { disp: "q26d-r4-o1", clar: "q26d-r4-o2", aval: "q26d-r4-o3", feed: "q26d-r4-o4" }

// ─────────────────────────────────────────────────────────────
// QUESTIONÁRIOS
// ─────────────────────────────────────────────────────────────
export const DEMO_QUESTIONARIOS: Questionario[] = [
  // 2022/1
  {
    id: QID.c22_1, titulo: "Avaliação do Curso de TSI 2022/1",
    descricao: "Avaliação institucional do curso Tecnologia em Sistemas para Internet, primeiro semestre de 2022.",
    dataInicio: "2022-03-01", dataFim: "2022-06-30", anonimo: true, status: "arquivado",
    cursos: ["tsi-001"], criadoEm: "2022-02-20T10:00:00Z", atualizadoEm: "2022-07-10T08:00:00Z",
    questoes: criarQuestoesCurso("q22c1"),
  },
  // 2022/2
  {
    id: QID.d22_2, titulo: "Avaliação Docente 2022/2",
    descricao: "Avaliação do desempenho docente no segundo semestre de 2022.",
    dataInicio: "2022-08-01", dataFim: "2022-11-30", anonimo: true, status: "arquivado",
    cursos: ["tsi-001"], criadoEm: "2022-07-20T14:00:00Z", atualizadoEm: "2022-12-05T08:00:00Z",
    questoes: criarQuestoesDocente("q22d2"),
  },
  // 2023/1
  {
    id: QID.c23_1, titulo: "Avaliação do Curso de TSI 2023/1",
    descricao: "Avaliação institucional do curso Tecnologia em Sistemas para Internet, primeiro semestre de 2023.",
    dataInicio: "2023-03-01", dataFim: "2023-06-30", anonimo: true, status: "arquivado",
    cursos: ["tsi-001"], criadoEm: "2023-02-22T10:00:00Z", atualizadoEm: "2023-07-08T08:00:00Z",
    questoes: criarQuestoesCurso("q23c1"),
  },
  // 2023/2
  {
    id: QID.d23_2, titulo: "Avaliação Docente 2023/2",
    descricao: "Avaliação do desempenho docente no segundo semestre de 2023.",
    dataInicio: "2023-08-01", dataFim: "2023-11-30", anonimo: true, status: "arquivado",
    cursos: ["tsi-001"], criadoEm: "2023-07-25T14:00:00Z", atualizadoEm: "2023-12-03T08:00:00Z",
    questoes: criarQuestoesDocente("q23d2"),
  },
  // 2024/1
  {
    id: QID.c24_1, titulo: "Avaliação do Curso de TSI 2024/1",
    descricao: "Avaliação institucional do curso Tecnologia em Sistemas para Internet, primeiro semestre de 2024.",
    dataInicio: "2024-03-01", dataFim: "2024-06-30", anonimo: true, status: "arquivado",
    cursos: ["tsi-001"], criadoEm: "2024-02-21T10:00:00Z", atualizadoEm: "2024-07-05T08:00:00Z",
    questoes: criarQuestoesCurso("q24c1"),
  },
  // 2024/2
  {
    id: QID.d24_2, titulo: "Avaliação Docente 2024/2",
    descricao: "Avaliação do desempenho docente no segundo semestre de 2024.",
    dataInicio: "2024-08-01", dataFim: "2024-11-30", anonimo: true, status: "arquivado",
    cursos: ["tsi-001"], criadoEm: "2024-07-22T14:00:00Z", atualizadoEm: "2024-12-02T08:00:00Z",
    questoes: criarQuestoesDocente("q24d2"),
  },
  // 2025/1 — extenso (questões com múltipla escolha e dissertativa)
  {
    id: QID.c25_1, titulo: "Avaliação do Curso de TSI 2025/1",
    descricao: "Avaliação institucional do curso Tecnologia em Sistemas para Internet, primeiro semestre de 2025.",
    dataInicio: "2025-03-01", dataFim: "2025-06-30", anonimo: true, status: "encerrado",
    cursos: ["tsi-001"], criadoEm: "2025-02-20T10:00:00Z", atualizadoEm: "2025-07-01T08:00:00Z",
    questoes: [
      qq(Q25_1.q1, "likert", "Como você avalia o curso de TSI de forma geral?", true, { likertEscala: "satisfacao" }),
      qq(Q25_1.q2, "likert", "Como você avalia a infraestrutura dos laboratórios de informática?", true, { likertEscala: "qualidade" }),
      qq(Q25_1.q3, "likert", "Como você avalia a qualidade do corpo docente?", true, { likertEscala: "qualidade" }),
      qq(Q25_1.q4, "likert", "Os conteúdos das disciplinas são relevantes para o mercado de trabalho.", true, { likertEscala: "concordancia" }),
      qq(Q25_1.q5, "likert", "A carga horária das atividades práticas atende às necessidades do curso.", true, { likertEscala: "concordancia" }),
      qq(Q25_1.q6, "multipla_escolha", "Qual aspecto do curso você considera mais urgente para ser melhorado?", true, {
        opcoes: [
          { id: OPT25.infra, texto: "Infraestrutura e equipamentos" },
          { id: OPT25.cont,  texto: "Conteúdo das disciplinas" },
          { id: OPT25.meto,  texto: "Metodologia de ensino" },
          { id: OPT25.supo,  texto: "Suporte e atendimento ao estudante" },
          { id: OPT25.esta,  texto: "Oportunidades de estágio e mercado" },
        ],
      }),
      qq(Q25_1.q7, "likert", "Com que frequência você utiliza os laboratórios de informática?", true, { likertEscala: "frequencia" }),
      qq(Q25_1.q8, "likert", "A comunicação entre a coordenação do curso e os estudantes é eficiente.", true, { likertEscala: "concordancia" }),
      qq(Q25_1.q9, "multipla_escolha", "Como você tomou conhecimento sobre oportunidades de estágio na área?", true, {
        opcoes: [
          { id: OPT25.site, texto: "Portal / site do IFB" },
          { id: OPT25.prof, texto: "Indicação de professores" },
          { id: OPT25.cole, texto: "Colegas de curso" },
          { id: OPT25.rede, texto: "Redes sociais / internet" },
          { id: OPT25.naoi, texto: "Não fui informado(a)" },
        ],
      }),
      qq(Q25_1.q10, "dissertativa", "Deixe sugestões ou comentários para a melhoria do curso. (opcional)", false),
    ],
  },
  // 2026/1
  {
    id: QID.c26_1, titulo: "Avaliação do Curso de TSI 2026/1",
    descricao: "Avaliação institucional do curso Tecnologia em Sistemas para Internet, primeiro semestre de 2026.",
    dataInicio: "2026-03-01", dataFim: "2026-06-30", anonimo: true, status: "encerrado",
    cursos: ["tsi-001"], criadoEm: "2026-02-18T10:00:00Z", atualizadoEm: "2026-07-02T08:00:00Z",
    questoes: criarQuestoesCurso("q26c1"),
  },
  // 2026/2 — publicado/vigente
  {
    id: QID.d26_2, titulo: "Avaliação Docente 2026/2",
    descricao: "Avaliação do desempenho docente no segundo semestre de 2026.",
    dataInicio: "2026-08-01", dataFim: "2026-11-30", anonimo: true, status: "publicado",
    cursos: ["tsi-001"], criadoEm: "2026-07-28T14:00:00Z", atualizadoEm: "2026-07-28T14:00:00Z",
    questoes: [
      qq(Q26_2.r1, "likert", "Como você avalia o desempenho dos professores de forma geral?", true, { likertEscala: "qualidade" }),
      qq(Q26_2.r2, "likert", "Os professores relacionam os conteúdos com situações práticas do mercado.", true, { likertEscala: "concordancia" }),
      qq(Q26_2.r3, "likert", "Os professores estão disponíveis para atendimento fora do horário de aula.", true, { likertEscala: "frequencia" }),
      qq(Q26_2.r4, "multipla_escolha", "Qual seria o principal ponto a melhorar na relação professor-aluno?", true, {
        opcoes: [
          { id: OPT26_2.disp, texto: "Disponibilidade para atendimento" },
          { id: OPT26_2.clar, texto: "Clareza na explicação dos conteúdos" },
          { id: OPT26_2.aval, texto: "Metodologias de avaliação" },
          { id: OPT26_2.feed, texto: "Feedback sobre o desempenho do aluno" },
        ],
      }),
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// RESPOSTAS — Questionários históricos (distribuição compacta)
// ─────────────────────────────────────────────────────────────

// 2022/1 — 16 respondentes
const R22_C1 = gerarRespostasLikert(QID.c22_1, ["q22c1-q1","q22c1-q2","q22c1-q3","q22c1-q4","q22c1-q5"], "respondente", "r22c1", "2022-06-20T10:00:00Z", [
  [0,3,7,5,1],[4,7,4,1,0],[0,0,4,7,5],[0,2,6,6,2],[2,5,6,3,0],
])
const R22_C1_PROF = [resp("r22c1-prof", QID.c22_1, "padrao", "2022-06-22T09:00:00Z", [l("q22c1-q1",4),l("q22c1-q2",2),l("q22c1-q3",5),l("q22c1-q4",4),l("q22c1-q5",3)])]

// 2022/2 — 14 respondentes
const R22_D2 = gerarRespostasLikert(QID.d22_2, ["q22d2-r1","q22d2-r2","q22d2-r3","q22d2-r4"], "respondente", "r22d2", "2022-11-25T10:00:00Z", [
  [0,1,4,7,2],[0,1,5,6,2],[0,3,5,5,1],[0,2,7,4,1],
])
const R22_D2_PROF = [resp("r22d2-prof", QID.d22_2, "padrao", "2022-11-26T09:00:00Z", [l("q22d2-r1",4),l("q22d2-r2",4),l("q22d2-r3",3),l("q22d2-r4",4)])]

// 2023/1 — 18 respondentes + 1 padrao
const R23_C1 = gerarRespostasLikert(QID.c23_1, ["q23c1-q1","q23c1-q2","q23c1-q3","q23c1-q4","q23c1-q5"], "respondente", "r23c1", "2023-06-22T10:00:00Z", [
  [0,2,7,7,2],[3,6,7,2,0],[0,0,3,9,6],[0,1,5,9,3],[1,5,7,5,0],
])
const R23_C1_PROF = [resp("r23c1-prof", QID.c23_1, "padrao", "2023-06-24T09:00:00Z", [l("q23c1-q1",4),l("q23c1-q2",2),l("q23c1-q3",5),l("q23c1-q4",5),l("q23c1-q5",3)])]
// Lucas respondeu 2023/1
const R23_C1_LUCAS = resp("r23c1-lucas", QID.c23_1, "respondente", "2023-04-10T14:00:00Z", [l("q23c1-q1",4),l("q23c1-q2",2),l("q23c1-q3",4),l("q23c1-q4",4),l("q23c1-q5",3)])

// 2023/2 — 15 respondentes + 1 padrao
const R23_D2 = gerarRespostasLikert(QID.d23_2, ["q23d2-r1","q23d2-r2","q23d2-r3","q23d2-r4"], "respondente", "r23d2", "2023-11-27T10:00:00Z", [
  [0,0,4,8,3],[0,1,4,8,2],[0,2,6,6,1],[0,2,5,6,2],
])
const R23_D2_PROF = [resp("r23d2-prof", QID.d23_2, "padrao", "2023-11-28T09:00:00Z", [l("q23d2-r1",4),l("q23d2-r2",4),l("q23d2-r3",4),l("q23d2-r4",4)])]

// 2024/1 — 19 respondentes + 1 padrao + 1 comissao
const R24_C1 = gerarRespostasLikert(QID.c24_1, ["q24c1-q1","q24c1-q2","q24c1-q3","q24c1-q4","q24c1-q5"], "respondente", "r24c1", "2024-06-18T10:00:00Z", [
  [0,2,6,9,2],[2,6,8,3,0],[0,0,2,11,6],[0,1,4,10,4],[1,5,7,6,0],
])
const R24_C1_PROF = [resp("r24c1-prof", QID.c24_1, "padrao", "2024-06-20T09:00:00Z", [l("q24c1-q1",4),l("q24c1-q2",3),l("q24c1-q3",5),l("q24c1-q4",5),l("q24c1-q5",3)])]
const R24_C1_CPA  = [resp("r24c1-cpa",  QID.c24_1, "comissao", "2024-03-28T14:00:00Z", [l("q24c1-q1",4),l("q24c1-q2",3),l("q24c1-q3",4),l("q24c1-q4",4),l("q24c1-q5",3)])]
// Lucas e Ana responderam 2024/1
const R24_C1_LUCAS = resp("r24c1-lucas", QID.c24_1, "respondente", "2024-04-05T15:00:00Z", [l("q24c1-q1",4),l("q24c1-q2",2),l("q24c1-q3",4),l("q24c1-q4",4),l("q24c1-q5",2)])
const R24_C1_ANA   = resp("r24c1-ana",   QID.c24_1, "respondente", "2024-03-20T10:00:00Z", [l("q24c1-q1",5),l("q24c1-q2",3),l("q24c1-q3",5),l("q24c1-q4",5),l("q24c1-q5",3)])

// 2024/2 — 16 respondentes + 1 padrao
const R24_D2 = gerarRespostasLikert(QID.d24_2, ["q24d2-r1","q24d2-r2","q24d2-r3","q24d2-r4"], "respondente", "r24d2", "2024-11-28T10:00:00Z", [
  [0,0,3,9,4],[0,1,3,9,3],[0,2,5,7,2],[0,1,5,8,2],
])
const R24_D2_PROF = [resp("r24d2-prof", QID.d24_2, "padrao", "2024-11-29T09:00:00Z", [l("q24d2-r1",4),l("q24d2-r2",4),l("q24d2-r3",3),l("q24d2-r4",4)])]

// 2025/1 — Respostas detalhadas (20 estudantes + 1 professor + 1 comissão + 1 Ana já contada nos 20)
const R25_1: Resposta[] = [
  resp("r25-s01", QID.c25_1, "respondente", "2025-03-12T09:14:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,2),l(Q25_1.q3,4),l(Q25_1.q4,4),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.infra),l(Q25_1.q7,4),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.prof)]),
  resp("r25-s02", QID.c25_1, "respondente", "2025-03-13T10:22:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,3),l(Q25_1.q3,5),l(Q25_1.q4,4),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.infra),l(Q25_1.q7,4),l(Q25_1.q8,4),o(Q25_1.q9,OPT25.cole),tx(Q25_1.q10,"O laboratório precisa de computadores mais modernos. Os equipamentos são muito antigos e atrapalham o aprendizado.")]),
  resp("r25-s03", QID.c25_1, "respondente", "2025-03-14T14:05:00Z", [l(Q25_1.q1,3),l(Q25_1.q2,2),l(Q25_1.q3,4),l(Q25_1.q4,3),l(Q25_1.q5,2),o(Q25_1.q6,OPT25.cont),l(Q25_1.q7,3),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.prof)]),
  resp("r25-s04", QID.c25_1, "respondente", "2025-03-15T11:30:00Z", [l(Q25_1.q1,5),l(Q25_1.q2,3),l(Q25_1.q3,5),l(Q25_1.q4,5),l(Q25_1.q5,4),o(Q25_1.q6,OPT25.cont),l(Q25_1.q7,5),l(Q25_1.q8,4),o(Q25_1.q9,OPT25.site),tx(Q25_1.q10,"O curso é muito bom no geral. Só precisamos de laboratórios melhores e mais oportunidades de networking.")]),
  resp("r25-s05", QID.c25_1, "respondente", "2025-03-17T15:48:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,1),l(Q25_1.q3,3),l(Q25_1.q4,3),l(Q25_1.q5,2),o(Q25_1.q6,OPT25.infra),l(Q25_1.q7,4),l(Q25_1.q8,2),o(Q25_1.q9,OPT25.cole),tx(Q25_1.q10,"A comunicação entre a coordenação e os alunos precisa melhorar muito.")]),
  resp("r25-s06", QID.c25_1, "respondente", "2025-03-20T09:00:00Z", [l(Q25_1.q1,3),l(Q25_1.q2,2),l(Q25_1.q3,4),l(Q25_1.q4,4),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.meto),l(Q25_1.q7,3),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.prof)]),
  resp("r25-s07", QID.c25_1, "respondente", "2025-03-22T16:15:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,3),l(Q25_1.q3,5),l(Q25_1.q4,4),l(Q25_1.q5,2),o(Q25_1.q6,OPT25.esta),l(Q25_1.q7,4),l(Q25_1.q8,4),o(Q25_1.q9,OPT25.rede),tx(Q25_1.q10,"Os professores são excelentes, mas falta mais apoio para quem quer estagiar.")]),
  resp("r25-s08", QID.c25_1, "respondente", "2025-04-01T10:40:00Z", [l(Q25_1.q1,2),l(Q25_1.q2,1),l(Q25_1.q3,3),l(Q25_1.q4,2),l(Q25_1.q5,1),o(Q25_1.q6,OPT25.infra),l(Q25_1.q7,2),l(Q25_1.q8,2),o(Q25_1.q9,OPT25.naoi),tx(Q25_1.q10,"A carga horária das disciplinas práticas é insuficiente.")]),
  resp("r25-s09", QID.c25_1, "respondente", "2025-04-03T13:22:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,4),l(Q25_1.q3,4),l(Q25_1.q4,4),l(Q25_1.q5,4),o(Q25_1.q6,OPT25.supo),l(Q25_1.q7,4),l(Q25_1.q8,4),o(Q25_1.q9,OPT25.prof)]),
  resp("r25-s10", QID.c25_1, "respondente", "2025-04-05T08:55:00Z", [l(Q25_1.q1,5),l(Q25_1.q2,3),l(Q25_1.q3,5),l(Q25_1.q4,5),l(Q25_1.q5,4),o(Q25_1.q6,OPT25.cont),l(Q25_1.q7,5),l(Q25_1.q8,5),o(Q25_1.q9,OPT25.site),tx(Q25_1.q10,"Sugiro a criação de um laboratório de inovação.")]),
  resp("r25-s11", QID.c25_1, "respondente", "2025-04-08T11:10:00Z", [l(Q25_1.q1,3),l(Q25_1.q2,2),l(Q25_1.q3,4),l(Q25_1.q4,3),l(Q25_1.q5,2),o(Q25_1.q6,OPT25.infra),l(Q25_1.q7,3),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.cole)]),
  resp("r25-s12", QID.c25_1, "respondente", "2025-04-10T14:35:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,3),l(Q25_1.q3,4),l(Q25_1.q4,4),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.supo),l(Q25_1.q7,4),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.prof),tx(Q25_1.q10,"Gostaria de mais disciplinas práticas e menos teóricas.")]),
  resp("r25-s13", QID.c25_1, "respondente", "2025-04-14T09:20:00Z", [l(Q25_1.q1,3),l(Q25_1.q2,2),l(Q25_1.q3,3),l(Q25_1.q4,3),l(Q25_1.q5,2),o(Q25_1.q6,OPT25.meto),l(Q25_1.q7,3),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.cole)]),
  resp("r25-s14", QID.c25_1, "respondente", "2025-04-16T15:00:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,3),l(Q25_1.q3,4),l(Q25_1.q4,4),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.cont),l(Q25_1.q7,4),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.prof)]),
  resp("r25-s15", QID.c25_1, "respondente", "2025-04-20T10:12:00Z", [l(Q25_1.q1,5),l(Q25_1.q2,4),l(Q25_1.q3,5),l(Q25_1.q4,5),l(Q25_1.q5,5),o(Q25_1.q6,OPT25.esta),l(Q25_1.q7,5),l(Q25_1.q8,4),o(Q25_1.q9,OPT25.site),tx(Q25_1.q10,"Seria ótimo ter mais convênios com empresas de tecnologia.")]),
  resp("r25-s16", QID.c25_1, "respondente", "2025-04-23T13:45:00Z", [l(Q25_1.q1,2),l(Q25_1.q2,2),l(Q25_1.q3,3),l(Q25_1.q4,2),l(Q25_1.q5,1),o(Q25_1.q6,OPT25.infra),l(Q25_1.q7,2),l(Q25_1.q8,2),o(Q25_1.q9,OPT25.naoi)]),
  resp("r25-s17", QID.c25_1, "respondente", "2025-05-02T09:30:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,3),l(Q25_1.q3,4),l(Q25_1.q4,4),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.supo),l(Q25_1.q7,4),l(Q25_1.q8,4),o(Q25_1.q9,OPT25.cole)]),
  resp("r25-s18", QID.c25_1, "respondente", "2025-05-08T11:00:00Z", [l(Q25_1.q1,3),l(Q25_1.q2,2),l(Q25_1.q3,4),l(Q25_1.q4,3),l(Q25_1.q5,2),o(Q25_1.q6,OPT25.infra),l(Q25_1.q7,3),l(Q25_1.q8,2),o(Q25_1.q9,OPT25.prof),tx(Q25_1.q10,"O laboratório precisa de equipamentos mais modernos.")]),
  resp("r25-s19", QID.c25_1, "respondente", "2025-05-15T14:20:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,3),l(Q25_1.q3,5),l(Q25_1.q4,4),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.meto),l(Q25_1.q7,4),l(Q25_1.q8,4),o(Q25_1.q9,OPT25.cole)]),
  resp("r25-s20", QID.c25_1, "respondente", "2025-05-20T10:45:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,3),l(Q25_1.q3,4),l(Q25_1.q4,4),l(Q25_1.q5,4),o(Q25_1.q6,OPT25.cont),l(Q25_1.q7,4),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.prof)]),
  resp("r25-prof", QID.c25_1, "padrao",  "2025-06-10T09:00:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,2),l(Q25_1.q3,5),l(Q25_1.q4,5),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.infra),l(Q25_1.q7,5),l(Q25_1.q8,3),o(Q25_1.q9,OPT25.site),tx(Q25_1.q10,"Os laboratórios precisam de renovação urgente.")]),
  resp("r25-cpa",  QID.c25_1, "comissao","2025-03-25T14:30:00Z", [l(Q25_1.q1,4),l(Q25_1.q2,3),l(Q25_1.q3,4),l(Q25_1.q4,4),l(Q25_1.q5,3),o(Q25_1.q6,OPT25.supo),l(Q25_1.q7,3),l(Q25_1.q8,4),o(Q25_1.q9,OPT25.prof),tx(Q25_1.q10,"A infraestrutura é o ponto mais crítico a ser resolvido com prioridade.")]),
]

// 2026/1 — 21 respondentes + 2 padrao + 1 comissao + Ana
const R26_C1 = gerarRespostasLikert(QID.c26_1, ["q26c1-q1","q26c1-q2","q26c1-q3","q26c1-q4","q26c1-q5"], "respondente", "r26c1", "2026-06-15T10:00:00Z", [
  [0,1,5,12,3],[1,5,9,6,0],[0,0,2,11,8],[0,1,4,11,5],[0,4,8,8,1],
])
const R26_C1_EXTRA: Resposta[] = [
  resp("r26c1-prof1", QID.c26_1, "padrao",   "2026-06-18T09:00:00Z", [l("q26c1-q1",4),l("q26c1-q2",3),l("q26c1-q3",5),l("q26c1-q4",5),l("q26c1-q5",4)]),
  resp("r26c1-prof2", QID.c26_1, "padrao",   "2026-06-18T10:00:00Z", [l("q26c1-q1",5),l("q26c1-q2",3),l("q26c1-q3",4),l("q26c1-q4",4),l("q26c1-q5",3)]),
  resp("r26c1-cpa",   QID.c26_1, "comissao", "2026-03-22T14:00:00Z", [l("q26c1-q1",4),l("q26c1-q2",3),l("q26c1-q3",4),l("q26c1-q4",4),l("q26c1-q5",3)]),
]
// Ana respondeu 2026/1
const R26_C1_ANA = resp("r26c1-ana", QID.c26_1, "respondente", "2026-03-18T10:00:00Z", [l("q26c1-q1",4),l("q26c1-q2",3),l("q26c1-q3",5),l("q26c1-q4",4),l("q26c1-q5",3)])

// 2026/2 — publicado, 3 respostas já registradas (outros usuários)
const R26_D2: Resposta[] = [
  resp("r26d2-s01", QID.d26_2, "respondente", "2026-08-05T09:10:00Z", [l(Q26_2.r1,4),l(Q26_2.r2,4),l(Q26_2.r3,3),o(Q26_2.r4,OPT26_2.clar)]),
  resp("r26d2-s02", QID.d26_2, "respondente", "2026-08-06T10:30:00Z", [l(Q26_2.r1,3),l(Q26_2.r2,3),l(Q26_2.r3,2),o(Q26_2.r4,OPT26_2.aval)]),
  resp("r26d2-s03", QID.d26_2, "respondente", "2026-08-10T11:00:00Z", [l(Q26_2.r1,5),l(Q26_2.r2,5),l(Q26_2.r3,4),o(Q26_2.r4,OPT26_2.disp)]),
]

// ─────────────────────────────────────────────────────────────
// RESPOSTAS GLOBAIS (para comissão ver tudo)
// ─────────────────────────────────────────────────────────────
export const DEMO_RESPOSTAS: Resposta[] = [
  ...R22_C1, ...R22_C1_PROF,
  ...R22_D2, ...R22_D2_PROF,
  ...R23_C1, ...R23_C1_PROF, R23_C1_LUCAS,
  ...R23_D2, ...R23_D2_PROF,
  ...R24_C1, ...R24_C1_PROF, ...R24_C1_CPA, R24_C1_LUCAS, R24_C1_ANA,
  ...R24_D2, ...R24_D2_PROF,
  ...R25_1,
  ...R26_C1, ...R26_C1_EXTRA, R26_C1_ANA,
  ...R26_D2,
]

// ─────────────────────────────────────────────────────────────
// HISTÓRICO POR USUÁRIO (para perfis respondente/padrao)
// ─────────────────────────────────────────────────────────────
// Ana: respondeu 2024/1 e 2026/1 (não respondeu 2026/2 ainda)
export const DEMO_RESPOSTAS_ANA: Resposta[] = [R24_C1_ANA, R26_C1_ANA]
export const DEMO_RESPONDIDOS_ANA = new Set([QID.c24_1, QID.c26_1])

// Lucas: respondeu 2023/1 e 2024/1 (não respondeu 2026/2 ainda)
export const DEMO_RESPOSTAS_LUCAS: Resposta[] = [R23_C1_LUCAS, R24_C1_LUCAS]
export const DEMO_RESPONDIDOS_LUCAS = new Set([QID.c23_1, QID.c24_1])
