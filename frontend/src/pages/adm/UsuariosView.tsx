import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { UserRole, UserSubType } from "@/types/user";

interface UsuariosViewProps {
  usuarios: UsuarioAdm[];
  cursos: Curso[];
  onSalvar: (u: UsuarioAdm, senha: string) => void;
  onExcluir: (id: string) => void;
  onToggleAtivo: (id: string) => void;
}

const PERFIL_CONFIG: Record<UserRole, { label: string; color: string }> = {
  adm: { label: "ADM", color: "bg-purple-50 text-purple-700 border-purple-200" },
  comissao: { label: "Comissão", color: "bg-blue-50 text-blue-700 border-blue-200" },
  respondente: { label: "Respondente", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  padrao: { label: "Padrão", color: "bg-slate-100 text-slate-600 border-slate-300" },
};

const SUBTIPO_LABEL: Record<UserSubType, string> = {
  aluno: "Aluno",
  professor: "Professor",
  coordenador: "Coordenador",
  tecnico_administrativo: "Técnico-Administrativo",
  outro: "Outro",
};

const PERFIL_OPCOES: { value: UserRole; label: string }[] = [
  { value: "adm", label: "ADM" },
  { value: "comissao", label: "Comissão" },
  { value: "respondente", label: "Respondente" },
  { value: "padrao", label: "Padrão" },
];

const SUBTIPO_OPCOES: { value: UserSubType; label: string }[] = [
  { value: "aluno", label: "Aluno" },
  { value: "professor", label: "Professor" },
  { value: "coordenador", label: "Coordenador" },
  { value: "tecnico_administrativo", label: "Técnico-Administrativo" },
  { value: "outro", label: "Outro" },
];

const PERFIS_COM_CURSO: UserRole[] = ["comissao", "respondente", "padrao"];

interface FormState {
  id: string | null;
  nome: string;
  email: string;
  perfil: UserRole;
  subTipo: UserSubType | "";
  senha: string;
  cursoIds: string[];
}

const FORM_VAZIO: FormState = {
  id: null,
  nome: "",
  email: "",
  perfil: "respondente",
  subTipo: "",
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
      perfil: u.perfil,
      subTipo: u.subTipo ?? "",
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
    if (PERFIS_COM_CURSO.includes(form.perfil) && form.cursoIds.length === 0) {
      novosErros.cursos = "Selecione ao menos um curso.";
    }
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return; }

    const usuario: UsuarioAdm = {
      id: form.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nome: form.nome.trim(),
      email: form.email.trim(),
      perfil: form.perfil,
      subTipo: form.subTipo || undefined,
      cursoIds: PERFIS_COM_CURSO.includes(form.perfil) ? form.cursoIds : [],
      ativo: true,
      criadoEm: form.id
        ? (usuarios.find((u) => u.id === form.id)?.criadoEm ?? new Date().toISOString())
        : new Date().toISOString(),
    };
    onSalvar(usuario, form.senha);
    fechar();
  }

  const precisaCurso = form !== null && PERFIS_COM_CURSO.includes(form.perfil);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-1">Cadastre, edite e gerencie perfis dos usuários do sistema.</p>
        </div>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          onClick={abrirNovo}
        >
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      {/* Modal de criação/edição */}
      <Dialog open={form !== null} onOpenChange={(open) => { if (!open) fechar(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {form?.id
                ? "Altere os dados do usuário. Deixe a senha em branco para mantê-la."
                : "Preencha os dados para criar um novo usuário no sistema."}
            </DialogDescription>
          </DialogHeader>

          {form && (
            <div className="space-y-5 py-2">
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
                    disabled={!!form.id}
                    className={`border-slate-200 text-sm ${erros.email ? "border-red-400" : ""} ${form.id ? "bg-slate-50 text-slate-400" : ""}`}
                    placeholder="usuario@ifb.edu.br"
                  />
                  {erros.email && <p className="text-xs text-red-500">{erros.email}</p>}
                  {form.id && (
                    <p className="text-xs text-slate-400">O e-mail não pode ser alterado após a criação.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Perfil *</Label>
                  <select
                    value={form.perfil}
                    onChange={(e) =>
                      setForm((f) => f && ({ ...f, perfil: e.target.value as UserRole, cursoIds: [] }))
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PERFIL_OPCOES.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Sub-tipo</Label>
                  <select
                    value={form.subTipo}
                    onChange={(e) => setForm((f) => f && ({ ...f, subTipo: e.target.value as UserSubType | "" }))}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Nenhum</option>
                    {SUBTIPO_OPCOES.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm text-slate-600">
                    Senha {form.id ? "(deixe em branco para manter)" : "*"}
                  </Label>
                  <Input
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm((f) => f && ({ ...f, senha: e.target.value }))}
                    className={`border-slate-200 text-sm ${erros.senha ? "border-red-400" : ""}`}
                    placeholder="••••••••"
                  />
                  {erros.senha && <p className="text-xs text-red-500">{erros.senha}</p>}
                </div>
              </div>

              {precisaCurso && (
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600">
                    {form.perfil === "comissao" ? "Cursos da Comissão *" : "Cursos Vinculados *"}
                  </Label>
                  <p className="text-xs text-slate-400">
                    {form.perfil === "comissao"
                      ? "Selecione os cursos que este membro irá comissionar."
                      : "Selecione os cursos aos quais este usuário pertence."}
                  </p>
                  {cursos.length === 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-xs text-amber-700 font-medium">Nenhum curso cadastrado.</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Cadastre cursos em <strong>Cursos e Turmas</strong> antes de vincular usuários.
                      </p>
                    </div>
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
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={fechar} className="border-slate-200 text-slate-600">
              Cancelar
            </Button>
            <Button onClick={handleSalvar} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {form?.id ? "Salvar alterações" : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista de usuários */}
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
                const { label, color } = PERFIL_CONFIG[u.perfil];
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
                        {u.subTipo && (
                          <span className="text-xs text-slate-400">{SUBTIPO_LABEL[u.subTipo]}</span>
                        )}
                        {!u.ativo && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-500 border-red-200">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{u.email}</p>
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
