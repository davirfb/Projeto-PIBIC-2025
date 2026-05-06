import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Questionario, Questao } from "@/types/questionario";
import type { Resposta } from "@/types/resposta";
import { LIKERT_ESCALAS } from "@/types/questionario";

interface RelatorioDetalheProps {
  questionario: Questionario;
  respostas: Resposta[];
  onVoltar: () => void;
}

function BarraHorizontal({ pct, color = "bg-emerald-500" }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div
        className={`${color} h-2.5 rounded-full transition-all`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function ResultadoMultiplaEscolha({
  questao,
  respostas,
}: {
  questao: Questao;
  respostas: Resposta[];
}) {
  const total = respostas.length;
  const contagem = Object.fromEntries((questao.opcoes ?? []).map((o) => [o.id, 0]));
  for (const r of respostas) {
    const rq = r.respostas.find((rq) => rq.questaoId === questao.id);
    if (rq?.opcaoId && contagem[rq.opcaoId] !== undefined) {
      contagem[rq.opcaoId]++;
    }
  }

  return (
    <div className="space-y-3">
      {(questao.opcoes ?? []).map((opcao) => {
        const count = contagem[opcao.id] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={opcao.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">{opcao.texto}</span>
              <span className="text-slate-500 font-medium">
                {count} ({Math.round(pct)}%)
              </span>
            </div>
            <BarraHorizontal pct={pct} />
          </div>
        );
      })}
      <p className="text-xs text-slate-400 pt-1">{total} resposta(s)</p>
    </div>
  );
}

function ResultadoLikert({
  questao,
  respostas,
}: {
  questao: Questao;
  respostas: Resposta[];
}) {
  const escala = questao.likertEscala ? LIKERT_ESCALAS[questao.likertEscala] : null;
  const opcoes = escala?.opcoes ?? ["1", "2", "3", "4", "5"];
  const contagem: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let soma = 0;
  let total = 0;

  for (const r of respostas) {
    const rq = r.respostas.find((rq) => rq.questaoId === questao.id);
    if (rq?.likertValor !== undefined) {
      contagem[rq.likertValor] = (contagem[rq.likertValor] ?? 0) + 1;
      soma += rq.likertValor;
      total++;
    }
  }

  const media = total > 0 ? (soma / total).toFixed(2) : "—";
  const maxCount = Math.max(...Object.values(contagem), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Média:</span>
        <span className="text-xl font-bold text-emerald-600">{media}</span>
        <span className="text-xs text-slate-400">/ 5</span>
      </div>
      {[1, 2, 3, 4, 5].map((v) => {
        const count = contagem[v] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const label = opcoes[v - 1] ?? String(v);
        return (
          <div key={v} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">
                {v} — {label}
              </span>
              <span className="text-slate-500 font-medium">
                {count} ({Math.round(pct)}%)
              </span>
            </div>
            <BarraHorizontal pct={(count / maxCount) * 100} />
          </div>
        );
      })}
      <p className="text-xs text-slate-400 pt-1">{total} resposta(s)</p>
    </div>
  );
}

function ResultadoDissertativa({
  questao,
  respostas,
}: {
  questao: Questao;
  respostas: Resposta[];
}) {
  const textos = respostas
    .map((r) => r.respostas.find((rq) => rq.questaoId === questao.id)?.texto)
    .filter((t): t is string => !!t?.trim());

  if (textos.length === 0) {
    return <p className="text-sm text-slate-400 italic">Nenhuma resposta registrada.</p>;
  }

  return (
    <div className="space-y-2">
      {textos.map((texto, i) => (
        <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
          {texto}
        </div>
      ))}
      <p className="text-xs text-slate-400 pt-1">{textos.length} resposta(s)</p>
    </div>
  );
}

function exportarCSV(questionario: Questionario, respostas: Resposta[]) {
  const linhas: string[] = ["Questão;Tipo;Opção/Valor;Contagem;Percentual"];
  const total = respostas.length;

  for (const questao of questionario.questoes) {
    if (questao.tipo === "multipla_escolha") {
      const contagem = Object.fromEntries((questao.opcoes ?? []).map((o) => [o.id, 0]));
      for (const r of respostas) {
        const rq = r.respostas.find((rq) => rq.questaoId === questao.id);
        if (rq?.opcaoId) contagem[rq.opcaoId] = (contagem[rq.opcaoId] ?? 0) + 1;
      }
      for (const opcao of questao.opcoes ?? []) {
        const count = contagem[opcao.id] ?? 0;
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
        linhas.push(`"${questao.enunciado}";multipla_escolha;"${opcao.texto}";${count};${pct}%`);
      }
    } else if (questao.tipo === "likert") {
      const contagem: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let soma = 0;
      let cnt = 0;
      for (const r of respostas) {
        const rq = r.respostas.find((rq) => rq.questaoId === questao.id);
        if (rq?.likertValor !== undefined) {
          contagem[rq.likertValor] = (contagem[rq.likertValor] ?? 0) + 1;
          soma += rq.likertValor;
          cnt++;
        }
      }
      const media = cnt > 0 ? (soma / cnt).toFixed(2) : "0";
      for (let v = 1; v <= 5; v++) {
        const count = contagem[v] ?? 0;
        const pct = cnt > 0 ? ((count / cnt) * 100).toFixed(1) : "0.0";
        linhas.push(`"${questao.enunciado}";likert;${v};${count};${pct}%`);
      }
      linhas.push(`"${questao.enunciado}";likert;Média;${media};—`);
    } else {
      const textos = respostas
        .map((r) => r.respostas.find((rq) => rq.questaoId === questao.id)?.texto)
        .filter((t): t is string => !!t?.trim());
      linhas.push(`"${questao.enunciado}";dissertativa;"${textos.join(" | ")}";${textos.length};—`);
    }
  }

  const csv = linhas.join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${questionario.titulo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RelatorioDetalhe({ questionario, respostas, onVoltar }: RelatorioDetalheProps) {
  const totalRespostas = respostas.filter((r) => r.questionarioId === questionario.id).length;
  const respostasDeste = respostas.filter((r) => r.questionarioId === questionario.id);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700 -ml-2 mt-1"
            onClick={onVoltar}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{questionario.titulo}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {questionario.dataInicio} → {questionario.dataFim} · {totalRespostas} resposta(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 flex items-center gap-1.5"
            onClick={() => exportarCSV(questionario, respostasDeste)}
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 flex items-center gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
        </div>
      </div>

      {totalRespostas === 0 ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
            <p className="text-sm font-medium">Nenhuma resposta coletada para este questionário.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {questionario.questoes.map((questao, idx) => (
            <Card key={questao.id} className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-xs bg-slate-50 text-slate-500 border-slate-200">
                    {idx + 1}
                  </Badge>
                  <CardTitle className="text-sm font-medium text-slate-800 leading-snug">
                    {questao.enunciado}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {questao.tipo === "multipla_escolha" && (
                  <ResultadoMultiplaEscolha questao={questao} respostas={respostasDeste} />
                )}
                {questao.tipo === "likert" && (
                  <ResultadoLikert questao={questao} respostas={respostasDeste} />
                )}
                {questao.tipo === "dissertativa" && (
                  <ResultadoDissertativa questao={questao} respostas={respostasDeste} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
