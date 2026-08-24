import type { ReactNode } from "react";
import { LogOut, X } from "lucide-react";
import logoIFB from "@/assets/logoIFB.png";

export interface NavItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  onVoltarLogin?: () => void;
  userName?: string;
  userRoleLabel?: string;
  navSections?: NavSection[];
  onClose?: () => void;
}

export function Sidebar({
  onVoltarLogin,
  userName,
  userRoleLabel,
  navSections = [],
  onClose,
}: SidebarProps) {
  return (
    <aside className="flex h-screen w-[280px] sm:w-[300px] flex-col border-r border-slate-300 bg-slate-100">
      <div className="border-b border-slate-300 p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoIFB} alt="Logo IFB" className="h-8 sm:h-10 w-auto" />
          <span className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900">
            Avaliação IFB
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="sm:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6 sm:mb-8 last:mb-0">
            <p className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const baseClass =
                  "flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium w-full text-left transition-colors";
                const activeClass = item.active
                  ? "border border-slate-300 bg-slate-200 text-emerald-600"
                  : "text-slate-600 hover:bg-slate-200";

                function handleClick() {
                  item.onClick?.();
                  onClose?.();
                }

                if (item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`${baseClass} ${activeClass}`}
                      onClick={onClose}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={handleClick}
                    className={`${baseClass} ${activeClass}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-300 p-4 sm:p-5">
        <div className="mb-3">
          <p className="text-lg sm:text-2xl font-semibold text-slate-900 truncate">
            {userName ?? "Usuário IFB"}
          </p>
          <p className="text-sm text-slate-500">{userRoleLabel ?? "Usuário"}</p>
        </div>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-xl border border-slate-400 px-4 py-3 text-sm sm:text-base font-medium text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors"
          onClick={onVoltarLogin}
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
