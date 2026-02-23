import { useState } from "react";
import { Mail, Lock, Eye, X } from "lucide-react";
import logoIFB2 from "@/assets/logoIFB-home.svg";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LoginRole = "aluno" | "admin";
export interface LoginUser {
  role: LoginRole;
  email: string;
  name: string;
}

interface LoginPageProps {
  onLogin?: (user: LoginUser) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [courses, setCourses] = useState([{ id: 1, course: "", semester: "" }]);

  const updateCourse = (
    id: number,
    field: "course" | "semester",
    value: string,
  ) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: courses.length + 1, course: "", semester: "" },
    ]);
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  function getNameFromEmail(normalizedEmail: string, role: LoginRole) {
    const [localPart = ""] = normalizedEmail.split("@");
    if (!localPart)
      return role === "admin" ? "Administrador Geral" : "Aluno IFB";

    return localPart
      .split(".")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === "aluno@ifb.edu.br") {
      onLogin?.({
        role: "aluno",
        email: normalizedEmail,
        name: getNameFromEmail(normalizedEmail, "aluno"),
      });
      setError("");
      return;
    }

    if (normalizedEmail === "admin@ifb.edu.br") {
      onLogin?.({
        role: "admin",
        email: normalizedEmail,
        name: getNameFromEmail(normalizedEmail, "admin"),
      });
      setError("");
      return;
    }

    setError(
      "Credenciais inválidas. Use aluno@ifb.edu.br ou admin@ifb.edu.br.",
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center px-6 py-10">
      <div className="max-w-6xl w-full grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
        {/* Coluna esquerda: texto institucional */}
        <div className="space-y-10">
          <Badge className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium">
              Sistema de Avaliação Institucional
            </span>
          </Badge>
          <img src={logoIFB2} alt="Logo IFB" className="" />
          <div className="space-y-6 max-w-xl">
            <h1 className="text-5xl font-semibold leading-tight text-slate-900">
              Sua opinião constrói
              <br />
              <span className="text-emerald-500">uma educação melhor.</span>
            </h1>

            <p className="text-slate-500 text-lg leading-relaxed">
              Plataforma oficial para avaliação de cursos, docentes e
              infraestrutura. Faça login para participar das avaliações do
              semestre.
            </p>
          </div>

          <Card className="max-w-xs bg-white/80 border-emerald-50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Credenciais de Teste:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-xs font-mono">
              <p className="flex items-center justify-between gap-2">
                <span className="truncate text-slate-600">
                  aluno@ifb.edu.br
                </span>
                <span className="text-slate-400">(Aluno)</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="truncate text-slate-600">
                  admin@ifb.edu.br
                </span>
                <span className="text-slate-400">(Gestor)</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita: card de login */}
        <Card className="bg-white shadow-lg shadow-slate-200/70 border-0 rounded-2xl">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-slate-500">
              Digite suas credenciais institucionais para entrar.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-slate-700">
                  E-mail Institucional
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.nome@ifb.edu.br"
                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-slate-700">
                  Senha
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    type="password"
                    className="pl-9 pr-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Mostrar senha"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Entrar
              </Button>

              <div className="w-full text-center text-sm text-slate-500 space-y-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="link"
                      className="text-slate-500 hover:text-slate-600"
                    >
                      Cadastre-se
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Cadastro de Novo Usuário
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Para realizar seu cadastro no sistema de avaliação
                        institucional, Informe seu e-mail institucional e clique
                        em "Entrar em Contato".
                        <div className="space-y-1 pt-4">
                          <Label
                            htmlFor="email"
                            className="text-sm text-slate-700"
                          >
                            E-mail Institucional
                          </Label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                              <Mail className="h-4 w-4" />
                            </span>
                            <Input
                              id="email"
                              type="email"
                              placeholder="seu.nome@ifb.edu.br"
                              className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                              value={email}
                              onChange={(event) => setEmail(event.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1 pt-4">
                          <Label
                            htmlFor="create-password"
                            className="text-sm text-slate-700"
                          >
                            Crie uma senha
                          </Label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                              <Lock className="h-4 w-4" />
                            </span>
                            <Input
                              id="create-password"
                              type="password"
                              className="pl-9 pr-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                              value={createPassword}
                              onChange={(event) =>
                                setCreatePassword(event.target.value)
                              }
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                              aria-label="Mostrar senha"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 pt-4">
                          <Label
                            htmlFor="create-password"
                            className="text-sm text-slate-700"
                          >
                            Confirme sua senha
                          </Label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                              <Lock className="h-4 w-4" />
                            </span>
                            <Input
                              id="confirm-password"
                              type="password"
                              className="pl-9 pr-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                              value={confirmPassword}
                              onChange={(event) =>
                                setConfirmPassword(event.target.value)
                              }
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                              aria-label="Mostrar senha"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4 pt-4">
                          {courses.map((courseItem, index) => (
                            <div
                              key={courseItem.id}
                              className="space-y-1 relative"
                            >
                              {courses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCourse(courseItem.id)}
                                  className="absolute -top-2 -right-2 z-10 rounded-full bg-slate-200 hover:bg-slate-300 p-1 transition-colors"
                                  aria-label="Remover curso"
                                >
                                  <X className="h-4 w-4 text-slate-600" />
                                </button>
                              )}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <Label
                                    htmlFor={`curso-${courseItem.id}`}
                                    className="text-sm text-slate-700"
                                  >
                                    {index === 0
                                      ? "Informe o(s) curso(s)"
                                      : "Curso"}
                                  </Label>
                                  <Select
                                    value={courseItem.course}
                                    onValueChange={(value) =>
                                      updateCourse(
                                        courseItem.id,
                                        "course",
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="bg-slate-50 border-slate-200 focus-visible:bg-white">
                                      <SelectValue placeholder="Selecione um curso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="curso1">
                                        Análise e Desenvolvimento de Sistemas
                                      </SelectItem>
                                      <SelectItem value="curso2">
                                        Sistemas de Informação
                                      </SelectItem>
                                      <SelectItem value="curso3">
                                        Ciência da Computação
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    htmlFor={`semestre-${courseItem.id}`}
                                    className="text-sm text-slate-700"
                                  >
                                    {index === 0
                                      ? "Semestre atual"
                                      : "Semestre"}
                                  </Label>
                                  <Input
                                    id={`semestre-${courseItem.id}`}
                                    type="text"
                                    placeholder="Ex: 2024.1"
                                    className="bg-slate-50 border-slate-200 focus-visible:bg-white"
                                    value={courseItem.semester}
                                    onChange={(event) =>
                                      updateCourse(
                                        courseItem.id,
                                        "semester",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2 text-slate-600 border-slate-200 hover:bg-slate-50"
                            onClick={addCourse}
                          >
                            <span className="underline">
                              adicionar outro curso
                            </span>
                            <span className="ml-1">+</span>
                          </Button>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Fechar</AlertDialogCancel>
                      <Button
                        type="submit"
                        className="w-auto h-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                      >
                        Entrar em Contato
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs">
                  Problemas de acesso? Contate a secretaria acadêmica.
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
