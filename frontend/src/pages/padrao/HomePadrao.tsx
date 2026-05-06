import { useState } from "react";
import { LogOut, CalendarDays, ClipboardCheck } from "lucide-react";
import logoIFB from "@/assets/logoIFB.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuestionario } from "@/context/QuestionarioContext";
import { ResponderView } from "@/pages/respondente/ResponderView";
import type { Resposta } from "@/types/resposta";
import type { UserRole } from "@/types/user";

interface HomePadraoProps {
  onLogout?: () => void;
  userName?: string;
  userId: string;
  userRole: UserRole;
}

export function HomePadrao({ onLogout, userName, userId, userRole }: HomePadraoProps) {
  const [respondendoId, setRespondendoId] = useState<string | null>(null);

  const { getQuestionariosVigentes, jaRespondeu, submeterResposta } = useQuestionario();

  const vigentes = getQuestionariosVigentes();
  const questionarioAtual = respondendoId
    ? vigentes.find((q) => q.id === respondendoId) ?? null
    : null;

  function handleSubmit(r: Resposta) {
    submeterResposta(r);
    setRespondendoId(null);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-300 bg-white px-8 py-4">
        <div className="flex items-center gap-3">
          <img src={logoIFB} alt="Logo IFB" className="h-9 w-auto" />
          <span className="text-xl font-semibold text-slate-900">Avaliação IFB</span>
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
        {questionarioAtual ? (
          <ResponderView
            questionario={questionarioAtual}
            respondentId={questionarioAtual.anonimo ? null : userId}
            respondentRole={userRole}
            onSubmit={handleSubmit}
            onCancelar={() => setRespondendoId(null)}
          />
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-slate-900 mb-6">
              Questionários Atribuídos
            </h1>
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-slate-700">
                    Disponíveis para resposta
                  </CardTitle>
                  <Badge variant="outline" className="text-xs text-slate-500">
                    {vigentes.length} disponível(is)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {vigentes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                    <ClipboardCheck className="h-8 w-8" />
                    <p className="text-sm font-medium">Nenhum questionário disponível no momento.</p>
                    <p className="text-xs">Quando um questionário for atribuído a você, ele aparecerá aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vigentes.map((q) => {
                      const jáRespondeu = jaRespondeu(userId, q.id);
                      return (
                        <div
                          key={q.id}
                          className="rounded-xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-4"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm truncate">{q.titulo}</h3>
                            {q.descricao && (
                              <p className="text-xs text-slate-500 line-clamp-1">{q.descricao}</p>
                            )}
                            <p className="flex items-center gap-1 text-xs text-slate-400">
                              <CalendarDays className="h-3 w-3" />
                              {q.dataInicio} → {q.dataFim}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {jáRespondeu ? (
                              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                Respondido
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={() => setRespondendoId(q.id)}
                              >
                                Responder
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
