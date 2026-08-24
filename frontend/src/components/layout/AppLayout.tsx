import { useState } from "react"
import type { ReactNode } from "react"
import { Sidebar } from "../shared/Sidebar"
import type { NavSection } from "../shared/Sidebar"
import { Menu } from "lucide-react"
import logoIFB from "@/assets/logoIFB.png"

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Mostra sinal de dica no hamburger até o usuário abrir o menu pela primeira vez
  const [showHint, setShowHint] = useState(() => {
    try { return localStorage.getItem("sidebar-hint-seen") !== "1" }
    catch { return true }
  })

  function handleHamburgerClick() {
    setSidebarOpen(true)
    if (showHint) {
      setShowHint(false)
      try { localStorage.setItem("sidebar-hint-seen", "1") } catch { /* noop */ }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — overlay fixo em mobile, estático em desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 sm:relative sm:z-auto sm:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <Sidebar
          onVoltarLogin={onVoltarLogin}
          userName={userName}
          userRoleLabel={userRoleLabel}
          navSections={navSections}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto min-w-0" aria-label="Conteúdo principal">
        {/* Header mobile com hamburger */}
        <div className="sm:hidden flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sticky top-0 z-10">
          <button
            type="button"
            onClick={handleHamburgerClick}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-5 w-5" />
            {/* Sinal de dica pulsante para primeira visita */}
            {showHint && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            )}
          </button>
          <img src={logoIFB} alt="Logo IFB" className="h-7 w-auto" />
          <span className="font-semibold text-slate-900 text-sm">Avaliação IFB</span>
        </div>
        {children}
      </main>
    </div>
  )
}
