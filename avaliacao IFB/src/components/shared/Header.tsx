import type { ReactNode } from "react"

interface HeaderProps {
  title?: string
  subtitle?: string
  description?: string
  badge?: string
  action?: ReactNode
  children?: ReactNode
}

export function Header({ 
  title, 
  subtitle, 
  description, 
  badge, 
  action, 
  children 
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        {badge && (
          <p className="text-sm font-medium text-emerald-600">
            {badge}
          </p>
        )}
        {title && (
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {title}
          </h1>
        )}
        {subtitle && (
          <h2 className="mt-1 text-xl font-medium text-slate-700">
            {subtitle}
          </h2>
        )}
        {description && (
          <p className="text-slate-500 mt-1">
            {description}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </header>
  )
}
