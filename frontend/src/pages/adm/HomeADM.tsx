import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Cog,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useQuestionario } from "@/context/QuestionarioContext";
import { UsuariosView } from "./UsuariosView";
import { CursosView } from "./CursosView";
import { LogsView } from "./LogsView";
import { ConfiguracoesView } from "./ConfiguracoesView";
import type { UsuarioAdm, Curso, Turma, LogEntry, Configuracoes } from "@/types/adm";
import type { UserRole } from "@/types/user";

type Section = "dashboard" | "usuarios" | "cursos" | "questionarios" | "logs" | "configuracoes";

interface HomeADMProps {
  onLogout?: () => void;
  userName?: string;
}

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", color: "bg-slate-100 text-slate-600 border-slate-300" },
  publicado: { label: "Publicado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  encerrado: { label: "Encerrado", color: "bg-blue-50 text-blue-700 border-blue-200" },
  arquivado: { label: "Arquivado", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const USUARIOS_INICIAIS: UsuarioAdm[] = [
  { id: "u1", nome: "Administrador", email: "adm@ifb.edu.br", perfil: "adm", ativo: true, criadoEm: "2026-01-01T00:00:00.000Z" },
  { id: "u2", nome: "Comissão IFB", email: "comissao@ifb.edu.br", perfil: "comissao", ativo: true, criadoEm: "2026-01-01T00:00:00.000Z" },
  { id: "u3", nome: "Respondente", email: "respondente@ifb.edu.br", perfil: "respondente", subTipo: "aluno", ativo: true, criadoEm: "2026-01-01T00:00:00.000Z" },
  { id: "u4", nome: "Padrão", email: "padrao@ifb.edu.br", perfil: "padrao", subTipo: "professor", ativo: true, criadoEm: "2026-01-01T00:00:00.000Z" },
];

const CURSOS_INICIAIS: Curso[] = [
  {
    id: "c1",
    nome: "Análise e Desenvolvimento de Sistemas",
    codigo: "ADS",
    turmas: [
      { id: "t1", nome: "ADS 2024/1", ano: 2024, semestre: 1 },
      { id: "t2", nome: "ADS 2024/2", ano: 2024, semestre: 2 },
    ],
  },
  {
    id: "c2",
    nome: "Administração",
    codigo: "ADM",
    turmas: [
      { id: "t3", nome: "ADM 2024/1", ano: 2024, semestre: 1 },
      { id: "t4", nome: "ADM 2024/2", ano: 2024, semestre: 2 },
    ],
  },
];

const CONFIG_INICIAL: Configuracoes = {
  nomeInstituicao: "Instituto Federal de Brasília",
  campus: "Campus Brasília",
  limiarParticipacao: 70,
  emailSuporte: "suporte@ifb.edu.br",
};

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function HomeADM({ onLogout, userName }: HomeADMProps) {
  const [section, setSection] = useState<Section>("dashboard");
  const [usuarios, setUsuarios] = useState<UsuarioAdm[]>(USUARIOS_INICIAIS);
  const [cursos, setCursos] = useState<Curso[]>(CURSOS_INICIAIS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<Configuracoes>(CONFIG_INICIAL);

  const { questionarios, respostas } = useQuestionario();

  function registrarLog(acao: string, perfil: UserRole = "adm") {
    const entry: LogEntry = {
      id: gerarId(),
      acao,
      usuario: userName ?? "Administrador",
      perfil,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, entry]);
  }

  function handleSalvarUsuario(u: UsuarioAdm) {
    setUsuarios((prev) => {
      const existe = prev.some((p) => p.id === u.id);
      return existe ? prev.map((p) => (p.id === u.id ? u : p)) : [...prev, u];
    });
    const acao = usuarios.some((p) => p.id === u.id)
      ? `Usuário editado: ${u.nome} (${u.email})`
      : `Usuário criado: ${u.nome} (${u.email})`;
    registrarLog(acao);
  }

  function handleExcluirUsuario(id: string) {
    const u = usuarios.find((u) => u.id === id);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    if (u) registrarLog(`Usuário excluído: ${u.nome} (${u.email})`);
  }

  function handleToggleAtivo(id: string) {
    const u = usuarios.find((u) => u.id === id);
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)),
    );
    if (u) registrarLog(`Usuário ${u.ativo ? "desativado" : "ativado"}: ${u.nome}`);
  }

  function handleSalvarCurso(c: Curso) {
    setCursos((prev) => {
      const existe = prev.some((p) => p.id === c.id);
      return existe ? prev.map((p) => (p.id === c.id ? c : p)) : [...prev, c];
    });
    const acao = cursos.some((p) => p.id === c.id)
      ? `Curso editado: ${c.nome} (${c.codigo})`
      : `Curso criado: ${c.nome} (${c.codigo})`;
    registrarLog(acao);
  }

  function handleExcluirCurso(id: string) {
    const c = cursos.find((c) => c.id === id);
    setCursos((prev) => prev.filter((c) => c.id !== id));
    if (c) registrarLog(`Curso excluído: ${c.nome}`);
  }

  function handleSalvarTurma(cursoId: string, t: Turma) {
    setCursos((prev) =>
      prev.map((c) => {
        if (c.id !== cursoId) return c;
        const existe = c.turmas.some((tu) => tu.id === t.id);
        return {
          ...c,
          turmas: existe ? c.turmas.map((tu) => (tu.id === t.id ? t : tu)) : [...c.turmas, t],
        };
      }),
    );
    const curso = cursos.find((c) => c.id === cursoId);
    registrarLog(`Turma adicionada: ${t.nome} → ${curso?.nome ?? cursoId}`);
  }

  function handleExcluirTurma(cursoId: string, turmaId: string) {
    const curso = cursos.find((c) => c.id === cursoId);
    const turma = curso?.turmas.find((t) => t.id === turmaId);
    setCursos((prev) =>
      prev.map((c) =>
        c.id === cursoId ? { ...c, turmas: c.turmas.filter((t) => t.id !== turmaId) } : c,
      ),
    );
    if (turma) registrarLog(`Turma excluída: ${turma.nome}`);
  }

  function handleSalvarConfig(c: Configuracoes) {
    setConfig(c);
    registrarLog("Configurações da plataforma atualizadas");
  }

  const ativosCount = usuarios.filter((u) => u.ativo).length;
  const publicadosCount = questionarios.filter((q) => q.status === "publicado").length;
  const logsRecentes = logs.slice(-5).reverse();

  const navSections = [
    {
      title: "Menu Principal",
      items: [
        {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          active: section === "dashboard",
          onClick: () => setSection("dashboard"),
        },
      ],
    },
    {
      title: "Administração",
      items: [
        {
          label: "Usuários",
          icon: <Users className="h-5 w-5" />,
          active: section === "usuarios",
          onClick: () => setSection("usuarios"),
        },
        {
          label: "Cursos e Turmas",
          icon: <GraduationCap className="h-5 w-5" />,
          active: section === "cursos",
          onClick: () => setSection("cursos"),
        },
        {
          label: "Questionários",
          icon: <ClipboardList className="h-5 w-5" />,
          active: section === "questionarios",
          onClick: () => setSection("questionarios"),
        },
        {
          label: "Logs de Auditoria",
          icon: <ScrollText className="h-5 w-5" />,
          active: section === "logs",
          onClick: () => setSection("logs"),
        },
        {
          label: "Configurações",
          icon: <Cog className="h-5 w-5" />,
          active: section === "configuracoes",
          onClick: () => setSection("configuracoes"),
        },
      ],
    },
  ];

  return (
    <AppLayout
      onVoltarLogin={onLogout}
      userName={userName}
      userRoleLabel="Administrador"
      navSections={navSections}
    >
      {section === "dashboard" && (
        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Bem-vindo, {userName ?? "Administrador"}
            </h1>
            <p className="text-slate-500 mt-1">Visão geral do sistema</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Usuários Ativos", value: ativosCount, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Cursos Cadastrados", value: cursos.length, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Questionários Ativos", value: publicadosCount, icon: ClipboardList, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Respostas Coletadas", value: respostas.length, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
            ].map((stat) => (
              <Card key={stat.label} className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-base text-slate-900">Atividade Recente</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {logsRecentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
                  <p className="text-sm">Nenhuma atividade registrada.</p>
                  <p className="text-xs">As ações dos usuários aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logsRecentes.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-xs text-slate-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                      </span>
                      <span className="text-slate-700 flex-1">{log.acao}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {section === "usuarios" && (
        <UsuariosView
          usuarios={usuarios}
          onSalvar={handleSalvarUsuario}
          onExcluir={handleExcluirUsuario}
          onToggleAtivo={handleToggleAtivo}
        />
      )}

      {section === "cursos" && (
        <CursosView
          cursos={cursos}
          onSalvarCurso={handleSalvarCurso}
          onExcluirCurso={handleExcluirCurso}
          onSalvarTurma={handleSalvarTurma}
          onExcluirTurma={handleExcluirTurma}
        />
      )}

      {section === "questionarios" && (
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Questionários</h1>
            <p className="text-slate-500 mt-1">Visão geral de todos os questionários criados pelas Comissões.</p>
          </div>
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-900">Todos os Questionários</CardTitle>
                <Badge variant="outline" className="text-xs text-slate-500">
                  {questionarios.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {questionarios.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                  <ClipboardList className="h-8 w-8" />
                  <p className="text-sm font-medium">Nenhum questionário criado ainda.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questionarios.map((q) => {
                    const { label, color } = STATUS_CONFIG[q.status];
                    const totalRespostas = respostas.filter((r) => r.questionarioId === q.id).length;
                    return (
                      <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-slate-900 truncate">{q.titulo}</span>
                            <Badge variant="outline" className={`text-xs shrink-0 ${color}`}>{label}</Badge>
                          </div>
                          <p className="text-xs text-slate-400">{q.dataInicio} → {q.dataFim}</p>
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">{totalRespostas} resposta(s)</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {section === "logs" && <LogsView logs={logs} />}

      {section === "configuracoes" && (
        <ConfiguracoesView config={config} onSalvar={handleSalvarConfig} />
      )}
    </AppLayout>
  );
}
