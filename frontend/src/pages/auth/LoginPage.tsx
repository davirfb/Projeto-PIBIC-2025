import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, Loader2 } from "lucide-react";
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
import { api } from "@/services/api";
import type { AuthUser } from "@/hooks/useAuth";

interface LoginPageProps {
  onLogin?: (token: string, user: AuthUser) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(email.trim().toLowerCase(), password);
      onLogin?.(data.access_token, {
        id: data.user.id,
        email: data.user.email,
        name: data.user.nome,
        role: data.user.role,
        subType: data.user.sub_type ?? undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao conectar com o servidor."
      );
    } finally {
      setLoading(false);
    }
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
                    disabled={loading}
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
                    disabled={loading}
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
                disabled={loading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Problemas de acesso? Contate a secretaria acadêmica.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
