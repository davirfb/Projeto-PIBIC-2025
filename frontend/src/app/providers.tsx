import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Aqui podem ser adicionados providers como ThemeProvider, QueryClient, etc.
  return <>{children}</>
}
