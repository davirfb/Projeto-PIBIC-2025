import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ClipboardCheck, ClipboardList, MessageSquare, Users } from "lucide-react";
import type { Questionario } from "@/types/questionario";
import type { Resposta } from "@/types/resposta";
import type { UserRole } from "@/types/user";

interface ParticipacaoViewProps {
  questionarios: Questionario[];
  respostas: Resposta[];
}

const TIPO_LABEL: Record<UserRole, string> = {
  adm: "Administrador",
  comissao: "Comissão",
  respondente: "Estudante",
  padrao: "Professor / Servidor",
};

const TIPO_COR: Record<UserRole, string> = {
  adm:         "bg-slate-500",
  comissao:    "bg-purple-500",
  respondente: "bg-emerald-500",
  padrao:      "bg-blue-500",
};

const STATUS_CONFIG = {
  rascunho:  { label: "Rascunho",  color: "bg-slate-100 text-slate-600 border-slate-300" },
  publicado: { label: "Publicado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  encerrado: { label: "Encerrado", color: "bg-blue-50 text-blue-700 border-blue-200" },
  arquivado: { label: "Arquivado", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

function BarraHorizontal({ pct, colorClass = "bg-emerald-500" }: { pct: number; colorClass?: string }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div
        className={`${colorClass} h-2 rounded-full transition-all`}
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
      />
    </div>
  );
}

export function ParticipacaoView({ questionarios, respostas }: ParticipacaoViewProps) {
  const ativos    = questionarios.filter((q) => q.status === "publicado");
  const encerrados = questionarios.filter((q) => q.status === "encerrado" || q.status === "arquivado");
  const totalRespostas = respostas.length;

  const porTipo = (["respondente", "padrao", "comissao", "adm"] as UserRole[])
    .map((tipo) => ({ tipo, count: respostas.filter((r) => r.respondentRole === tipo).length }))
    .filter((r) => r.count > 0);

  const maxRole = Math.max(...porTipo.map((r) => r.count), 1);

  // Questionários com pelo menos 1 resposta, ordenados do mais respondido para o menos
  const questionariosComRespostas = questionarios
    .filter((q) => q.status !== "rascunho")
    .map((q) => ({
      q,
      count: respostas.filter((r) => r.questionarioId === q.id).length,
      porRole: (["respondente", "padrao", "comissao", "adm"] as UserRole[]).map((role) => ({
        role,
        count: respostas.filter((r) => r.questionarioId === q.id && r.respondentRole === role).length,
      })).filter((x) => x.count > 0),
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...questionariosComRespostas.map((x) => x.count), 1);

  const stats = [
    {
      label: "Questionários Ativos",
      value: ativos.length,
      icon: ClipboardList,
      color: "text-emerald-500",
      bg:    "bg-emerald-50",
    },
    {
      label: "Respostas Coletadas",
      value: totalRespostas,
      icon: MessageSquare,
      color: "text-blue-500",
      bg:    "bg-blue-50",
    },
    {
      label: "Aguardando Relatório",
      value: encerrados.length,
      icon: ClipboardCheck,
      color: "text-amber-500",
      bg:    "bg-amber-50",
    },
    {
      label: "Perfis Participantes",
      value: porTipo.length,
      icon: Users,
      color: "text-purple-500",
      bg:    "bg-purple-50",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Painel de Participação</h1>
        <p className="text-slate-500 mt-1">
          Acompanhe a taxa de participação por questionário e perfil de respondente.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">{stat.label}</CardTitle>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Respostas por questionario: barras proporcionais ao maximo */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Respostas por Questionário</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {questionariosComRespostas.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                Nenhum questionário publicado ainda.
              </p>
            ) : (
              <div className="space-y-5">
                {questionariosComRespostas.map(({ q, count, porRole }) => {
                  const { label, color } = STATUS_CONFIG[q.status];
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={q.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-slate-700 truncate flex-1">{q.titulo}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={`text-xs ${color}`}>{label}</Badge>
                          <span className="text-sm font-semibold text-slate-900 tabular-nums">
                            {count}
                          </span>
                        </div>
                      </div>
                      <BarraHorizontal pct={pct} />
                      {/* breakdown por papel */}
                      {porRole.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {porRole.map(({ role, count: rc }) => (
                            <span
                              key={role}
                              className="inline-flex items-center gap-1 text-xs text-slate-500"
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${TIPO_COR[role]}`}
                              />
                              {TIPO_LABEL[role]}: {rc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Respostas por perfil */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Respostas por Perfil</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {porTipo.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                Nenhuma resposta coletada ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {porTipo.map(({ tipo, count }) => {
                  const pct = Math.round((count / maxRole) * 100);
                  const share = Math.round((count / totalRespostas) * 100);
                  return (
                    <div key={tipo} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${TIPO_COR[tipo]}`} />
                          <span className="text-sm text-slate-700">{TIPO_LABEL[tipo]}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {count} <span className="text-slate-400 font-normal">({share}%)</span>
                        </span>
                      </div>
                      <BarraHorizontal pct={pct} colorClass={TIPO_COR[tipo]} />
                    </div>
                  );
                })}
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  Total: {totalRespostas} resposta(s) coletada(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
