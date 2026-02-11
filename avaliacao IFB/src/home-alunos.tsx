import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HomeAlunosProps {
  onVoltarLogin?: () => void
}

export function HomeAlunos({ onVoltarLogin }: HomeAlunosProps) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center px-6 py-10">
      <div className="max-w-5xl w-full space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Sistema de Avaliação Institucional
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Bem-vindo, aluno!
            </h1>
            <p className="text-slate-500">
              Aqui você visualiza e responde às avaliações disponíveis para suas
              disciplinas.
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
              Avaliações do semestre
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-500">
            Nenhuma avaliação cadastrada ainda. Esta é uma página de exemplo
            temporária para o fluxo de alunos.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

