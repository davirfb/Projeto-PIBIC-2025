import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Download, FlaskConical, SlidersHorizontal, X, FileText } from "lucide-react";
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
import { useQuestionario } from "@/context/QuestionarioContext";
import { useChecklist } from "@/demo/ChecklistContext";
import type { Eixo } from "@/types/questionario";
import { EIXO_CORES } from "@/types/questionario";

const ANOS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export const EIXOS_PADRAO_TSI: Eixo[] = [
  { id: "eixo-infra",    nome: "Infraestrutura",        cor: EIXO_CORES[0] },
  { id: "eixo-docente",  nome: "Corpo Docente",          cor: EIXO_CORES[1] },
  { id: "eixo-conteudo", nome: "Conteúdo Curricular",    cor: EIXO_CORES[2] },
  { id: "eixo-gestao",   nome: "Comunicação e Gestão",   cor: EIXO_CORES[3] },
  { id: "eixo-emprego",  nome: "Empregabilidade",        cor: EIXO_CORES[4] },
];

function hashId(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h;
}

function gerarProgressao(eixoId: string): number[] {
  const h = hashId(eixoId);
  const base = 2.2 + (h % 14) * 0.1;
  return ANOS.map((_, i) => {
    const ciclo = Math.sin((h * 0.05 + i) * 1.1) * 0.2;
    const tendencia = i * 0.12;
    return parseFloat(Math.max(1, Math.min(5, base + ciclo + tendencia)).toFixed(2));
  });
}

function gerarDadosGrafico(eixos: Eixo[], anosFilter?: number[]) {
  const anos = anosFilter ?? ANOS;
  return anos.map((ano) => {
    const idx = ANOS.indexOf(ano);
    const ponto: Record<string, number | string> = { ano };
    for (const eixo of eixos) {
      const prog = gerarProgressao(eixo.id);
      ponto[eixo.nome] = idx >= 0 ? prog[idx] : 0;
    }
    return ponto;
  });
}

interface PeriodoHistorico {
  periodo: string;
  ano: number;
  total: number;
  estudantes: number;
  professores: number;
  coordenadores: number;
  tecnicos: number;
  comissao: number;
  mediaGeral: number;
}

const HISTORICO_SIMULADO: PeriodoHistorico[] = [
  { periodo: "2015/1", ano: 2015, total: 12, estudantes: 10, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.1 },
  { periodo: "2015/2", ano: 2015, total: 11, estudantes: 9,  professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.0 },
  { periodo: "2016/1", ano: 2016, total: 13, estudantes: 11, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.2 },
  { periodo: "2016/2", ano: 2016, total: 12, estudantes: 10, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.1 },
  { periodo: "2017/1", ano: 2017, total: 14, estudantes: 12, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.2 },
  { periodo: "2017/2", ano: 2017, total: 13, estudantes: 11, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.3 },
  { periodo: "2018/1", ano: 2018, total: 15, estudantes: 13, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.3 },
  { periodo: "2018/2", ano: 2018, total: 14, estudantes: 12, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.4 },
  { periodo: "2019/1", ano: 2019, total: 16, estudantes: 13, professores: 1, coordenadores: 1, tecnicos: 1, comissao: 0, mediaGeral: 3.4 },
  { periodo: "2019/2", ano: 2019, total: 15, estudantes: 12, professores: 1, coordenadores: 1, tecnicos: 1, comissao: 0, mediaGeral: 3.5 },
  { periodo: "2020/1", ano: 2020, total: 10, estudantes: 8,  professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.2 },
  { periodo: "2020/2", ano: 2020, total: 9,  estudantes: 7,  professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.0 },
  { periodo: "2021/1", ano: 2021, total: 14, estudantes: 12, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.3 },
  { periodo: "2021/2", ano: 2021, total: 15, estudantes: 13, professores: 1, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.4 },
  { periodo: "2022/1", ano: 2022, total: 17, estudantes: 14, professores: 1, coordenadores: 1, tecnicos: 1, comissao: 0, mediaGeral: 3.5 },
  { periodo: "2022/2", ano: 2022, total: 15, estudantes: 12, professores: 2, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.5 },
  { periodo: "2023/1", ano: 2023, total: 19, estudantes: 16, professores: 1, coordenadores: 1, tecnicos: 1, comissao: 0, mediaGeral: 3.6 },
  { periodo: "2023/2", ano: 2023, total: 16, estudantes: 13, professores: 2, coordenadores: 1, tecnicos: 0, comissao: 0, mediaGeral: 3.6 },
  { periodo: "2024/1", ano: 2024, total: 22, estudantes: 18, professores: 1, coordenadores: 1, tecnicos: 1, comissao: 1, mediaGeral: 3.7 },
  { periodo: "2024/2", ano: 2024, total: 18, estudantes: 14, professores: 2, coordenadores: 1, tecnicos: 1, comissao: 0, mediaGeral: 3.8 },
  { periodo: "2025/1", ano: 2025, total: 22, estudantes: 18, professores: 2, coordenadores: 1, tecnicos: 1, comissao: 1, mediaGeral: 3.7 },
  { periodo: "2026/1", ano: 2026, total: 25, estudantes: 20, professores: 2, coordenadores: 1, tecnicos: 1, comissao: 1, mediaGeral: 3.8 },
  { periodo: "2026/2", ano: 2026, total: 3,  estudantes: 3,  professores: 0, coordenadores: 0, tecnicos: 0, comissao: 0, mediaGeral: 3.9 },
];

