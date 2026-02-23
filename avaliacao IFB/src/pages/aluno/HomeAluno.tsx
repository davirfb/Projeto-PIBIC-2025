import { AppLayout } from "@/components/layout/AppLayout";
import { ClipboardList, UserRound } from "lucide-react";

interface HomeAlunoProps {
  onVoltarLogin?: () => void;
  userName?: string;
  userRoleLabel?: string;
}

export function HomeAluno({
  onVoltarLogin,
  userName,
  userRoleLabel,
}: HomeAlunoProps) {
  const navSections = [
    {
      title: "Menu Principal",
      items: [
        {
          label: "Minhas Avaliacoes",
          href: "#",
          icon: <ClipboardList className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Conta",
      items: [
        {
          label: "Perfil",
          href: "#",
          icon: <UserRound className="h-5 w-5" />,
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
