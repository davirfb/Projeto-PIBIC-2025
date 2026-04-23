import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
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
}

export function Sidebar({
  onVoltarLogin,
  userName,
  userRoleLabel,
  navSections = [],
}: SidebarProps) {
  return (
    <aside className="flex h-screen w-[320px] flex-col border-r border-slate-300 bg-slate-100">
      <div className="border-b border-slate-300 p-6">
        <div className="flex items-center gap-3">
          <img src={logoIFB} alt="Logo IFB" className="h-10 w-auto" />

          <span className="text-2xl font-semibold tracking-tight text-slate-900">
            Avaliaçao IFB
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {navSections.map((section) => (
          <div key={section.title} className="mb-8 last:mb-0">
            <p className="mb-4 px-2 text-sm font-bold uppercase tracking-widest text-slate-600">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const baseClass =
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-1x1 font-medium";
                const activeClass = item.active
                  ? "border border-slate-300 bg-slate-200 text-emerald-600"
                  : "text-slate-600 hover:bg-slate-200";

                if (item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`${baseClass} ${activeClass}`}
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
                    onClick={item.onClick}
                    className={`${baseClass} ${activeClass} w-full text-left`}
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

      <div className="border-t border-slate-300 p-5">
        <div className="mb-4">
          <p className="text-2xl font-semibold text-slate-900">
            {userName ?? "Usuario IFB"}
          </p>
          <p className="text-sm text-slate-500">{userRoleLabel ?? "Usuario"}</p>
        </div>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-xl border border-slate-400 px-4 py-3 text-lg font-medium text-slate-600 hover:bg-red-300"
          onClick={onVoltarLogin}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