const ANOS_HISTORICO = [...new Set(HISTORICO_SIMULADO.map((r) => r.ano))].sort((a, b) => a - b);

// ─── Exportação ───────────────────────────────────────────────

function buildCsvContent(data: PeriodoHistorico[]): string {
  const header = "Período,Ano,Total,Estudantes,Professores,Coordenadores,Técnicos Adm.,Comissão,Média Geral\n";
  const rows = data
    .map((d) => `${d.periodo},${d.ano},${d.total},${d.estudantes},${d.professores},${d.coordenadores},${d.tecnicos},${d.comissao},${d.mediaGeral.toFixed(2)}`)
    .join("\n");
  return "﻿" + header + rows;
}

function downloadCSV(data: PeriodoHistorico[], filename = "evolucao-historica-tsi.csv") {
  const blob = new Blob([buildCsvContent(data)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function abrirPDF(data: PeriodoHistorico[], titulo: string, svgHtml?: string) {
  const dataGeracao = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const totalGeral = data.reduce((s, r) => s + r.total, 0);
  const mediaMedia = data.length > 0
    ? (data.reduce((s, r) => s + r.mediaGeral, 0) / data.length).toFixed(2)
    : "0.00";

  const linhas = data.map((row, i) => {
    const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
    const mediaColor = row.mediaGeral >= 4 ? "#059669" : row.mediaGeral >= 3 ? "#d97706" : "#dc2626";
    const tag =
      row.periodo === "2026/2"
        ? `<span style="background:#d1fae5;color:#065f46;border-radius:9999px;padding:1px 6px;font-size:9px;margin-left:4px;">em andamento</span>`
        : row.ano < 2022
        ? `<span style="color:#cbd5e1;font-style:italic;font-size:9px;margin-left:4px;">sim.</span>`
        : "";
    return `
      <tr style="background:${bg};">
        <td style="padding:6px 10px;font-weight:500;">${row.periodo}${tag}</td>
        <td style="padding:6px 10px;text-align:right;font-weight:600;">${row.total}</td>
        <td style="padding:6px 10px;text-align:right;">${row.estudantes}</td>
        <td style="padding:6px 10px;text-align:right;">${row.professores}</td>
        <td style="padding:6px 10px;text-align:right;">${row.coordenadores}</td>
        <td style="padding:6px 10px;text-align:right;">${row.tecnicos}</td>
        <td style="padding:6px 10px;text-align:right;">${row.comissao}</td>
        <td style="padding:6px 10px;text-align:right;font-weight:700;color:${mediaColor};">${row.mediaGeral.toFixed(1)}</td>
      </tr>`;
  }).join("");

  const chartSection = svgHtml
    ? `<div style="margin-bottom:20px;">
        <h3 style="font-size:12px;font-weight:600;color:#0f172a;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;">
          Gráfico de Evolução por Eixo
        </h3>
        <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0;overflow:hidden;">
          ${svgHtml}
        </div>
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${titulo} — Avaliação IFB</title>
  <style>
    @page { size: A4 landscape; margin: 14mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
    .header { display: flex; align-items: center; gap: 14px; padding-bottom: 12px; border-bottom: 2px solid #10b981; margin-bottom: 14px; }
    .header-badge { background: #10b981; color: #fff; padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: .5px; white-space: nowrap; }
    .header-text h1 { font-size: 17px; font-weight: 700; color: #0f172a; }
    .header-text p  { font-size: 10px; color: #64748b; margin-top: 2px; }
    .meta { display: flex; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
    .meta-item { background: #f1f5f9; border-radius: 8px; padding: 7px 12px; }
    .meta-item .label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
    .meta-item .value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    thead tr { background: #0f172a; color: #fff; }
    thead th { padding: 7px 10px; text-align: left; font-weight: 600; font-size: 9px; letter-spacing: .3px; }
    thead th:not(:first-child) { text-align: right; }
    tbody td { border-bottom: 1px solid #e2e8f0; font-size: 10px; }
    tfoot tr { background: #f1f5f9; font-weight: 700; }
    tfoot td { padding: 7px 10px; font-size: 10px; border-top: 2px solid #cbd5e1; }
    tfoot td:not(:first-child) { text-align: right; }
    .note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 10px; margin-top: 12px; font-size: 9px; color: #92400e; }
    .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
    svg { max-width: 100%; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-badge">IFB</div>
    <div class="header-text">
      <h1>${titulo}</h1>
      <p>Tecnologia em Sistemas para Internet (TSI) &mdash; Avaliação Institucional Periódica</p>
    </div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="label">Períodos</div><div class="value">${data.length}</div></div>
    <div class="meta-item"><div class="label">Total participações</div><div class="value">${totalGeral}</div></div>
    <div class="meta-item"><div class="label">Média geral</div><div class="value">${mediaMedia} / 5.0</div></div>
    <div class="meta-item"><div class="label">Gerado em</div><div class="value" style="font-size:11px;">${dataGeracao}</div></div>
  </div>
  ${chartSection}
  <table>
    <thead>
      <tr>
        <th>Período</th><th>Total</th><th>Estudantes</th><th>Professores</th>
        <th>Coord.</th><th>Téc. Adm.</th><th>Comissão</th><th>Média</th>
      </tr>
    </thead>
    <tbody>${linhas}</tbody>
    <tfoot>
      <tr>
        <td>Total geral</td>
        <td>${totalGeral}</td>
        <td>${data.reduce((s, r) => s + r.estudantes, 0)}</td>
        <td>${data.reduce((s, r) => s + r.professores, 0)}</td>
        <td>${data.reduce((s, r) => s + r.coordenadores, 0)}</td>
        <td>${data.reduce((s, r) => s + r.tecnicos, 0)}</td>
        <td>${data.reduce((s, r) => s + r.comissao, 0)}</td>
        <td>${mediaMedia}</td>
      </tr>
    </tfoot>
  </table>
  <p class="note">* Os dados de 2015 a 2021 são projeções simuladas. A partir de 2022 os dados refletem pesquisas reais da comissão de avaliação.</p>
  <div class="footer">
    <span>Instituto Federal de Brasília (IFB) — Comissão de Avaliação Periódica do Curso TSI</span>
    <span>Documento gerado automaticamente pelo sistema de avaliação institucional</span>
  </div>
  <script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

// ─── Gráfico (reutilizável na página e no overlay) ────────────

interface GraficoEvolucaoProps {
  eixos: Eixo[];
  anosFilter?: number[];
  height?: number;
  chartRef?: React.RefObject<HTMLDivElement | null>;
}

function GraficoEvolucao({ eixos, anosFilter, height = 300, chartRef }: GraficoEvolucaoProps) {
  const dados = gerarDadosGrafico(eixos, anosFilter);
  if (eixos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
        <TrendingUp className="h-7 w-7" />
        <p className="text-sm">Configure eixos em "Configuração de Pesquisa" para visualizar o gráfico.</p>
      </div>
    );
  }
  return (
    <div className="w-full overflow-x-auto" ref={chartRef}>
      <div style={{ minWidth: 420 }}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={dados} margin={{ top: 6, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="ano" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={26} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v, name) => [typeof v === "number" ? v.toFixed(2) : v, name]}
              labelFormatter={(l) => `Ano: ${l}`}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            {eixos.map((eixo) => (
              <Line key={eixo.id} type="monotone" dataKey={eixo.nome} stroke={eixo.cor} strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2, fill: "#fff", stroke: eixo.cor }}
                activeDot={{ r: 5, strokeWidth: 0, fill: eixo.cor }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Tabela de resultados ────────────────────────────────────

interface TabelaHistoricoProps {
  data: PeriodoHistorico[];
  compact?: boolean;
}

function TabelaHistorico({ data, compact }: TabelaHistoricoProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-24 text-slate-400 gap-2">
        <FlaskConical className="h-6 w-6" />
        <p className="text-sm">Nenhum período corresponde ao filtro selecionado.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-3 py-2.5 font-semibold text-slate-600">Período</th>
            <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Total</th>
            <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Estudantes</th>
            {!compact && <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Professores</th>}
            {!compact && <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Coord.</th>}
            {!compact && <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Téc. Adm.</th>}
            {!compact && <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Comissão</th>}
            <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Média</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isEmAndamento = row.periodo === "2026/2";
            const isSimulado = row.ano < 2022;
            return (
              <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                <td className="px-3 py-2 font-medium text-slate-800">
                  {row.periodo}
                  {isEmAndamento && <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-700 text-xs">em andamento</span>}
                  {isSimulado && <span className="ml-1.5 text-slate-300 italic text-xs">sim.</span>}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-slate-700">{row.total}</td>
                <td className="px-3 py-2 text-right text-slate-600">{row.estudantes}</td>
                {!compact && <td className="px-3 py-2 text-right text-slate-600">{row.professores}</td>}
                {!compact && <td className="px-3 py-2 text-right text-slate-600">{row.coordenadores}</td>}
                {!compact && <td className="px-3 py-2 text-right text-slate-600">{row.tecnicos}</td>}
                {!compact && <td className="px-3 py-2 text-right text-slate-600">{row.comissao}</td>}
                <td className="px-3 py-2 text-right">
                  <span className={`font-semibold ${row.mediaGeral >= 4 ? "text-emerald-600" : row.mediaGeral >= 3 ? "text-amber-600" : "text-red-500"}`}>
                    {row.mediaGeral.toFixed(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Overlay de filtro/comparação ────────────────────────────

type ModoFiltro = "range" | "comparar";

interface FiltroOverlayProps {
  onClose: () => void;
  eixos: Eixo[];
}

function FiltroOverlay({ onClose, eixos }: FiltroOverlayProps) {
  const [modo, setModo]               = useState<ModoFiltro>("range");
  const [rangeInicio, setRangeInicio] = useState(ANOS_HISTORICO[0]);
  const [rangeFim, setRangeFim]       = useState(ANOS_HISTORICO[ANOS_HISTORICO.length - 1]);
  // Comparar anos: seleção múltipla por chips (mínimo 2)
  const [selectedAnos, setSelectedAnos] = useState<Set<number>>(new Set([2024, 2025]));
  const overlayChartRef = useRef<HTMLDivElement>(null);

  function toggleAno(ano: number) {
    setSelectedAnos((prev) => {
      const next = new Set(prev);
      if (next.has(ano)) {
        if (next.size <= 2) return prev; // mínimo 2 anos
        next.delete(ano);
      } else {
        next.add(ano);
      }
      return next;
    });
  }

  const anosAtivos: number[] =
    modo === "range"
      ? ANOS_HISTORICO.filter((a) => a >= rangeInicio && a <= rangeFim)
      : [...selectedAnos].sort((a, b) => a - b);

  const dadosFiltrados: PeriodoHistorico[] =
    modo === "range"
      ? HISTORICO_SIMULADO.filter((r) => r.ano >= rangeInicio && r.ano <= rangeFim)
      : HISTORICO_SIMULADO.filter((r) => selectedAnos.has(r.ano));

  const tituloExport =
    modo === "range"
      ? `Evolução Histórica TSI ${rangeInicio}–${rangeFim}`
      : `Comparativo TSI: ${anosAtivos.join(", ")}`;
  const filenameBase =
    modo === "range"
      ? `evolucao-tsi-${rangeInicio}-${rangeFim}`
      : `comparativo-tsi-${anosAtivos.join("-")}`;

  function handlePDF() {
    const svgEl = overlayChartRef.current?.querySelector("svg");
    let svgHtml = "";
    if (svgEl) {
      const clone = svgEl.cloneNode(true) as SVGElement;
      clone.setAttribute("width", "680");
      clone.setAttribute("height", "220");
      svgHtml = clone.outerHTML;
    }
    abrirPDF(dadosFiltrados, tituloExport, svgHtml || undefined);
  }

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)" }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
            <h2 className="font-semibold text-slate-900 text-sm">Filtrar / Comparar Histórico</h2>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Controles */}
        <div className="px-5 py-4 border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex gap-2">
            {(["range", "comparar"] as ModoFiltro[]).map((m) => (
              <button key={m} type="button" onClick={() => setModo(m)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  modo === m
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}>
                {m === "range" ? "Filtrar por intervalo de anos" : "Comparar anos"}
              </button>
            ))}
          </div>

          {modo === "range" && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600 whitespace-nowrap">De:</label>
                <select value={rangeInicio} onChange={(e) => setRangeInicio(Number(e.target.value))} className={selectClass}>
                  {ANOS_HISTORICO.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Até:</label>
                <select value={rangeFim} onChange={(e) => setRangeFim(Number(e.target.value))} className={selectClass}>
                  {ANOS_HISTORICO.filter((a) => a >= rangeInicio).map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <span className="text-xs text-slate-400">{dadosFiltrados.length} período(s)</span>
            </div>
          )}

          {modo === "comparar" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Selecione os anos:</label>
                <span className="text-xs text-slate-400">({selectedAnos.size} selecionado{selectedAnos.size !== 1 ? "s" : ""}, mínimo 2)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ANOS_HISTORICO.map((ano) => {
                  const sel = selectedAnos.has(ano);
                  const bloqueado = sel && selectedAnos.size <= 2;
                  return (
                    <button
                      key={ano}
                      type="button"
                      onClick={() => toggleAno(ano)}
                      disabled={bloqueado}
                      title={bloqueado ? "Mínimo de 2 anos selecionados" : undefined}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        sel
                          ? "border-emerald-400 bg-emerald-500 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
                      } ${bloqueado ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {ano}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">{dadosFiltrados.length} período(s) nos anos selecionados</p>
            </div>
          )}
        </div>

        {/* Conteúdo scrollável: gráfico + tabela */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Gráfico filtrado */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Gráfico de Evolução</p>
            <GraficoEvolucao eixos={eixos} anosFilter={anosAtivos} height={220} chartRef={overlayChartRef} />
          </div>

          {/* Tabela filtrada */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Dados por Período</p>
            <TabelaHistorico data={dadosFiltrados} compact={modo === "comparar"} />
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
          <p className="text-xs text-slate-500 italic">
            <FlaskConical className="h-3 w-3 inline mr-1 text-amber-500" />
            Dados anteriores a 2022 são projeções simuladas.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 text-xs"
              onClick={() => downloadCSV(dadosFiltrados, `${filenameBase}.csv`)}
              disabled={dadosFiltrados.length === 0}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 text-xs"
              onClick={handlePDF}
              disabled={dadosFiltrados.length === 0}>
              <FileText className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────

interface EvolucaoCursoViewProps {
  eixos?: Eixo[];
}

export function EvolucaoCursoView({ eixos: eixosProp }: EvolucaoCursoViewProps) {
  const eixos = eixosProp ?? EIXOS_PADRAO_TSI;
  const [showFiltro, setShowFiltro] = useState(false);
  const { questionarios, respostas } = useQuestionario();
  const markVisited = useChecklist()?.markVisited;
  const mainChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => { markVisited?.("ver-evolucao"); }, [markVisited]);

  const ultimoIdx      = ANOS.length - 1;
  const anoAnteriorIdx = ANOS.length - 2;

  const qHistoricos = questionarios
    .filter((q) => q.status === "encerrado" || q.status === "arquivado")
    .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));

  function handlePDFCompleto() {
    const svgEl = mainChartRef.current?.querySelector("svg");
    let svgHtml = "";
    if (svgEl) {
      const clone = svgEl.cloneNode(true) as SVGElement;
      clone.setAttribute("width", "680");
      clone.setAttribute("height", "240");
      svgHtml = clone.outerHTML;
    }
    abrirPDF(HISTORICO_SIMULADO, "Evolução Histórica TSI 2015–2026", svgHtml || undefined);
  }

  return (
    <>
      {showFiltro && <FiltroOverlay onClose={() => setShowFiltro(false)} eixos={eixos} />}

      <div className="p-4 sm:p-8 space-y-8">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Evolução por Curso</h1>
          <p className="text-slate-500 mt-1 text-sm">Acompanhe a evolução dos eixos de avaliação ao longo dos anos.</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50">
              Tecnologia em Sistemas para Internet (TSI)
            </Badge>
            <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50 flex items-center gap-1">
              <FlaskConical className="h-3 w-3" /> Dados simulados
            </Badge>
          </div>
        </div>

        {/* Cards de resumo por eixo */}
        {eixos.length > 0 && (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {eixos.slice(0, 4).map((eixo) => {
              const progressao = gerarProgressao(eixo.id);
              const atual   = progressao[ultimoIdx];
              const anterior = progressao[anoAnteriorIdx];
              const delta   = atual - anterior;
              return (
                <Card key={eixo.id} className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: eixo.cor }} />
                      <CardTitle className="text-xs font-medium text-slate-600 truncate">{eixo.nome}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{atual.toFixed(2)}</p>
                    <p className="text-xs mt-1" style={{ color: delta >= 0 ? "#10b981" : "#ef4444" }}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(2)} vs {ANOS[anoAnteriorIdx]}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Evolução Histórica Detalhada (gráfico + tabela, sempre visível) */}
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">Evolução Histórica Detalhada</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">
              Gráfico e dados por período: participantes, perfis e médias de avaliação.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
              {/* Barra de ações */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 flex-1">
                  <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                  Dados de 2015 a 2021 são projeções simuladas. A partir de 2022 refletem pesquisas reais da comissão.
                </p>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5"
                    onClick={() => setShowFiltro(true)}>
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar / Comparar
                  </Button>
                  <Button size="sm" variant="outline"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                    onClick={() => downloadCSV(HISTORICO_SIMULADO)}>
                    <Download className="h-3.5 w-3.5" /> CSV
                  </Button>
                  <Button size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5"
                    onClick={handlePDFCompleto}>
                    <FileText className="h-3.5 w-3.5" /> PDF
                  </Button>
                </div>
              </div>

              {/* Gráfico */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Gráfico de Evolução {ANOS[0]}&ndash;{ANOS[ultimoIdx]}
                </p>
                <GraficoEvolucao eixos={eixos} height={300} chartRef={mainChartRef} />
              </div>

              {/* Tabela completa */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Dados por Período</p>
                <TabelaHistorico data={HISTORICO_SIMULADO} />
              </div>

              {/* Pesquisas reais registradas */}
              {qHistoricos.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Pesquisas registradas no sistema:</p>
                  {qHistoricos.map((q) => {
                    const totalResp = respostas.filter((r) => r.questionarioId === q.id).length;
                    return (
                      <div key={q.id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{q.titulo}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{q.dataInicio} a {q.dataFim}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-slate-600">{totalResp} respostas</span>
                          <Badge variant="outline" className="text-xs capitalize">{q.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </>
  );
}
