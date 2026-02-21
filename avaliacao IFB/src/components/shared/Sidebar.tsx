import type { ReactNode } from "react"

interface SidebarProps {
  children?: ReactNode
  className?: string
  width?: "sm" | "md" | "lg" | "xl"
}

const widthClasses = {
  sm: "w-48",
  md: "w-64",
  lg: "w-80",
  xl: "w-96",
}

export function Sidebar({ 
  children, 
  className = "",
  width = "md" 
}: SidebarProps) {
  return (
    <aside className={`${widthClasses[width]} bg-white border-r border-slate-200 ${className}`}>
      <div className="p-4">
        {children}
      </div>
    </aside>
  )
}
