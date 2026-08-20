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
import { Plus, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import type { UsuarioAdm, Curso } from "@/types/adm";
import type { UserTipo, NivelAcesso } from "@/types/user";

interface UsuariosViewProps {
  usuarios: UsuarioAdm[];
  cursos: Curso[];
  onSalvar: (u: UsuarioAdm, senha: string) => void;
  onExcluir: (id: string) => void;
  onToggleAtivo: (id: string) => void;
}

const TIPO_CONFIG: Record<UserTipo, { label: string; color: string }> = {
  aluno: { label: "Aluno", color: "bg-blue-50 text-blue-700 border-blue-200" },
  professor: { label: "Professor", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  coordenador: { label: "Coordenador", color: "bg-purple-50 text-purple-700 border-purple-200" },
  tecnico_administrativo: { label: "Técnico-Adm.", color: "bg-amber-50 text-amber-700 border-amber-200" },
  outro: { label: "Outro", color: "bg-slate-100 text-slate-600 border-slate-300" },
};

const TIPO_OPCOES: { value: UserTipo; label: string }[] = [
  { value: "aluno", label: "Aluno" },
  { value: "professor", label: "Professor" },
  { value: "coordenador", label: "Coordenador" },
  { value: "tecnico_administrativo", label: "Técnico-Administrativo" },
  { value: "outro", label: "Outro" },
];

interface FormState {
  id: string | null;
  nome: string;
  email: string;
  tipo: UserTipo;
  nivelAcesso: NivelAcesso;
  isAdm: boolean;
  matricula: string;
  senha: string;
  cursoIds: string[];
}

const FORM_VAZIO: FormState = {
  id: null,
  nome: "",
  email: "",
  tipo: "professor",
  nivelAcesso: "respondente",
  isAdm: false,
  matricula: "",
  senha: "",
  cursoIds: [],
};

function toggleCurso(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((c) => c !== id) : [...ids, id];
}

export function UsuariosView({ usuarios, cursos, onSalvar, onExcluir, onToggleAtivo }: UsuariosViewProps) {
  const [form, setForm] = useState<FormState | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  function abrirNovo() {
    setForm(FORM_VAZIO);
    setErros({});
  }

  function abrirEditar(u: UsuarioAdm) {
    setForm({
      id: u.id,
      nome: u.nome,
      email: u.email,
      tipo: u.tipo,
      nivelAcesso: u.nivelAcesso,
      isAdm: u.isAdm,
      matricula: u.matricula ?? "",
      senha: "",
      cursoIds: u.cursoIds,
    });
    setErros({});
  }

  function fechar() {
    setForm(null);
    setErros({});
  }

  function handleSalvar() {
    if (!form) return;
    const novosErros: Record<string, string> = {};
    if (!form.nome.trim()) novosErros.nome = "Nome é obrigatório.";
    if (!form.email.trim()) novosErros.email = "E-mail é obrigatório.";
    if (!form.id && !form.senha.trim()) novosErros.senha = "Senha é obrigatória para novo usuário.";
    const emailDuplicado = usuarios.some(
      (u) => u.email === form.email.trim() && u.id !== form.id,
    );
    if (emailDuplicado) novosErros.email = "Este e-mail já está cadastrado.";
    if (form.tipo === "aluno" && !form.matricula.trim()) {
      novosErros.matricula = "Matrícula é obrigatória para alunos.";
    }
    if (form.cursoIds.length === 0) {
      novosErros.cursos = "Selecione ao menos um curso.";
    }
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return; }

    const usuario: UsuarioAdm = {
      id: form.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nome: form.nome.trim(),
      email: form.email.trim(),
      tipo: form.tipo,
      nivelAcesso: form.nivelAcesso,
      isAdm: form.isAdm,
      matricula: form.tipo === "aluno" ? form.matricula.trim() : undefined,
      cursoIds: form.cursoIds,
      ativo: true,
      criadoEm: form.id
        ? (usuarios.find((u) => u.id === form.id)?.criadoEm ?? new Date().toISOString())
        : new Date().toISOString(),
    };
    onSalvar(usuario, form.senha);
    fechar();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-1">Cadastre, edite e gerencie os usuários do sistema.</p>
        </div>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          onClick={abrirNovo}
        >
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      {form !== null && (
        <Card className="border-emerald-200 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">
              {form.id ? "Editar Usuário" : "Novo Usuário"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">Nome *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((f) => f && ({ ...f, nome: e.target.value }))}
                  className={`border-slate-200 text-sm ${erros.nome ? "border-red-400" : ""}`}
                  placeholder="Nome completo"
                />
                {erros.nome && <p className="text-xs text-red-500">{erros.nome}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">E-mail *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => f && ({ ...f, email: e.target.value }))}
                  className={`border-slate-200 text-sm ${erros.email ? "border-red-400" : ""}`}
                  placeholder="usuario@ifb.edu.br"
                />
                {erros.email && <p className="text-xs text-red-500">{erros.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">Tipo Institucional *</Label>
                <select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((f) => f && ({
                      ...f,
                      tipo: e.target.value as UserTipo,
                      nivelAcesso: e.target.value === "aluno" ? "padrao" : "respondente",
                      matricula: "",
                    }))
                  }
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {TIPO_OPCOES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">Nível de Acesso *</Label>
                <select
                  value={form.nivelAcesso}
                  onChange={(e) => setForm((f) => f && ({ ...f, nivelAcesso: e.target.value as NivelAcesso }))}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="padrao">Padrão (login + resposta)</option>
                  <option value="respondente">Respondente (painel completo)</option>
                </select>
              </div>

              {form.tipo === "aluno" && (
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Matrícula *</Label>
                  <Input
                    value={form.matricula}
                    onChange={(e) => setForm((f) => f && ({ ...f, matricula: e.target.value }))}
                    className={`border-slate-200 text-sm ${erros.matricula ? "border-red-400" : ""}`}
                    placeholder="Ex: 2024001"
                  />
                  {erros.matricula && <p className="text-xs text-red-500">{erros.matricula}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">Senha {form.id ? "(deixe em branco para manter)" : "*"}</Label>
                <Input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm((f) => f && ({ ...f, senha: e.target.value }))}
                  className={`border-slate-200 text-sm ${erros.senha ? "border-red-400" : ""}`}
                  placeholder="••••••••"
                />
                {erros.senha && <p className="text-xs text-red-500">{erros.senha}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isAdm}
                    onChange={(e) => setForm((f) => f && ({ ...f, isAdm: e.target.checked }))}
                    className="accent-emerald-500 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">Administrador do sistema</span>
                  <span className="text-xs text-slate-400">(acesso irrestrito ao painel ADM)</span>
                </label>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label className="text-sm text-slate-600">Cursos Vinculados *</Label>
              <p className="text-xs text-slate-400">Selecione os cursos aos quais este usuário pertence.</p>
              {cursos.length === 0 ? (
                <p className="text-xs text-amber-500">Nenhum curso cadastrado. Cadastre cursos primeiro.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                  {cursos.map((c) => {
                    const selecionado = form.cursoIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer text-sm transition-colors ${
                          selecionado
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() =>
                            setForm((f) => f && ({ ...f, cursoIds: toggleCurso(f.cursoIds, c.id) }))
                          }
                          className="accent-emerald-500"
                        />
                        <span className="flex-1 truncate">{c.nome}</span>
                        <span className="text-xs text-slate-400">{c.codigo}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {erros.cursos && <p className="text-xs text-red-500">{erros.cursos}</p>}
            </div>

            <div className="flex gap-3 mt-5">
              <Button onClick={handleSalvar} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Salvar
              </Button>
              <Button variant="outline" onClick={fechar} className="border-slate-200 text-slate-600">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-slate-900">Usuários Cadastrados</CardTitle>
            <Badge variant="outline" className="text-xs text-slate-500">
              {usuarios.length} usuário(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <p className="text-sm font-medium">Nenhum usuário cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {usuarios.map((u) => {
                const { label, color } = TIPO_CONFIG[u.tipo];
                const cursosVinculados = u.cursoIds
                  .map((id) => cursos.find((c) => c.id === id)?.nome)
                  .filter(Boolean);
                return (
                  <div
                    key={u.id}
                    className={`rounded-xl border px-4 py-3 flex items-center gap-4 ${u.ativo ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-70"}`}
                  >
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-slate-900">{u.nome}</span>
                        <Badge variant="outline" className={`text-xs ${color}`}>{label}</Badge>
                        {u.isAdm && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">ADM</Badge>
                        )}
                        <Badge variant="outline" className={`text-xs ${u.nivelAcesso === "respondente" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          {u.nivelAcesso === "respondente" ? "Respondente" : "Padrão"}
                        </Badge>
                        {!u.ativo && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-500 border-red-200">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{u.email}</p>
                      {u.matricula && (
                        <p className="text-xs text-slate-400">Matrícula: {u.matricula}</p>
                      )}
                      {cursosVinculados.length > 0 && (
                        <p className="text-xs text-slate-400">
                          Cursos: {cursosVinculados.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 border-slate-200 text-slate-500 hover:bg-slate-50"
                        onClick={() => abrirEditar(u)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-7 w-7 p-0 border-slate-200 ${u.ativo ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                        onClick={() => onToggleAtivo(u.id)}
                        title={u.ativo ? "Desativar" : "Ativar"}
                      >
                        {u.ativo ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 border-red-200 text-red-500 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O usuário <strong>{u.nome}</strong> ({u.email}) será removido permanentemente. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onExcluir(u.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Sim, excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
