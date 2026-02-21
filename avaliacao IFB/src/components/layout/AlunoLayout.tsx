import type { ReactNode } from "react"

interface AlunoLayoutProps {
  children: ReactNode
}

export function AlunoLayout({ children }: AlunoLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      {children}
    </div>
  )
}
