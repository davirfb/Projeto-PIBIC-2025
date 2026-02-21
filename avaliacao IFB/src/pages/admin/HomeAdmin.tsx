import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HomeAdminProps {
  onVoltarLogin?: () => void
}

export function HomeAdmin({ onVoltarLogin }: HomeAdminProps) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center px-6 py-10">
      <div className="max-w-5xl w-full space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Sistema de Avaliação Institucional
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Painel do gestor
            </h1>
            <p className="text-slate-500">
              Gerencie cursos, docentes e acompanhe os resultados das avaliações.
            </p>
          </div>
          {onVoltarLogin && (
            <Button
              variant="outline"
              className="border-slate-200 text-slate-700"
              onClick={onVoltarLogin}
            >
              Sair
            </Button>
          )}
        </header>

        <Card className="bg-white border-0 shadow-md shadow-slate-200/70 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Visão geral
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-500">
            Esta é uma página de exemplo temporária para o fluxo do gestor
            (admin@ifb.edu.br). Aqui futuramente entrarão cards com estatísticas
            e gerenciamento das avaliações.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
