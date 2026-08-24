import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { UserSubType } from "@/types/user";

interface RegisterPageProps {
  onShowLogin: () => void;
}

const TIPO_LABELS: Record<UserSubType, string> = {
  aluno: "Aluno",
  professor: "Professor / Docente",
  coordenador: "Coordenador de Curso",
  tecnico_administrativo: "Técnico-Administrativo",
  outro: "Outro",
};

export function RegisterPage({ onShowLogin }: RegisterPageProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<UserSubType | "">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!nome.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!tipo) {
      setError("Selecione seu tipo de vínculo.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { nome: nome.trim(), tipo },
        },
      });

      if (signUpError) throw signUpError;

      // Se o Supabase retornou sessão imediatamente (confirmação de e-mail desativada),
      // insere a linha em usuarios agora. Caso contrário, o useAuth cria a linha
      // na primeira vez que loadSession for chamado após a confirmação.
      if (data.session && data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          nome: nome.trim(),
          role: "respondente",
          sub_type: tipo || null,
          ativo: true,
        });
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center px-6 py-10">
        <div className="max-w-md w-full">
          <Card className="bg-white shadow-lg shadow-slate-200/70 border-0 rounded-2xl text-center">
            <CardContent className="pt-10 pb-8 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Conta criada!
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Verifique seu e-mail para confirmar o cadastro. Após a
                confirmação, você poderá fazer login normalmente.
              </p>
              <Button
                className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                onClick={onShowLogin}
              >
                Ir para o login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center px-6 py-10">
      <div className="max-w-6xl w-full grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
        {/* Coluna esquerda */}
        <div className="space-y-10">
          <Badge className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium">
              Sistema de Avaliação Institucional
            </span>
          </Badge>
          <img src={logoIFB2} alt="Logo IFB" />
          <div className="space-y-6 max-w-xl">
            <h1 className="text-5xl font-semibold leading-tight text-slate-900">
              Crie sua conta e
              <br />
              <span className="text-emerald-500">participe das avaliações.</span>
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Cadastre-se com seu e-mail institucional para acessar os
              questionários do semestre e contribuir com a melhoria do IFB.
            </p>
          </div>
        </div>

        {/* Coluna direita: card de cadastro */}
        <Card className="bg-white shadow-lg shadow-slate-200/70 border-0 rounded-2xl">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Criar conta
            </CardTitle>
            <CardDescription className="text-slate-500">
              Preencha os dados abaixo para se cadastrar.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm text-slate-700">
                  Nome completo
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* E-mail */}
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
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Tipo de vínculo */}
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-sm text-slate-700">
                  Vínculo com o IFB
                </Label>
                <Select
                  value={tipo}
                  onValueChange={(v) => setTipo(v as UserSubType)}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="tipo"
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  >
                    <SelectValue placeholder="Selecione seu vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(TIPO_LABELS) as [UserSubType, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Senha */}
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-9 pr-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm text-slate-700"
                >
                  Confirmar senha
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita a senha"
                    className="pl-9 pr-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando conta...
                  </span>
                ) : (
                  "Criar conta"
                )}
              </Button>
              <p className="text-sm text-slate-500 text-center">
                Já tem conta?{" "}
                <button
                  type="button"
                  className="text-emerald-600 hover:underline font-medium"
                  onClick={onShowLogin}
                >
                  Fazer login
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
