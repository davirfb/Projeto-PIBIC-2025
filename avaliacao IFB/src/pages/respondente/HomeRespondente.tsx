import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  ClipboardList,
  History,
  UserRound,
  ClipboardCheck,
  Wrench,
} from "lucide-react";

type Section = "disponiveis" | "historico" | "notificacoes" | "perfil";

interface HomeRespondentProps {
  onLogout?: () => void;
  userName?: string;
}

function PendingSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-slate-500 text-sm mb-8">{description}</p>
      <div className="flex flex-col items-center justify-center h-52 rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 gap-3">
        <Wrench className="h-8 w-8" />
        <p className="text-sm font-medium">Em desenvolvimento — disponível na próxima etapa</p>
      </div>
    </div>
  );
}

function DisponiveisView({ userName }: { userName?: string }) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Olá, {userName ?? "Respondente"}
        </h1>
        <p className="text-slate-500 mt-1">Aqui estão os questionários disponíveis para você</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pendentes</CardTitle>
            <div className="rounded-lg p-2 bg-amber-50">
              <ClipboardList className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-xs text-slate-400 mt-1">Nenhum questionário pendente</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Respondidos</CardTitle>
            <div className="rounded-lg p-2 bg-emerald-50">
              <ClipboardCheck className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-xs text-slate-400 mt-1">Nenhuma resposta registrada</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Notificações</CardTitle>
            <div className="rounded-lg p-2 bg-blue-50">
              <Bell className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-xs text-slate-400 mt-1">Sem novas notificações</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-slate-900">Questionários Disponíveis</CardTitle>
            <Badge variant="outline" className="text-xs text-slate-500">
              0 disponíveis
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
            <ClipboardCheck className="h-8 w-8" />
            <p className="text-sm font-medium">Nenhum questionário disponível no momento.</p>
            <p className="text-xs">Você será notificado quando novos questionários forem publicados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HomeRespondente({ onLogout, userName }: HomeRespondentProps) {
  const [section, setSection] = useState<Section>("disponiveis");

  const navSections = [
    {
      title: "Avaliações",
      items: [
        {
          label: "Questionários Disponíveis",
          icon: <ClipboardList className="h-5 w-5" />,
          active: section === "disponiveis",
          onClick: () => setSection("disponiveis"),
        },
        {
          label: "Histórico",
          icon: <History className="h-5 w-5" />,
          active: section === "historico",
          onClick: () => setSection("historico"),
        },
        {
          label: "Notificações",
          icon: <Bell className="h-5 w-5" />,
          active: section === "notificacoes",
          onClick: () => setSection("notificacoes"),
        },
      ],
    },
    {
      title: "Conta",
      items: [
        {
          label: "Perfil",
          icon: <UserRound className="h-5 w-5" />,
          active: section === "perfil",
          onClick: () => setSection("perfil"),
        },
      ],
    },
  ];

  return (
    <AppLayout
      onVoltarLogin={onLogout}
      userName={userName}
      userRoleLabel="Respondente"
      navSections={navSections}
    >
      {section === "disponiveis" && <DisponiveisView userName={userName} />}
      {section === "historico" && (
        <PendingSection
          title="Histórico de Participação"
          description="Consulte os questionários que você já respondeu."
        />
      )}
      {section === "notificacoes" && (
        <PendingSection
          title="Notificações"
          description="Alertas sobre novos questionários e prazos de encerramento."
        />
      )}
      {section === "perfil" && (
        <PendingSection
          title="Perfil"
          description="Visualize e atualize suas informações cadastrais."
        />
      )}
    </AppLayout>
  );
}
