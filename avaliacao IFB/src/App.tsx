import { Button } from "./components/ui/button"

function App() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Avaliação IFB + <span className="text-primary">shadcn UI</span>
        </h1>
        <p className="text-muted-foreground">
          Interface já configurada com Tailwind e componentes no estilo shadcn.
        </p>
        <Button>Botão shadcn</Button>
      </div>
    </main>
  )
}

export default App

