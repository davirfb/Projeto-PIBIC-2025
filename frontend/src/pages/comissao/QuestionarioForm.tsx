import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
  Questionario,
  Questao,
  QuestaoTipo,
  LikertEscalaId,
} from "@/types/questionario";
import { LIKERT_ESCALAS } from "@/types/questionario";
import { Plus, Trash2, FileText, ListChecks, BarChart2, GraduationCap } from "lucide-react";

interface CursoOpcao {
  id: string;
  nome: string;
}

interface QuestionarioFormProps {
  inicial?: Questionario;
  cursosDisponiveis?: CursoOpcao[];
  onRascunho: (q: Questionario) => Promise<void>;
  onPublicar: (q: Questionario) => Promise<void>;
  onCancelar: () => void;
}

function criarQuestao(tipo: QuestaoTipo): Questao {
  if (tipo === "multipla_escolha") {
    return {
      id: crypto.randomUUID(),
      tipo,
      enunciado: "",
      obrigatoria: true,
      opcoes: [
        { id: crypto.randomUUID(), texto: "" },
        { id: crypto.randomUUID(), texto: "" },
      ],
    };
  }
  if (tipo === "likert") {
    return {
      id: crypto.randomUUID(),
      tipo,
      enunciado: "",
      obrigatoria: true,
      likertEscala: "satisfacao",
    };
  }
  return { id: crypto.randomUUID(), tipo, enunciado: "", obrigatoria: true };
}

function validar(
  titulo: string,
  dataInicio: string,
  dataFim: string,
  questoes: Questao[],
  cursosSelecionados: string[],
  cursosDisponiveis: CursoOpcao[],
): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!titulo.trim()) erros.titulo = "Título é obrigatório.";
  if (!dataInicio) erros.dataInicio = "Data de início é obrigatória.";
  if (!dataFim) erros.dataFim = "Data de encerramento é obrigatória.";
  if (dataInicio && dataFim && dataFim <= dataInicio)
    erros.dataFim = "Data de encerramento deve ser posterior à data de início.";
  if (cursosDisponiveis.length > 0 && cursosSelecionados.length === 0)
    erros.cursos = "Vincule ao menos um curso.";
  if (questoes.length === 0) erros.questoes = "Adicione ao menos uma questão.";
  questoes.forEach((q, i) => {
    if (!q.enunciado.trim())
      erros[`q_${i}_enunciado`] = "Enunciado obrigatório.";
    if (q.tipo === "multipla_escolha") {
      const opcoes = q.opcoes ?? [];
      if (opcoes.length < 2)
        erros[`q_${i}_opcoes`] = "Adicione ao menos 2 opções.";
      else if (opcoes.some((o) => !o.texto.trim()))
        erros[`q_${i}_opcoes`] = "Preencha todas as opções.";
    }
  });
  return erros;
}

const TIPO_CONFIG: Record<
  QuestaoTipo,
  { label: string; color: string; icon: React.ReactNode }
> = {
  multipla_escolha: {
    label: "Múltipla Escolha",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <ListChecks className="h-3 w-3" />,
  },
  likert: {
    label: "Escala Likert",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <BarChart2 className="h-3 w-3" />,
  },
  dissertativa: {
    label: "Dissertativa",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <FileText className="h-3 w-3" />,
  },
};

