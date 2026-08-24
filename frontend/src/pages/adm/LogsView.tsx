import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollText, Search } from "lucide-react";
import type { LogEntry } from "@/types/adm";
import type { UserRole } from "@/types/user";

interface LogsViewProps {
  logs: LogEntry[];
}

const PERFIL_CONFIG: Record<UserRole, { label: string; color: string }> = {
  adm: { label: "ADM", color: "bg-purple-50 text-purple-700 border-purple-200" },
  comissao: { label: "Comissão", color: "bg-blue-50 text-blue-700 border-blue-200" },
  respondente: { label: "Respondente", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  padrao: { label: "Padrão", color: "bg-slate-100 text-slate-600 border-slate-300" },
};

export function LogsView({ logs }: LogsViewProps) {
  const [filtroPerfil, setFiltroPerfil] = useState("todos");
  const [busca, setBusca] = useState("");

  const filtrados = logs
    .filter((l) => filtroPerfil === "todos" || l.perfil === filtroPerfil)
    .filter((l) =>
      busca === "" ||
      l.acao.toLowerCase().includes(busca.toLowerCase()) ||
      l.usuario.toLowerCase().includes(busca.toLowerCase()),
    )
    .slice()
    .reverse();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Logs de Auditoria</h1>
        <p className="text-slate-500 mt-1">Histórico de ações realizadas no sistema.</p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por ação ou usuário..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 text-sm border-slate-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Perfil</label>
              <select
                value={filtroPerfil}
                onChange={(e) => setFiltroPerfil(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todos">Todos os perfis</option>
                <option value="adm">ADM</option>
                <option value="comissao">Comissão</option>
                <option value="respondente">Respondente</option>
                <option value="padrao">Padrão</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Registros</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs text-slate-500">
              {filtrados.length} entrada(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <ScrollText className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhuma atividade registrada ainda.</p>
              <p className="text-xs">As ações realizadas no sistema aparecerão aqui.</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <Search className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhum resultado para os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtrados.map((log) => {
                const { label, color } = PERFIL_CONFIG[log.perfil ?? "padrao"];
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-xs text-slate-400 font-mono shrink-0 w-36">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </span>
                    <p className="text-sm text-slate-700 flex-1">{log.acao}</p>
                    <span className="text-xs text-slate-500 shrink-0">{log.usuario}</span>
                    <Badge variant="outline" className={`text-xs shrink-0 ${color}`}>
                      {label}
                    </Badge>
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
