import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import type { Questionario, Questao } from "@/types/questionario";
import type { Resposta, RespostaQuestao } from "@/types/resposta";
import { LIKERT_ESCALAS } from "@/types/questionario";

interface ResponderViewProps {
  questionario: Questionario;
  respondentId: string | null;
  respondentTipo: Resposta["respondentTipo"];
  onSubmit: (r: Resposta) => void;
  onCancelar: () => void;
}

function QuestaoMultiplaEscolha({
  questao,
  valor,
  onChange,
  erro,
}: {
  questao: Questao;
  valor: string | undefined;
  onChange: (opcaoId: string) => void;
  erro: boolean;
}) {
  return (
    <div className="space-y-2">
      {questao.opcoes?.map((opcao) => (
        <label
          key={opcao.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-300"
        >
          <input
            type="radio"
            name={questao.id}
            value={opcao.id}
            checked={valor === opcao.id}
            onChange={() => onChange(opcao.id)}
            className="accent-emerald-600"
          />
          <span className="text-sm text-slate-700">{opcao.texto}</span>
        </label>
      ))}
      {erro && <p className="text-xs text-red-500 mt-1">Esta questão é obrigatória.</p>}
    </div>
  );
}

function QuestaoLikert({
  questao,
  valor,
  onChange,
  erro,
}: {
  questao: Questao;
  valor: number | undefined;
  onChange: (v: number) => void;
  erro: boolean;
}) {
  const escala = questao.likertEscala ? LIKERT_ESCALAS[questao.likertEscala] : null;
  const opcoes = escala?.opcoes ?? ["1", "2", "3", "4", "5"];

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {opcoes.map((label, idx) => {
          const v = idx + 1;
          const checked = valor === v;
          return (
            <label
              key={v}
              className={`flex flex-col items-center gap-1 cursor-pointer px-3 py-2 rounded-lg border text-xs text-center min-w-[72px] flex-1 transition-colors ${
                checked
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-medium"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={questao.id}
                value={v}
                checked={checked}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              <span className="font-bold text-sm">{v}</span>
              <span>{label}</span>
            </label>
          );
        })}
      </div>
      {erro && <p className="text-xs text-red-500 mt-1">Esta questão é obrigatória.</p>}
    </div>
  );
}

function QuestaoDissertativa({
  valor,
  onChange,
  erro,
}: {
  questao?: Questao;
  valor: string | undefined;
  onChange: (v: string) => void;
  erro: boolean;
}) {
  return (
    <div className="space-y-1">
      <textarea
        placeholder="Digite sua resposta..."
        value={valor ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none min-h-25 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
      {erro && <p className="text-xs text-red-500">Esta questão é obrigatória.</p>}
    </div>
  );
}

export function ResponderView({
  questionario,
  respondentId,
  respondentTipo,
  onSubmit,
  onCancelar,
}: ResponderViewProps) {
  const [respostas, setRespostas] = useState<Record<string, RespostaQuestao>>({});
  const [erros, setErros] = useState<Record<string, boolean>>({});

  function setResposta(questaoId: string, patch: Partial<RespostaQuestao>) {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: { ...prev[questaoId], ...patch, questaoId },
    }));
    setErros((prev) => ({ ...prev, [questaoId]: false }));
  }

  function handleSubmit() {
    const novosErros: Record<string, boolean> = {};
    for (const q of questionario.questoes) {
      if (!q.obrigatoria) continue;
      const r = respostas[q.id];
      if (!r) { novosErros[q.id] = true; continue; }
      if (q.tipo === "multipla_escolha" && !r.opcaoId) novosErros[q.id] = true;
      if (q.tipo === "likert" && r.likertValor === undefined) novosErros[q.id] = true;
      if (q.tipo === "dissertativa" && !r.texto?.trim()) novosErros[q.id] = true;
    }
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    const resposta: Resposta = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      questionarioId: questionario.id,
      respondentId,
      respondentTipo,
      respostas: questionario.questoes
        .map((q) => respostas[q.id])
        .filter(Boolean),
      submetidoEm: new Date().toISOString(),
    };
    onSubmit(resposta);
  }

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-700 -ml-2 mt-1"
          onClick={onCancelar}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{questionario.titulo}</h1>
          {questionario.descricao && (
            <p className="text-slate-500 mt-1 text-sm">{questionario.descricao}</p>
          )}
          {questionario.anonimo && (
            <p className="text-xs text-slate-400 mt-1">
              Este questionário é anônimo — suas respostas não serão identificadas.
            </p>
          )}
        </div>
      </div>

      {questionario.questoes.map((questao, idx) => (
        <Card key={questao.id} className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 leading-snug">
              <span className="text-slate-400 mr-2">{idx + 1}.</span>
              {questao.enunciado}
              {questao.obrigatoria && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questao.tipo === "multipla_escolha" && (
              <QuestaoMultiplaEscolha
                questao={questao}
                valor={respostas[questao.id]?.opcaoId}
                onChange={(opcaoId) => setResposta(questao.id, { opcaoId })}
                erro={erros[questao.id] ?? false}
              />
            )}
            {questao.tipo === "likert" && (
              <QuestaoLikert
                questao={questao}
                valor={respostas[questao.id]?.likertValor}
                onChange={(likertValor) => setResposta(questao.id, { likertValor })}
                erro={erros[questao.id] ?? false}
              />
            )}
            {questao.tipo === "dissertativa" && (
              <QuestaoDissertativa
                questao={questao}
                valor={respostas[questao.id]?.texto}
                onChange={(texto) => setResposta(questao.id, { texto })}
                erro={erros[questao.id] ?? false}
              />
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancelar} className="border-slate-200 text-slate-600">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Enviar Respostas
        </Button>
      </div>
    </div>
  );
}
