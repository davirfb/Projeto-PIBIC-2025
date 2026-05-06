import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import type { Curso, Turma } from "@/types/adm";

interface CursosViewProps {
  cursos: Curso[];
  onSalvarCurso: (c: Curso) => void;
  onExcluirCurso: (id: string) => void;
  onSalvarTurma: (cursoId: string, t: Turma) => void;
  onExcluirTurma: (cursoId: string, turmaId: string) => void;
}

interface FormCurso {
  id: string | null;
  nome: string;
  codigo: string;
}

interface FormTurma {
  cursoId: string;
  id: string | null;
  nome: string;
  ano: string;
  semestre: "1" | "2";
}

const FORM_CURSO_VAZIO: FormCurso = { id: null, nome: "", codigo: "" };

export function CursosView({ cursos, onSalvarCurso, onExcluirCurso, onSalvarTurma, onExcluirTurma }: CursosViewProps) {
  const [formCurso, setFormCurso] = useState<FormCurso | null>(null);
  const [formTurma, setFormTurma] = useState<FormTurma | null>(null);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [errosCurso, setErrosCurso] = useState<Record<string, string>>({});
  const [errosTurma, setErrosTurma] = useState<Record<string, string>>({});

  function toggleExpandido(id: string) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSalvarCurso() {
    if (!formCurso) return;
    const erros: Record<string, string> = {};
    if (!formCurso.nome.trim()) erros.nome = "Nome é obrigatório.";
    if (!formCurso.codigo.trim()) erros.codigo = "Código é obrigatório.";
    if (Object.keys(erros).length > 0) { setErrosCurso(erros); return; }

    const existente = formCurso.id ? cursos.find((c) => c.id === formCurso.id) : null;
    const curso: Curso = {
      id: formCurso.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nome: formCurso.nome.trim(),
      codigo: formCurso.codigo.trim().toUpperCase(),
      turmas: existente?.turmas ?? [],
    };
    onSalvarCurso(curso);
    setFormCurso(null);
    setErrosCurso({});
  }

  function handleSalvarTurma() {
    if (!formTurma) return;
    const erros: Record<string, string> = {};
    if (!formTurma.nome.trim()) erros.nome = "Nome é obrigatório.";
    if (!formTurma.ano || isNaN(Number(formTurma.ano))) erros.ano = "Ano inválido.";
    if (Object.keys(erros).length > 0) { setErrosTurma(erros); return; }

    const turma: Turma = {
      id: formTurma.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nome: formTurma.nome.trim(),
      ano: Number(formTurma.ano),
      semestre: Number(formTurma.semestre) as 1 | 2,
    };
    onSalvarTurma(formTurma.cursoId, turma);
    setFormTurma(null);
    setErrosTurma({});
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cursos e Turmas</h1>
          <p className="text-slate-500 mt-1">Gerencie os cursos e turmas vinculados ao IFB – Campus Brasília.</p>
        </div>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          onClick={() => { setFormCurso(FORM_CURSO_VAZIO); setErrosCurso({}); }}
        >
          <Plus className="h-4 w-4" /> Novo Curso
        </Button>
      </div>

      {formCurso !== null && (
        <Card className="border-emerald-200 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">
              {formCurso.id ? "Editar Curso" : "Novo Curso"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">Nome do Curso *</Label>
                <Input
                  value={formCurso.nome}
                  onChange={(e) => setFormCurso((f) => f && ({ ...f, nome: e.target.value }))}
                  className={`border-slate-200 text-sm ${errosCurso.nome ? "border-red-400" : ""}`}
                  placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                />
                {errosCurso.nome && <p className="text-xs text-red-500">{errosCurso.nome}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">Código *</Label>
                <Input
                  value={formCurso.codigo}
                  onChange={(e) => setFormCurso((f) => f && ({ ...f, codigo: e.target.value }))}
                  className={`border-slate-200 text-sm ${errosCurso.codigo ? "border-red-400" : ""}`}
                  placeholder="Ex: ADS"
                />
                {errosCurso.codigo && <p className="text-xs text-red-500">{errosCurso.codigo}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSalvarCurso} className="bg-emerald-500 hover:bg-emerald-600 text-white">Salvar</Button>
              <Button variant="outline" onClick={() => setFormCurso(null)} className="border-slate-200 text-slate-600">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-slate-900">Lista de Cursos</CardTitle>
            <Badge variant="outline" className="text-xs text-slate-500">{cursos.length} curso(s)</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {cursos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <GraduationCap className="h-8 w-8" />
              <p className="text-sm font-medium">Nenhum curso cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cursos.map((curso) => {
                const aberto = expandidos.has(curso.id);
                return (
                  <div key={curso.id} className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white">
                      <button
                        onClick={() => toggleExpandido(curso.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {aberto ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm text-slate-900">{curso.nome}</span>
                        <span className="ml-2 text-xs text-slate-400">{curso.codigo}</span>
                      </div>
                      <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                        {curso.turmas.length} turma(s)
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline"
                          className="h-7 w-7 p-0 border-slate-200 text-slate-500 hover:bg-slate-50"
                          onClick={() => { setFormCurso({ id: curso.id, nome: curso.nome, codigo: curso.codigo }); setErrosCurso({}); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-red-200 text-red-500 hover:bg-red-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O curso <strong>{curso.nome}</strong> e todas as suas turmas serão removidos permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onExcluirCurso(curso.id)} className="bg-red-500 hover:bg-red-600 text-white">
                                Sim, excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {aberto && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
                        {curso.turmas.map((turma) => (
                          <div key={turma.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                            <span className="text-sm text-slate-700 flex-1">{turma.nome}</span>
                            <span className="text-xs text-slate-400">{turma.ano} · {turma.semestre}º sem.</span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-6 w-6 p-0 border-red-200 text-red-400 hover:bg-red-50">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir turma?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    A turma <strong>{turma.nome}</strong> será removida permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onExcluirTurma(curso.id, turma.id)} className="bg-red-500 hover:bg-red-600 text-white">
                                    Sim, excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ))}

                        {formTurma?.cursoId === curso.id ? (
                          <div className="rounded-lg border border-emerald-200 bg-white p-3 space-y-3">
                            <p className="text-xs font-medium text-slate-600">Nova Turma</p>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-3 space-y-1">
                                <Input
                                  value={formTurma.nome}
                                  onChange={(e) => setFormTurma((f) => f && ({ ...f, nome: e.target.value }))}
                                  placeholder="Nome da turma"
                                  className={`text-sm border-slate-200 ${errosTurma.nome ? "border-red-400" : ""}`}
                                />
                                {errosTurma.nome && <p className="text-xs text-red-500">{errosTurma.nome}</p>}
                              </div>
                              <div className="space-y-1">
                                <Input
                                  type="number"
                                  value={formTurma.ano}
                                  onChange={(e) => setFormTurma((f) => f && ({ ...f, ano: e.target.value }))}
                                  placeholder="Ano"
                                  className={`text-sm border-slate-200 ${errosTurma.ano ? "border-red-400" : ""}`}
                                />
                                {errosTurma.ano && <p className="text-xs text-red-500">{errosTurma.ano}</p>}
                              </div>
                              <select
                                value={formTurma.semestre}
                                onChange={(e) => setFormTurma((f) => f && ({ ...f, semestre: e.target.value as "1" | "2" }))}
                                className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="1">1º Semestre</option>
                                <option value="2">2º Semestre</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSalvarTurma} className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 text-xs">Salvar</Button>
                              <Button size="sm" variant="outline" onClick={() => setFormTurma(null)} className="border-slate-200 text-slate-600 h-7 text-xs">Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 text-xs h-8"
                            onClick={() => setFormTurma({ cursoId: curso.id, id: null, nome: "", ano: String(new Date().getFullYear()), semestre: "1" })}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Adicionar Turma
                          </Button>
                        )}
                      </div>
                    )}
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
