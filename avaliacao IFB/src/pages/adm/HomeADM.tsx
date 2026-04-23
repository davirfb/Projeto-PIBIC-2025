import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  Cog,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  Users,
  TrendingUp,
  Activity,
  Wrench,
} from "lucide-react";

type Section = "dashboard" | "usuarios" | "cursos" | "questionarios" | "logs" | "configuracoes";

interface HomeADMProps {
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

function DashboardView({ userName }: { userName?: string }) {
  const stats = [
    { label: "Usuários Cadastrados", value: "0", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Cursos Ativos", value: "0", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Questionários Ativos", value: "0", icon: ClipboardList, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Taxa de Participação", value: "—", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Bem-vindo, {userName ?? "Administrador"}
        </h1>
        <p className="text-slate-500 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">Nenhum dado ainda</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-base text-slate-900">Atividade Recente</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
            <p className="text-sm">Nenhuma atividade registrada.</p>
            <p className="text-xs">As ações dos usuários aparecerão aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HomeADM({ onLogout, userName }: HomeADMProps) {
  const [section, setSection] = useState<Section>("dashboard");

  const navSections = [
    {
      title: "Menu Principal",
      items: [
        {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          active: section === "dashboard",
          onClick: () => setSection("dashboard"),
        },
      ],
    },
    {
      title: "Administração",
      items: [
        {
          label: "Usuários",
          icon: <Users className="h-5 w-5" />,
          active: section === "usuarios",
          onClick: () => setSection("usuarios"),
        },
        {
          label: "Cursos e Turmas",
          icon: <GraduationCap className="h-5 w-5" />,
          active: section === "cursos",
          onClick: () => setSection("cursos"),
        },
        {
          label: "Questionários",
          icon: <ClipboardList className="h-5 w-5" />,
          active: section === "questionarios",
          onClick: () => setSection("questionarios"),
        },
        {
          label: "Logs de Auditoria",
          icon: <ScrollText className="h-5 w-5" />,
          active: section === "logs",
          onClick: () => setSection("logs"),
        },
        {
          label: "Configurações",
          icon: <Cog className="h-5 w-5" />,
          active: section === "configuracoes",
          onClick: () => setSection("configuracoes"),
        },
      ],
    },
  ];

  return (
    <AppLayout
      onVoltarLogin={onLogout}
      userName={userName}
      userRoleLabel="Administrador"
      navSections={navSections}
    >
      {section === "dashboard" && <DashboardView userName={userName} />}
      {section === "usuarios" && (
        <PendingSection title="Gestão de Usuários" description="Cadastre, edite e gerencie perfis dos usuários do sistema." />
      )}
      {section === "cursos" && (
        <PendingSection title="Cursos e Turmas" description="Gerencie os cursos e turmas vinculados ao IFB – Campus Brasília." />
      )}
      {section === "questionarios" && (
        <PendingSection title="Questionários" description="Acompanhe todos os questionários criados pelas Comissões." />
      )}
      {section === "logs" && (
        <PendingSection title="Logs de Auditoria" description="Visualize o histórico de ações e acessos no sistema." />
      )}
      {section === "configuracoes" && (
        <PendingSection title="Configurações" description="Configure parâmetros gerais da plataforma." />
      )}
    </AppLayout>
  );
}
