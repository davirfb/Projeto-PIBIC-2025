import { AppLayout } from "@/components/layout/AppLayout";
import {
  ClipboardList,
  Cog,
  GraduationCap,
  LayoutDashboard,
  Users,
} from "lucide-react";

interface HomeAdminProps {
  onVoltarLogin?: () => void;
  userName?: string;
  userRoleLabel?: string;
}
export function HomeAdmin({
  onVoltarLogin,
  userName,
  userRoleLabel,
}: HomeAdminProps) {
  const navSections = [
    {
      title: "Menu Principal",
      items: [
        {
          label: "Dashboard",
          href: "#",
          icon: <LayoutDashboard className="h-5 w-5" />,
          active: true,
        },
        {
          label: "Questionarios",
          href: "#",
          icon: <ClipboardList className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Administracao",
      items: [
        {
          label: "Usuarios",
          href: "#",
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: "Cursos",
          href: "#",
          icon: <GraduationCap className="h-5 w-5" />,
        },
        {
          label: "Configuracoes",
          href: "#",
          icon: <Cog className="h-5 w-5" />,
        },
      ],
    },
  ];

  return (
    <AppLayout
      onVoltarLogin={onVoltarLogin}
      userName={userName}
      userRoleLabel={userRoleLabel}
      navSections={navSections}
    />
  );
}
