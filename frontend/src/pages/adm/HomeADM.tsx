import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cog,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  Users,
  TrendingUp,
  Activity,
  ClipboardList,
  ChevronLeft,
} from "lucide-react";
import { useQuestionario } from "@/context/QuestionarioContext";
import { UsuariosView } from "./UsuariosView";
import { CursosView } from "./CursosView";
import { LogsView } from "./LogsView";
import { ConfiguracoesView } from "./ConfiguracoesView";
import { QuestionariosView } from "@/pages/comissao/HomeComissao";
import { QuestionarioForm } from "@/pages/comissao/QuestionarioForm";
import { ParticipacaoView } from "@/pages/comissao/ParticipacaoView";
import { RelatoriosView } from "@/pages/comissao/RelatoriosView";
import { EvolucaoCursoView } from "@/pages/comissao/EvolucaoCursoView";
import type { UsuarioAdm, Curso, Turma, LogEntry, Configuracoes } from "@/types/adm";
import type { UserRole, UserSubType } from "@/types/user";
import type { Questionario } from "@/types/questionario";

type Section = "dashboard" | "usuarios" | "cursos" | "curso_questionarios" | "logs" | "configuracoes";
type QuestionarioSub = "lista" | "form" | "participacao" | "relatorios" | "evolucao";

interface HomeADMProps {
  onLogout?: () => void;
  userName?: string;
}

const CONFIG_INICIAL: Configuracoes = {
  nomeInstituicao: "Instituto Federal de Brasília",
  campus: "Campus Brasília",
  limiarParticipacao: 70,
  emailSuporte: "suporte@ifb.edu.br",
};

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fromDbUsuario(raw: Record<string, unknown>): UsuarioAdm {
  const comissaoCursos = (raw.comissao_cursos as { curso_id: string }[] ?? []).map((c) => c.curso_id);
  const respondenteCursos = (raw.respondente_cursos as { curso_id: string }[] ?? []).map((c) => c.curso_id);
  return {
    id: raw.id as string,
    nome: raw.nome as string,
    email: raw.email as string,
    perfil: raw.role as UserRole,
    subTipo: (raw.sub_type as UserSubType) ?? undefined,
    cursoIds: [...new Set([...comissaoCursos, ...respondenteCursos])],
    ativo: raw.ativo as boolean,
    criadoEm: String(raw.criado_em),
  };
}

function fromDbCurso(raw: Record<string, unknown>): Curso {
  return {
    id: raw.id as string,
    nome: raw.nome as string,
    codigo: raw.codigo as string,
    turmas: [],
  };
}

