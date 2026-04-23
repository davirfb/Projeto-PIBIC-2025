import { LogOut } from "lucide-react";
import logoIFB from "@/assets/logoIFB.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HomePadraoProps {
  onLogout?: () => void;
  userName?: string;
}

export function HomePadrao({ onLogout, userName }: HomePadraoProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-300 bg-white px-8 py-4">
        <div className="flex items-center gap-3">
          <img src={logoIFB} alt="Logo IFB" className="h-9 w-auto" />
          <span className="text-xl font-semibold text-slate-900">
            Avaliação IFB
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{userName ?? "Usuário IFB"}</span>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 px-8 py-10 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">
          Questionários Atribuídos
        </h1>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-700">
              Nenhum questionário disponível no momento.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Quando um questionário for atribuído a você, ele aparecerá aqui.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