export function QuestionarioForm({
  inicial,
  cursosDisponiveis = [],
  onRascunho,
  onPublicar,
  onCancelar,
}: QuestionarioFormProps) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [dataInicio, setDataInicio] = useState(inicial?.dataInicio ?? "");
  const [dataFim, setDataFim] = useState(inicial?.dataFim ?? "");
  const [anonimo, setAnonimo] = useState(inicial?.anonimo ?? true);
  const [questoes, setQuestoes] = useState<Questao[]>(inicial?.questoes ?? []);
  const [cursosSelecionados, setCursosSelecionados] = useState<string[]>(
    inicial?.cursos ?? cursosDisponiveis.map((c) => c.id),
  );
  const [erros, setErros] = useState<Record<string, string>>({});
  const [showConfirmPublicar, setShowConfirmPublicar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function toggleCurso(id: string) {
    setCursosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function montar(status: "rascunho" | "publicado"): Questionario {
    return {
      id: inicial?.id ?? crypto.randomUUID(),
      titulo,
      descricao,
      dataInicio,
      dataFim,
      anonimo,
      status,
      questoes,
      cursos: cursosSelecionados,
      criadoEm: inicial?.criadoEm ?? new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
  }

  async function handleRascunho() {
    if (!titulo.trim()) {
      setErros({ titulo: "Título é obrigatório mesmo para rascunho." });
      return;
    }
    setErros({});
    setSaveError(null);
    setSaving(true);
    try {
      await onRascunho(montar("rascunho"));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function handlePublicarClick() {
    const novosErros = validar(titulo, dataInicio, dataFim, questoes, cursosSelecionados, cursosDisponiveis);
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }
    setErros({});
    setShowConfirmPublicar(true);
  }

  function addQuestao(tipo: QuestaoTipo) {
    setQuestoes((prev) => [...prev, criarQuestao(tipo)]);
  }

  function removeQuestao(id: string) {
    setQuestoes((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestao(id: string, changes: Partial<Questao>) {
    setQuestoes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...changes } : q)),
    );
  }

  function addOpcao(questaoId: string) {
    setQuestoes((prev) =>
      prev.map((q) =>
        q.id === questaoId
          ? {
              ...q,
              opcoes: [
                ...(q.opcoes ?? []),
                { id: crypto.randomUUID(), texto: "" },
              ],
            }
          : q,
      ),
    );
  }

  function removeOpcao(questaoId: string, opcaoId: string) {
    setQuestoes((prev) =>
      prev.map((q) =>
        q.id === questaoId && (q.opcoes?.length ?? 0) > 2
          ? { ...q, opcoes: q.opcoes?.filter((o) => o.id !== opcaoId) }
          : q,
      ),
    );
  }

  function updateOpcao(questaoId: string, opcaoId: string, texto: string) {
    setQuestoes((prev) =>
      prev.map((q) =>
        q.id === questaoId
          ? {
              ...q,
              opcoes: q.opcoes?.map((o) =>
                o.id === opcaoId ? { ...o, texto } : o,
              ),
            }
          : q,
      ),
    );
  }

  const isEdicao = !!inicial;

  return (
    <div className="p-8 max-w-3xl space-y-8">
      {/* Cabeçalho */}
      <div>
        <button
          type="button"
          onClick={onCancelar}
          className="text-sm text-slate-500 hover:text-slate-700 underline mb-2 block"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEdicao ? "Editar Rascunho" : "Novo Questionário"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Preencha as informações e adicione as questões avaliativas.
        </p>
      </div>

      {/* Informações Básicas */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1">
            <Label htmlFor="titulo" className="text-sm text-slate-700">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder="Ex: Avaliação de Curso 2025.1"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="bg-slate-50 border-slate-200 focus-visible:bg-white"
            />
            {erros.titulo && (
              <p className="text-xs text-red-500">{erros.titulo}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="descricao" className="text-sm text-slate-700">
              Descrição
            </Label>
            <textarea
              id="descricao"
              placeholder="Descreva o objetivo desta avaliação..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="dataInicio" className="text-sm text-slate-700">
                Data de Início <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-slate-50 border-slate-200 focus-visible:bg-white"
              />
              {erros.dataInicio && (
                <p className="text-xs text-red-500">{erros.dataInicio}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="dataFim" className="text-sm text-slate-700">
                Data de Encerramento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-slate-50 border-slate-200 focus-visible:bg-white"
              />
              {erros.dataFim && (
                <p className="text-xs text-red-500">{erros.dataFim}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input
              id="anonimo"
              type="checkbox"
              checked={anonimo}
              onChange={(e) => setAnonimo(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 cursor-pointer"
            />
            <div>
              <Label
                htmlFor="anonimo"
                className="text-sm text-slate-700 cursor-pointer"
              >
                Respostas anônimas
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Nenhum dado que identifique o respondente será armazenado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cursos Vinculados (RF09) */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-base text-slate-900">Cursos Vinculados</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {cursosDisponiveis.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              Nenhum curso disponível para vincular. O administrador deve cadastrar cursos primeiro.
            </p>
          ) : (
            <div className="space-y-2">
              {cursosDisponiveis.map((curso) => {
                const selecionado = cursosSelecionados.includes(curso.id);
                return (
                  <label
                    key={curso.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => toggleCurso(curso.id)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    <span className="text-sm text-slate-800">{curso.nome}</span>
                    {selecionado && (
                      <Badge className="ml-auto text-xs bg-emerald-50 text-emerald-700 border-emerald-200" variant="outline">
                        Selecionado
                      </Badge>
                    )}
                  </label>
                );
              })}
              {erros.cursos && (
                <p className="text-xs text-red-500 mt-1">{erros.cursos}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questões */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-slate-900">
              Questões{" "}
              <span className="text-slate-400 font-normal text-sm">
                ({questoes.length})
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {erros.questoes && (
            <p className="text-xs text-red-500 -mt-2">{erros.questoes}</p>
          )}

          {questoes.map((questao, index) => {
            const config = TIPO_CONFIG[questao.tipo];
            return (
              <div
                key={questao.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Q{index + 1}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs flex items-center gap-1 ${config.color}`}
                    >
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestao(questao.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Remover questão"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">
                    Enunciado <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    placeholder="Digite o enunciado da questão..."
                    value={questao.enunciado}
                    onChange={(e) =>
                      updateQuestao(questao.id, { enunciado: e.target.value })
                    }
                    rows={2}
                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                  />
                  {erros[`q_${index}_enunciado`] && (
                    <p className="text-xs text-red-500">
                      {erros[`q_${index}_enunciado`]}
                    </p>
                  )}
                </div>

                {/* Múltipla Escolha */}
                {questao.tipo === "multipla_escolha" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Opções</Label>
                    {questao.opcoes?.map((opcao, oi) => (
                      <div key={opcao.id} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-5">
                          {oi + 1}.
                        </span>
                        <Input
                          placeholder={`Opção ${oi + 1}`}
                          value={opcao.texto}
                          onChange={(e) =>
                            updateOpcao(questao.id, opcao.id, e.target.value)
                          }
                          className="bg-white border-slate-200 text-sm h-8"
                        />
                        <button
                          type="button"
                          onClick={() => removeOpcao(questao.id, opcao.id)}
                          disabled={(questao.opcoes?.length ?? 0) <= 2}
                          className="text-slate-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {erros[`q_${index}_opcoes`] && (
                      <p className="text-xs text-red-500">
                        {erros[`q_${index}_opcoes`]}
                      </p>
                    )}
                    {(questao.opcoes?.length ?? 0) < 6 && (
                      <button
                        type="button"
                        onClick={() => addOpcao(questao.id)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1"
                      >
                        <Plus className="h-3 w-3" /> Adicionar opção
                      </button>
                    )}
                  </div>
                )}

                {/* Likert */}
                {questao.tipo === "likert" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">
                      Tipo de escala
                    </Label>
                    <Select
                      value={questao.likertEscala ?? "satisfacao"}
                      onValueChange={(v) =>
                        updateQuestao(questao.id, {
                          likertEscala: v as LikertEscalaId,
                        })
                      }
                    >
                      <SelectTrigger className="bg-white border-slate-200 text-sm h-8 w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LIKERT_ESCALAS).map(([id, escala]) => (
                          <SelectItem key={id} value={id}>
                            {escala.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {LIKERT_ESCALAS[
                        questao.likertEscala ?? "satisfacao"
                      ].opcoes.map((op, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-600"
                        >
                          {i + 1}. {op}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dissertativa */}
                {questao.tipo === "dissertativa" && (
                  <p className="text-xs text-slate-400 italic">
                    Campo de texto livre. O respondente digitará sua resposta.
                  </p>
                )}

                <Separator className="my-1" />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`obrig-${questao.id}`}
                    checked={questao.obrigatoria}
                    onChange={(e) =>
                      updateQuestao(questao.id, {
                        obrigatoria: e.target.checked,
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 cursor-pointer"
                  />
                  <Label
                    htmlFor={`obrig-${questao.id}`}
                    className="text-xs text-slate-500 cursor-pointer"
                  >
                    Resposta obrigatória
                  </Label>
                </div>
              </div>
            );
          })}

          {/* Adicionar questão */}
          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Adicionar questão:
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                ["multipla_escolha", "likert", "dissertativa"] as QuestaoTipo[]
              ).map((tipo) => {
                const config = TIPO_CONFIG[tipo];
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => addQuestao(tipo)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:opacity-80 ${config.color}`}
                  >
                    <Plus className="h-3 w-3" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      {saveError && (
        <p className="text-sm text-red-500 text-right pb-2">{saveError}</p>
      )}
      <div className="flex items-center justify-between pb-8">
        <Button
          variant="outline"
          onClick={onCancelar}
          disabled={saving}
          className="border-slate-300 text-slate-600"
        >
          Cancelar
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRascunho}
            disabled={saving}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            {saving ? "Salvando…" : "Salvar Rascunho"}
          </Button>
          <Button
            onClick={handlePublicarClick}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {saving ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </div>

      {/* Confirmação de publicação */}
      <AlertDialog
        open={showConfirmPublicar}
        onOpenChange={setShowConfirmPublicar}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar questionário?</AlertDialogTitle>
            <AlertDialogDescription>
              Após a publicação, o questionário{" "}
              <strong>não poderá ser editado</strong>. Ele ficará disponível
              para resposta no período de vigência definido. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={async () => {
                setSaveError(null);
                setSaving(true);
                try {
                  await onPublicar(montar("publicado"));
                } catch (err) {
                  setSaveError(err instanceof Error ? err.message : "Erro ao publicar.");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Sim, publicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