export function HomeADM({ onLogout, userName }: HomeADMProps) {
  const [section, setSection] = useState<Section>("dashboard");
  const [usuarios, setUsuarios] = useState<UsuarioAdm[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<Configuracoes>(CONFIG_INICIAL);
  const [cursoAtivo, setCursoAtivo] = useState<Curso | null>(null);
  const [qSub, setQSub] = useState<QuestionarioSub>("lista");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { questionarios, respostas, upsert, encerrar, arquivar, excluir } = useQuestionario();

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*, comissao_cursos(curso_id), respondente_cursos(curso_id)")
      .then(({ data }) => {
        if (data) setUsuarios((data as Record<string, unknown>[]).map(fromDbUsuario));
      });
    supabase
      .from("cursos")
      .select("*")
      .then(({ data }) => {
        if (data) setCursos((data as Record<string, unknown>[]).map(fromDbCurso));
      });
  }, []);

  function registrarLog(acao: string) {
    const entry: LogEntry = {
      id: gerarId(),
      acao,
      usuario: userName ?? "Administrador",
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, entry]);
  }

  async function handleSalvarUsuario(u: UsuarioAdm, senha: string) {
    const existe = usuarios.some((p) => p.id === u.id);
    try {
      if (existe) {
        const { error } = await supabase
          .from("profiles")
          .update({
            nome: u.nome,
            role: u.perfil,
            sub_type: u.subTipo ?? null,
            ativo: u.ativo,
          })
          .eq("id", u.id);
        if (error) throw error;

        // Sincroniza associações de curso
        await supabase.from("comissao_cursos").delete().eq("usuario_id", u.id);
        await supabase.from("respondente_cursos").delete().eq("usuario_id", u.id);
        if (u.perfil === "comissao" && u.cursoIds.length > 0) {
          await supabase.from("comissao_cursos").insert(
            u.cursoIds.map((cid) => ({ usuario_id: u.id, curso_id: cid })),
          );
        } else if ((u.perfil === "respondente" || u.perfil === "padrao") && u.cursoIds.length > 0) {
          await supabase.from("respondente_cursos").insert(
            u.cursoIds.map((cid) => ({ usuario_id: u.id, curso_id: cid })),
          );
        }

        const saved = fromDbUsuario({
          ...u,
          role: u.perfil,
          sub_type: u.subTipo ?? null,
          comissao_cursos: u.perfil === "comissao" ? u.cursoIds.map((cid) => ({ curso_id: cid })) : [],
          respondente_cursos: (u.perfil === "respondente" || u.perfil === "padrao") ? u.cursoIds.map((cid) => ({ curso_id: cid })) : [],
          criado_em: u.criadoEm,
        });
        setUsuarios((prev) => prev.map((p) => (p.id === u.id ? saved : p)));
        registrarLog(`Usuário editado: ${saved.nome} (${saved.email})`);
      } else {
        const { data, error } = await supabase.functions.invoke("create-user", {
          body: {
            nome: u.nome,
            email: u.email,
            senha,
            role: u.perfil,
            sub_type: u.subTipo ?? null,
            curso_ids: u.cursoIds,
          },
        });
        if (error) throw error;
        const raw = data as Record<string, unknown>;
        const saved = fromDbUsuario({
          ...raw,
          comissao_cursos: u.perfil === "comissao" ? u.cursoIds.map((cid) => ({ curso_id: cid })) : [],
          respondente_cursos: (u.perfil === "respondente" || u.perfil === "padrao") ? u.cursoIds.map((cid) => ({ curso_id: cid })) : [],
        });
        setUsuarios((prev) => [...prev, saved]);
        registrarLog(`Usuário criado: ${saved.nome} (${saved.email})`);
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao salvar usuário.");
    }
  }

  async function handleExcluirUsuario(id: string) {
    const u = usuarios.find((u) => u.id === id);
    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: id },
      });
      if (error) throw error;
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      if (u) registrarLog(`Usuário excluído: ${u.nome} (${u.email})`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao excluir usuário.");
    }
  }

  async function handleToggleAtivo(id: string) {
    const u = usuarios.find((u) => u.id === id);
    if (!u) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ativo: !u.ativo })
        .eq("id", id);
      if (error) throw error;
      setUsuarios((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ativo: !u.ativo } : p)),
      );
      registrarLog(`Usuário ${u.ativo ? "desativado" : "ativado"}: ${u.nome}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao alterar status do usuário.");
    }
  }

  async function handleSalvarCurso(c: Curso) {
    const existe = cursos.some((p) => p.id === c.id);
    try {
      if (existe) {
        const { data, error } = await supabase
          .from("cursos")
          .update({ nome: c.nome })
          .eq("id", c.id)
          .select("*")
          .single();
        if (error) throw error;
        const saved = fromDbCurso(data as Record<string, unknown>);
        setCursos((prev) =>
          prev.map((p) => (p.id === c.id ? { ...saved, turmas: p.turmas } : p)),
        );
        registrarLog(`Curso editado: ${saved.nome} (${saved.codigo})`);
      } else {
        const { data, error } = await supabase
          .from("cursos")
          .insert({ nome: c.nome, codigo: c.codigo })
          .select("*")
          .single();
        if (error) throw error;
        const saved = fromDbCurso(data as Record<string, unknown>);
        setCursos((prev) => [...prev, saved]);
        registrarLog(`Curso criado: ${saved.nome} (${saved.codigo})`);
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao salvar curso.");
    }
  }

  async function handleExcluirCurso(id: string) {
    const c = cursos.find((c) => c.id === id);
    try {
      const { error } = await supabase.from("cursos").delete().eq("id", id);
      if (error) throw error;
      setCursos((prev) => prev.filter((c) => c.id !== id));
      if (c) registrarLog(`Curso excluído: ${c.nome}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao excluir curso.");
    }
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

  function handleAbrirQuestionarios(curso: Curso) {
    setCursoAtivo(curso);
    setQSub("lista");
    setEditandoId(null);
    setSection("curso_questionarios");
  }

  function handleSalvarConfig(c: Configuracoes) {
    setConfig(c);
    registrarLog("Configurações da plataforma atualizadas");
  }

  const ativosCount = usuarios.filter((u) => u.ativo).length;
  const publicadosCount = questionarios.filter((q) => q.status === "publicado").length;
  const logsRecentes = logs.slice(-5).reverse();

  const questionariosDoCurso = cursoAtivo
    ? questionarios.filter((q) => q.cursos.includes(cursoAtivo.id))
    : [];
  const respostasDoCurso = cursoAtivo
    ? respostas.filter((r) => questionariosDoCurso.some((q) => q.id === r.questionarioId))
    : [];

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
          active: section === "cursos" || section === "curso_questionarios",
          onClick: () => setSection("cursos"),
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
      {apiError && (
        <div className="mx-8 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>{apiError}</span>
          <button
            type="button"
            className="text-red-400 hover:text-red-600 font-medium ml-4"
            onClick={() => setApiError(null)}
          >
            ✕
          </button>
        </div>
      )}

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
          cursos={cursos}
          onSalvar={(u, senha) => { void handleSalvarUsuario(u, senha); }}
          onExcluir={(id) => { void handleExcluirUsuario(id); }}
          onToggleAtivo={(id) => { void handleToggleAtivo(id); }}
        />
      )}

      {section === "cursos" && (
        <CursosView
          cursos={cursos}
          onSalvarCurso={(c) => { void handleSalvarCurso(c); }}
          onExcluirCurso={(id) => { void handleExcluirCurso(id); }}
          onSalvarTurma={handleSalvarTurma}
          onExcluirTurma={handleExcluirTurma}
          onAbrirQuestionarios={handleAbrirQuestionarios}
        />
      )}

      {section === "curso_questionarios" && cursoAtivo && (
        <>
          <div className="border-b border-slate-200 bg-white px-8 pt-4 space-y-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 -ml-2 mb-2 flex items-center gap-1"
              onClick={() => setSection("cursos")}
            >
              <ChevronLeft className="h-4 w-4" />
              Cursos e Turmas
            </Button>
            <div className="flex items-baseline gap-3 pb-1">
              <h2 className="text-lg font-semibold text-slate-900">{cursoAtivo.nome}</h2>
              <span className="text-sm text-slate-400">{cursoAtivo.codigo}</span>
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {(
                [
                  { key: "lista", label: "Questionários" },
                  { key: "form", label: "Novo Questionário" },
                  { key: "participacao", label: "Participação" },
                  { key: "relatorios", label: "Relatórios" },
                  { key: "evolucao", label: "Evolução por Curso" },
                ] as { key: QuestionarioSub; label: string }[]
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setQSub(key); if (key !== "form") setEditandoId(null); }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    qSub === key
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {qSub === "lista" && (
            <QuestionariosView
              questionarios={questionariosDoCurso}
              onNovo={() => { setEditandoId(null); setQSub("form"); }}
              onEditar={(id) => { setEditandoId(id); setQSub("form"); }}
              onEncerrar={encerrar}
              onArquivar={arquivar}
              onExcluir={excluir}
            />
          )}
          {qSub === "form" && (
            <QuestionarioForm
              inicial={editandoId ? questionarios.find((q) => q.id === editandoId) : undefined}
              cursosDisponiveis={cursoAtivo ? [{ id: cursoAtivo.id, nome: cursoAtivo.nome }] : []}
              onRascunho={async (q: Questionario) => { await upsert(q); setEditandoId(null); setQSub("lista"); }}
              onPublicar={async (q: Questionario) => { await upsert(q); setEditandoId(null); setQSub("lista"); }}
              onCancelar={() => { setEditandoId(null); setQSub("lista"); }}
            />
          )}
          {qSub === "participacao" && (
            <ParticipacaoView questionarios={questionariosDoCurso} respostas={respostasDoCurso} />
          )}
          {qSub === "relatorios" && (
            <RelatoriosView questionarios={questionariosDoCurso} respostas={respostasDoCurso} />
          )}
          {qSub === "evolucao" && <EvolucaoCursoView />}
        </>
      )}

      {section === "logs" && <LogsView logs={logs} />}

      {section === "configuracoes" && (
        <ConfiguracoesView config={config} onSalvar={handleSalvarConfig} />
      )}
    </AppLayout>
  );
}
