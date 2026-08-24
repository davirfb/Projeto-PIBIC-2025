import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  ClipboardList,
  History,
  UserRound,
  ClipboardCheck,
  Wrench,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { useQuestionario } from "@/context/QuestionarioContext";
import { ResponderView } from "./ResponderView";
import { useChecklist } from "@/demo/ChecklistContext";
import type { Resposta } from "@/types/resposta";
import type { UserRole } from "@/types/user";

type Section = "disponiveis" | "respondendo" | "historico" | "notificacoes" | "perfil";

interface HomeRespondentProps {
  onLogout?: () => void;
  userName?: string;
  userId: string;
  userRole: UserRole;
  onAbrirComissao?: () => void;
}

function PendingSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-slate-500 text-sm mb-8">{description}</p>
      <div className="flex flex-col items-center justify-center h-52 rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 gap-3">
        <Wrench className="h-8 w-8" />
        <p className="text-sm font-medium">Em desenvolvimento</p>
      </div>
    </div>
  );
}

export function HomeRespondente({ onLogout, userName, userId, userRole, onAbrirComissao }: HomeRespondentProps) {
  const [section, setSection] = useState<Section>("disponiveis");
  const [respondendoId, setRespondendoId] = useState<string | null>(null);

  const { questionarios, getQuestionariosVigentes, jaRespondeu, submeterResposta, respostas } = useQuestionario();
  // extraímos só markVisited — função estável (useCallback) que não causa re-render loop
  const markVisited = useChecklist()?.markVisited;

  const vigentes = getQuestionariosVigentes();
  const pendentes = vigentes.filter((q) => !jaRespondeu(userId, q.id));
  const respondidos = vigentes.filter((q) => jaRespondeu(userId, q.id));
  const meuHistorico = respostas;

  const questionarioAtual = respondendoId
    ? vigentes.find((q) => q.id === respondendoId) ?? null
    : null;

  useEffect(() => {
    if (section === "disponiveis") markVisited?.("ver-questionarios");
    if (section === "historico")   markVisited?.("ver-historico");
    if (section === "respondendo") markVisited?.("responder");
  }, [section, markVisited]);

  async function handleSubmit(r: Resposta) {
    await submeterResposta(r);
    markVisited?.("responder");
    setRespondendoId(null);
    setSection("disponiveis");
  }

  function handleIniciarResposta(id: string) {
    setRespondendoId(id);
    setSection("respondendo");
  }

  const navSections = [
    {
      title: "Avaliações",
      items: [
        {
          label: "Questionários Disponíveis",
          icon: <ClipboardList className="h-5 w-5" />,
          active: section === "disponiveis" || section === "respondendo",
          onClick: () => { setRespondendoId(null); setSection("disponiveis"); },
        },
        {
          label: "Histórico",
          icon: <History className="h-5 w-5" />,
          active: section === "historico",
          onClick: () => setSection("historico"),
        },
        {
          label: "Notificações",
          icon: <Bell className="h-5 w-5" />,
          active: section === "notificacoes",
          onClick: () => setSection("notificacoes"),
        },
      ],
    },
    {
      title: "Conta",
      items: [
        {
          label: "Perfil",
          icon: <UserRound className="h-5 w-5" />,
          active: section === "perfil",
          onClick: () => setSection("perfil"),
        },
      ],
    },
    ...(onAbrirComissao
      ? [
          {
            title: "Comissão de Avaliação",
            items: [
              {
                label: "Painel da Comissão",
                icon: <ShieldCheck className="h-5 w-5 text-amber-500" />,
                active: false,
                onClick: onAbrirComissao,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <AppLayout
      onVoltarLogin={onLogout}
      userName={userName}
      userRoleLabel="Respondente"
      navSections={navSections}
    >
      {section === "disponiveis" && (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Olá, {userName ?? "Respondente"}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Aqui estão os questionários disponíveis para você</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pendentes</CardTitle>
                <div className="rounded-lg p-2 bg-amber-50">
                  <ClipboardList className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{pendentes.length}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {pendentes.length === 0 ? "Nenhum questionário pendente" : "Aguardando sua resposta"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Respondidos</CardTitle>
                <div className="rounded-lg p-2 bg-emerald-50">
                  <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{respondidos.length}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {respondidos.length === 0 ? "Nenhuma resposta registrada" : "Questionários concluídos"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Histórico</CardTitle>
                <div className="rounded-lg p-2 bg-blue-50">
                  <History className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{meuHistorico.length}</p>
                <p className="text-xs text-slate-400 mt-1">Pesquisas respondidas</p>
              </CardContent>
            </Card>
          </div>

          {onAbrirComissao && (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Você é membro da Comissão de Avaliação</p>
                  <p className="text-xs text-amber-700 mt-0.5">Acesse o painel para ver relatórios e dados coletados nas pesquisas.</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 font-semibold"
                onClick={onAbrirComissao}
              >
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Abrir Painel
              </Button>
            </div>
          )}

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base text-slate-900">Questionários Disponíveis</CardTitle>
                <Badge variant="outline" className="text-xs text-slate-500">
                  {vigentes.length} disponível(is)
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {vigentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                  <ClipboardCheck className="h-8 w-8" />
                  <p className="text-sm font-medium">Nenhum questionário disponível no momento.</p>
                  <p className="text-xs text-center">Você será notificado quando novos questionários forem publicados.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vigentes.map((q) => {
                    const jaResp = jaRespondeu(userId, q.id);
                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm">{q.titulo}</h3>
                          {q.descricao && (
                            <p className="text-xs text-slate-500 line-clamp-2">{q.descricao}</p>
                          )}
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <CalendarDays className="h-3 w-3" />
                            {q.dataInicio} até {q.dataFim}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {jaResp ? (
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              Respondido
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                              onClick={() => handleIniciarResposta(q.id)}
                            >
                              Responder
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {section === "respondendo" && questionarioAtual && (
        <ResponderView
          questionario={questionarioAtual}
          respondentId={questionarioAtual.anonimo ? null : userId}
          respondentRole={userRole}
          onSubmit={handleSubmit}
          onCancelar={() => { setRespondendoId(null); setSection("disponiveis"); }}
        />
      )}

      {section === "historico" && (
        <div className="p-4 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Histórico de Participação</h2>
            <p className="text-slate-500 text-sm mt-1">Questionários que você respondeu em pesquisas anteriores.</p>
          </div>
          {meuHistorico.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 gap-3">
              <History className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhuma participação registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meuHistorico.map((r) => {
                const q = questionarios.find((q) => q.id === r.questionarioId);
                return (
                  <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm text-slate-900">
                        {q?.titulo ?? `Questionário ${r.questionarioId}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Respondido em {new Date(r.submetidoEm).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 self-start sm:self-auto">
                      Concluído
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {section === "notificacoes" && (
        <PendingSection title="Notificações" description="Alertas sobre novos questionários e prazos de encerramento." />
      )}
      {section === "perfil" && (
        <PendingSection title="Perfil" description="Visualize e atualize suas informações cadastrais." />
      )}
    </AppLayout>
  );
}
