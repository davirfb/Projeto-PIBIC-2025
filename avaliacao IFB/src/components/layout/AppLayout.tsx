import type { ReactNode } from "react"
import { Sidebar } from "../shared/Sidebar"
import type { NavSection } from "../shared/Sidebar"
interface AppLayoutProps {
  children?: ReactNode
  onVoltarLogin?: () => void
  userName?: string
  userRoleLabel?: string
  navSections?: NavSection[]
}

export function AppLayout({
  children,
  onVoltarLogin,
  userName,
  userRoleLabel,
  navSections,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        onVoltarLogin={onVoltarLogin}
        userName={userName}
        userRoleLabel={userRoleLabel}
        navSections={navSections}
      />
      <main className="flex-1" aria-label="Conteudo principal">
        {children}
      </main>
    </div>
  )
}
