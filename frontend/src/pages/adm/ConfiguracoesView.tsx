import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import type { Configuracoes } from "@/types/adm";

interface ConfiguracoesViewProps {
  config: Configuracoes;
  onSalvar: (c: Configuracoes) => void;
}

export function ConfiguracoesView({ config, onSalvar }: ConfiguracoesViewProps) {
  const [form, setForm] = useState<Configuracoes>(config);
  const [salvo, setSalvo] = useState(false);

  function handleChange(campo: keyof Configuracoes, valor: string | number) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setSalvo(false);
  }

  function handleSalvar() {
    onSalvar(form);
    setSalvo(true);
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">Parâmetros gerais da plataforma de avaliação.</p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Informações da Instituição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm text-slate-600">Nome da Instituição</Label>
            <Input
              value={form.nomeInstituicao}
              onChange={(e) => handleChange("nomeInstituicao", e.target.value)}
              className="border-slate-200 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-slate-600">Campus</Label>
            <Input
              value={form.campus}
              onChange={(e) => handleChange("campus", e.target.value)}
              className="border-slate-200 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-slate-600">E-mail de Suporte</Label>
            <Input
              type="email"
              value={form.emailSuporte}
              onChange={(e) => handleChange("emailSuporte", e.target.value)}
              className="border-slate-200 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-slate-600">
              Limiar de Participação (%)
            </Label>
            <p className="text-xs text-slate-400">
              Percentual mínimo de participação antes de emitir alerta à Comissão.
            </p>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.limiarParticipacao}
              onChange={(e) => handleChange("limiarParticipacao", Number(e.target.value))}
              className="border-slate-200 text-sm w-32"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              onClick={handleSalvar}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Salvar Configurações
            </Button>
            {salvo && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Configurações salvas com sucesso.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
