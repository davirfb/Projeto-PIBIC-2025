import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CalendarDays, MessageSquare, Users, BarChart3 } from "lucide-react";
import type { Questionario, QuestionarioStatus } from "@/types/questionario";
import type { Resposta } from "@/types/resposta";
import type { UserRole } from "@/types/user";
import { RelatorioDetalhe } from "./RelatorioDetalhe";

interface RelatoriosViewProps {
  questionarios: Questionario[];
  respostas: Resposta[];
}

const STATUS_CONFIG: Record<QuestionarioStatus, { label: string; color: string }> = {
  rascunho:  { label: "Rascunho",  color: "bg-slate-100 text-slate-600 border-slate-300" },
  publicado: { label: "Publicado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  encerrado: { label: "Encerrado", color: "bg-blue-50 text-blue-700 border-blue-200" },
  arquivado: { label: "Arquivado", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const TIPO_LABEL: Record<UserRole, string> = {
  adm:         "Adm",
  comissao:    "Comissão",
  respondente: "Estudante",
  padrao:      "Prof./Servidor",
};

const TIPO_COR: Record<UserRole, string> = {
  adm:         "bg-slate-400",
  comissao:    "bg-purple-400",
  respondente: "bg-emerald-400",
  padrao:      "bg-blue-400",
};

export function RelatoriosView({ questionarios, respostas }: RelatoriosViewProps) {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const encerrados = questionarios.filter(
    (q) => q.status === "encerrado" || q.status === "arquivado",
  );

  const anos = [...new Set(encerrados.map((q) => q.dataFim.slice(0, 4)))].sort().reverse();

  const tiposPresentes = [
    ...new Set(respostas.map((r) => r.respondentRole)),
  ] as UserRole[];

  const filtrados = encerrados.filter((q) => {
    const passaPeriodo = filtroPeriodo === "todos" || q.dataFim.startsWith(filtroPeriodo);
    const passaTipo =
      filtroTipo === "todos" ||
      respostas.some((r) => r.questionarioId === q.id && r.respondentRole === filtroTipo);
    return passaPeriodo && passaTipo;
  });

  // Totais para o sumário
  const totalRespostasEncerrados = respostas.filter((r) =>
    encerrados.some((q) => q.id === r.questionarioId),
  ).length;

  const mediaRespostas =
    encerrados.length > 0
      ? Math.round(totalRespostasEncerrados / encerrados.length)
      : 0;

  if (selecionadoId) {
    const q = questionarios.find((q) => q.id === selecionadoId);
    if (q) {
      return (
        <RelatorioDetalhe
          questionario={q}
          respostas={respostas}
          onVoltar={() => setSelecionadoId(null)}
        />
      );
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Relatórios</h1>
        <p className="text-slate-500 mt-1">
          Resultados das avaliações encerradas. Disponíveis após o período de vigência.
        </p>
      </div>

      {/* Sumário geral */}
      {encerrados.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">Relatórios Disponíveis</CardTitle>
              <div className="rounded-lg p-2 bg-blue-50">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{encerrados.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">Total de Respostas</CardTitle>
              <div className="rounded-lg p-2 bg-emerald-50">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalRespostasEncerrados}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">Média por Avaliação</CardTitle>
              <div className="rounded-lg p-2 bg-amber-50">
                <BarChart3 className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{mediaRespostas}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Período</label>
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todos">Todos os períodos</option>
                {anos.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Perfil de respondente</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todos">Todos os perfis</option>
                {tiposPresentes.map((tipo) => (
                  <option key={tipo} value={tipo}>{TIPO_LABEL[tipo]}</option>
                ))}
              </select>
            </div>

            {(filtroPeriodo !== "todos" || filtroTipo !== "todos") && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-600 text-xs"
                  onClick={() => { setFiltroPeriodo("todos"); setFiltroTipo("todos"); }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de questionários encerrados */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-slate-900">Questionários Encerrados</CardTitle>
            <Badge variant="outline" className="text-xs text-slate-500">
              {filtrados.length} resultado(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {encerrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <FileText className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhum questionário encerrado ainda.</p>
              <p className="text-xs">Os relatórios ficam disponíveis após o encerramento do período de vigência.</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <FileText className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhum resultado para os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtrados.map((q) => {
                const respostasDoQ = respostas.filter((r) => r.questionarioId === q.id);
                const count = respostasDoQ.length;
                const { label, color } = STATUS_CONFIG[q.status];

                // Breakdown por perfil
                const breakdown = (["respondente", "padrao", "comissao"] as UserRole[])
                  .map((role) => ({ role, n: respostasDoQ.filter((r) => r.respondentRole === role).length }))
                  .filter((x) => x.n > 0);

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{q.titulo}</h3>
                        <Badge variant="outline" className={`text-xs shrink-0 ${color}`}>{label}</Badge>
                      </div>
                      {q.descricao && (
                        <p className="text-xs text-slate-500 line-clamp-1">{q.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {q.dataInicio} ate {q.dataFim}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {count} resposta(s)
                        </span>
                      </div>
                      {/* Breakdown de perfis */}
                      {breakdown.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Users className="h-3 w-3 text-slate-300" />
                          {breakdown.map(({ role, n }) => (
                            <span
                              key={role}
                              className="inline-flex items-center gap-1 text-xs text-slate-500"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${TIPO_COR[role]}`} />
                              {TIPO_LABEL[role]}: {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
                      onClick={() => setSelecionadoId(q.id)}
                    >
                      Ver Relatório
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
