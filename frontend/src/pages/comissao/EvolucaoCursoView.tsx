import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TrendingUp, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Eixo } from "@/types/questionario";
import { EIXO_CORES } from "@/types/questionario";

const ANOS = [2021, 2022, 2023, 2024, 2025];


function hashId(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h;
}

function gerarProgressao(eixoId: string): number[] {
  const h = hashId(eixoId);
  const base = 2.6 + (h % 14) * 0.1;
  return ANOS.map((_, i) => {
    const ciclo = Math.sin((h * 0.05 + i) * 1.2) * 0.25;
    const tendencia = i * 0.13;
    return parseFloat(Math.max(1, Math.min(5, base + ciclo + tendencia)).toFixed(2));
  });
}

function gerarDadosGrafico(eixos: Eixo[]) {
  return ANOS.map((ano, i) => {
    const ponto: Record<string, number | string> = { ano };
    for (const eixo of eixos) {
      ponto[eixo.nome] = gerarProgressao(eixo.id)[i];
    }
    return ponto;
  });
}

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function EvolucaoCursoView() {
  const [eixos, setEixos] = useState<Eixo[]>([]);
  const [novoNome, setNovoNome] = useState("");

  function adicionarEixo() {
    const nome = novoNome.trim();
    if (!nome) return;
    const id = gerarId();
    const cor = EIXO_CORES[eixos.length % EIXO_CORES.length];
    setEixos((prev) => [...prev, { id, nome, cor }]);
    setNovoNome("");
  }

  function removerEixo(id: string) {
    setEixos((prev) => prev.filter((e) => e.id !== id));
  }

  const dadosGrafico = gerarDadosGrafico(eixos);

  const ultimoAno = ANOS[ANOS.length - 1];
  const anoAnterior = ANOS[ANOS.length - 2];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Evolução por Curso</h1>
        <p className="text-slate-500 mt-1">
          Acompanhe a evolução dos eixos de avaliação ao longo dos anos.
        </p>
        <Badge variant="outline" className="mt-2 text-xs text-emerald-700 border-emerald-200 bg-emerald-50">
          Análise e Desenvolvimento de Sistemas
        </Badge>
      </div>

      {/* Cards de resumo do último ano */}
      {eixos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {eixos.slice(0, 4).map((eixo) => {
            const progressao = gerarProgressao(eixo.id);
            const atual = progressao[ANOS.length - 1];
            const anterior = progressao[ANOS.length - 2];
            const delta = atual - anterior;
            return (
              <Card key={eixo.id} className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: eixo.cor }} />
                    <CardTitle className="text-xs font-medium text-slate-600 truncate">{eixo.nome}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{atual.toFixed(2)}</p>
                  <p className="text-xs mt-1" style={{ color: delta >= 0 ? "#10b981" : "#ef4444" }}>
                    {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(2)} vs {anoAnterior}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Configurar eixos */}
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Eixos de Avaliação</CardTitle>
          <p className="text-sm text-slate-500">
            Configure os eixos que serão acompanhados no gráfico. Cada comissão adapta conforme o curso.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {eixos.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-500">
              <Info className="h-4 w-4 shrink-0" />
              Nenhum eixo configurado. Adicione abaixo para visualizar o gráfico.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {eixos.map((eixo) => (
                <div
                  key={eixo.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5"
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: eixo.cor }} />
                  <span className="text-sm text-slate-700">{eixo.nome}</span>
                  <button
                    onClick={() => removerEixo(eixo.id)}
                    className="ml-1 text-slate-300 hover:text-red-400 transition-colors"
                    aria-label={`Remover ${eixo.nome}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 max-w-sm">
            <Input
              placeholder="Nome do novo eixo..."
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarEixo()}
              className="text-sm border-slate-200"
            />
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
              onClick={adicionarEixo}
              disabled={!novoNome.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de linha */}
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-base text-slate-900">
              Evolução Histórica — {ANOS[0]}–{ultimoAno}
            </CardTitle>
          </div>
          <p className="text-sm text-slate-500">
            Média das avaliações por eixo ao longo dos anos (escala 1–5).
          </p>
        </CardHeader>
        <CardContent>
          {eixos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
              <TrendingUp className="h-8 w-8" />
              <p className="text-sm">Adicione eixos acima para visualizar o gráfico.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={dadosGrafico} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="ano"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
                  }}
                  formatter={(value, name) => [typeof value === "number" ? value.toFixed(2) : value, name]}
                  labelFormatter={(label) => `Ano: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                {eixos.map((eixo) => (
                  <Line
                    key={eixo.id}
                    type="monotone"
                    dataKey={eixo.nome}
                    stroke={eixo.cor}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: eixo.cor }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: eixo.cor }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
